import { NextResponse } from 'next/server';
import { estConnecte } from '@/lib/auth';
import { CONSERVATION_JOURS, deposer, ecrireFiche, lireFiche, nomSur } from '@/lib/stockage';
import { referenceValide } from '@/lib/commande';
import { envoyerLivraison } from '@/lib/email';

export const runtime = 'nodejs';

/* Dépôt des traductions terminées, et livraison au client.

   Remplace le geste manuel : rattacher les PDF à un message, réécrire le
   récapitulatif, retrouver la date de suppression. Tout se fait ici, et la
   commande passe en « livrée » dans le même mouvement.

   La livraison n'est pas idempotente au sens strict : redéposer des fichiers
   sur une commande déjà livrée renvoie un nouveau message. C'est voulu — c'est
   ainsi qu'on corrige une traduction fautive. */

const TAILLE_MAX = 25 * 1024 * 1024; // par fichier

/** Un PDF commence par « %PDF- ». On lit les octets plutôt que le type déclaré. */
function estPdf(octets: Buffer) {
  return octets.subarray(0, 5).toString('latin1') === '%PDF-';
}

export async function POST(requete: Request) {
  if (!(await estConnecte())) {
    return NextResponse.json({ erreur: 'Accès refusé.' }, { status: 401 });
  }

  let donnees: FormData;
  try {
    donnees = await requete.formData();
  } catch {
    return NextResponse.json({ erreur: 'Requête illisible.' }, { status: 400 });
  }

  const ref = String(donnees.get('reference') ?? '').trim();
  if (!referenceValide(ref)) {
    return NextResponse.json({ erreur: 'Référence invalide.' }, { status: 400 });
  }

  const fichiers = donnees.getAll('fichiers').filter((f): f is File => f instanceof File);
  if (fichiers.length === 0) {
    return NextResponse.json({ erreur: 'Aucun fichier reçu.' }, { status: 400 });
  }

  // Lecture et contrôle avant toute écriture : inutile de déposer la moitié
  // d'une livraison pour refuser la seconde.
  const pieces: { nom: string; contenu: Buffer }[] = [];
  for (const f of fichiers) {
    if (f.size > TAILLE_MAX) {
      return NextResponse.json({ erreur: `« ${f.name} » dépasse 25 Mo.` }, { status: 400 });
    }
    const octets = Buffer.from(await f.arrayBuffer());
    if (!estPdf(octets)) {
      return NextResponse.json(
        { erreur: `« ${f.name} » n'est pas un PDF. La livraison n'accepte que des PDF.` },
        { status: 400 },
      );
    }
    pieces.push({ nom: f.name, contenu: octets });
  }

  let fiche;
  try {
    fiche = await lireFiche(`commandes/${ref}/commande.json`);
  } catch {
    return NextResponse.json({ erreur: 'Commande introuvable.' }, { status: 404 });
  }

  /* On ne livre pas une commande impayée : ce serait travailler et remettre
     un document sans encaissement, et le client recevrait une confirmation
     qui n'a jamais été réglée. */
  if (fiche.statut !== 'payee' && fiche.statut !== 'livree') {
    return NextResponse.json(
      { erreur: `Commande au statut « ${fiche.statut ?? 'inconnu'} » : livraison refusée.` },
      { status: 409 },
    );
  }

  let cles: string[];
  try {
    cles = [];
    for (const [i, p] of pieces.entries()) {
      const cle = `commandes/${ref}/traductions/${String(i + 1).padStart(2, '0')}-${nomSur(p.nom)}`;
      await deposer(cle, p.contenu, 'application/pdf');
      cles.push(cle);
    }
  } catch (e) {
    console.error('[livrer] échec du stockage', e);
    return NextResponse.json({ erreur: "Le dépôt des traductions a échoué." }, { status: 500 });
  }

  /* La date de suppression court depuis le dépôt du client, pas depuis la
     livraison : c'est ce qu'annoncent les CGV et la politique de
     confidentialité, et le client doit lire la même date partout. */
  const depart = fiche.recuLe ? new Date(fiche.recuLe) : new Date();
  const jusquAu = new Date(depart.getTime() + CONSERVATION_JOURS * 24 * 3600 * 1000);

  const envoi = await envoyerLivraison(
    {
      reference: fiche.reference ?? ref,
      client: fiche.client ?? { email: '', prenom: '', nom: '' },
      langues: fiche.langues ?? { source: '—', cible: '—' },
      pages: fiche.pages ?? 0,
      montant: fiche.montant ?? 0,
      envoiPostal: fiche.envoiPostal,
      adressePostale: fiche.adressePostale,
    },
    pieces,
    jusquAu,
  );

  await ecrireFiche(ref, {
    ...fiche,
    statut: 'livree',
    livreLe: new Date().toISOString(),
    traductions: pieces.map((p, i) => ({ nom: p.nom, cle: cles[i], taille: p.contenu.length })),
    clesTraductions: cles,
    livraisonEmail: envoi,
  });

  return NextResponse.json({
    reference: ref,
    deposees: pieces.length,
    supprimeLe: jusquAu.toISOString(),
    email: envoi,
  });
}

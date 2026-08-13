import { NextResponse } from 'next/server';
import { MAX_DOCS, PRIX_OFFRE } from '@/lib/data';
import { deposer, ecrireFiche, nomSur, stockageConfigure } from '@/lib/stockage';
import { envoyerEmails, type PieceJointe } from '@/lib/email';

export const runtime = 'nodejs';

const TAILLE_MAX = 10 * 1024 * 1024; // 10 Mo par fichier
const TYPES_OK = ['application/pdf', 'image/'];
const emailValide = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

/** Référence lisible : PT-AAMMJJ-XXXX */
function reference() {
  const d = new Date();
  const jour = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const alea = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `PT-${jour}-${alea}`;
}

export async function POST(requete: Request) {
  let donnees: FormData;
  try {
    donnees = await requete.formData();
  } catch {
    return NextResponse.json({ erreur: 'Requête illisible.' }, { status: 400 });
  }

  const texte = (cle: string) => String(donnees.get(cle) ?? '').trim();
  const email = texte('email');
  const prenom = texte('prenom');
  const nom = texte('nom');
  const source = texte('source');
  const cible = texte('cible');
  const remarque = texte('remarque').slice(0, 2000);
  const moyen = texte('moyen');
  const fichiers = donnees.getAll('fichiers').filter((f): f is File => f instanceof File);

  // Apple Pay fournit lui-même le nom et l'e-mail : la feuille Apple les
  // renverra à l'étape paiement, on n'exige donc pas le formulaire ici.
  const contactRequis = moyen !== 'applepay';

  if (fichiers.length === 0) {
    return NextResponse.json({ erreur: 'Aucun document reçu.' }, { status: 400 });
  }
  if (fichiers.length > MAX_DOCS) {
    return NextResponse.json({ erreur: `Maximum ${MAX_DOCS} documents par commande.` }, { status: 400 });
  }
  for (const f of fichiers) {
    if (f.size > TAILLE_MAX) {
      return NextResponse.json({ erreur: `« ${f.name} » dépasse 10 Mo.` }, { status: 400 });
    }
    if (!TYPES_OK.some((t) => f.type.startsWith(t))) {
      return NextResponse.json({ erreur: `« ${f.name} » n'est ni un PDF ni une image.` }, { status: 400 });
    }
  }
  if (contactRequis && (!emailValide(email) || !prenom || !nom)) {
    return NextResponse.json({ erreur: 'Coordonnées incomplètes.' }, { status: 400 });
  }

  // Le montant est recalculé côté serveur : ne jamais faire confiance au prix
  // envoyé par le navigateur, il est modifiable par le visiteur.
  const quantite = Math.max(1, Math.min(MAX_DOCS, Number(donnees.get('quantite')) || fichiers.length));
  const montant = quantite * PRIX_OFFRE;

  const commande = {
    reference: reference(),
    recuLe: new Date().toISOString(),
    client: { email, prenom, nom },
    langues: { source, cible },
    quantite,
    montant,
    moyen,
    remarque,
    fichiers: fichiers.map((f) => ({ nom: f.name, taille: f.size, type: f.type })),
  };

  // Sans stockage configuré, on refuse plutôt que de faire croire au client
  // que son dossier est enregistré alors que ses fichiers seraient perdus.
  if (!stockageConfigure()) {
    console.error('[commande] stockage non configuré, dépôt refusé');
    return NextResponse.json(
      { erreur: "Le dépôt est momentanément indisponible. Réessayez dans quelques minutes." },
      { status: 503 },
    );
  }

  // Les fichiers ne sont lus qu'une fois : le même tampon sert au stockage
  // puis aux pièces jointes de la notification interne.
  const pieces: PieceJointe[] = [];

  try {
    const deposes: string[] = [];
    for (const [i, f] of fichiers.entries()) {
      const nom = nomSur(f.name);
      const cle = `commandes/${commande.reference}/${String(i + 1).padStart(2, '0')}-${nom}`;
      const contenu = Buffer.from(await f.arrayBuffer());
      await deposer(cle, contenu, f.type);
      deposes.push(cle);
      pieces.push({ nom, contenu });
    }
    await ecrireFiche(commande.reference, { ...commande, cles: deposes });
  } catch (e) {
    console.error('[commande] échec du stockage', e);
    return NextResponse.json(
      { erreur: "Nous n'avons pas pu enregistrer vos documents. Réessayez." },
      { status: 500 },
    );
  }

  // Les e-mails ne bloquent pas la réponse : le dossier est déjà enregistré,
  // un envoi manqué se rattrape, une commande perdue non.
  await envoyerEmails(commande, pieces);

  // TODO — étape suivante : paiement Stripe.
  return NextResponse.json({ reference: commande.reference, montant });
}

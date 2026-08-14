import { NextResponse } from 'next/server';
import { MAX_DOCS, PRIX_ENVOI, PRIX_OFFRE } from '@/lib/data';
import { deposer, ecrireFiche, nomSur, stockageConfigure } from '@/lib/stockage';
import { creerSession, stripeConfigure } from '@/lib/stripe';

export const runtime = 'nodejs';

const TAILLE_MAX = 10 * 1024 * 1024; // 10 Mo par fichier
const TYPES_OK = ['application/pdf', 'image/'];
const emailValide = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
const cpValide = (v: string) => /^\d{5}$/.test(v.trim());

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
  const envoiPostal = texte('envoiPostal') === '1';
  const adresse = texte('adresse').slice(0, 200);
  const codePostal = texte('codePostal').slice(0, 5);
  const ville = texte('ville').slice(0, 100);
  const fichiers = donnees.getAll('fichiers').filter((f): f is File => f instanceof File);

  /* Les coordonnées sont désormais exigées quel que soit le moyen choisi.

     Auparavant Apple Pay en était dispensé, parce qu'il fournit lui-même le
     nom et l'e-mail. Ce n'est plus tenable : c'est nous qui livrons la
     traduction par courrier électronique, et il nous faut l'adresse avant
     même d'ouvrir le paiement — sinon un dossier payé se retrouverait sans
     destinataire. Apple Pay reste proposé, à l'intérieur du formulaire. */
  const contactRequis = true;

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
  // L'adresse est exigée quel que soit le moyen de paiement : sans elle, on
  // encaisserait un envoi qu'on ne saurait pas expédier.
  if (envoiPostal && (!adresse || !cpValide(codePostal) || !ville)) {
    return NextResponse.json({ erreur: 'Adresse postale incomplète.' }, { status: 400 });
  }

  // Le montant est recalculé côté serveur : ne jamais faire confiance au prix
  // envoyé par le navigateur, il est modifiable par le visiteur.
  const quantite = Math.max(1, Math.min(MAX_DOCS, Number(donnees.get('quantite')) || fichiers.length));
  // L'envoi papier est facturé une fois par commande, pas par document.
  const montant = quantite * PRIX_OFFRE + (envoiPostal ? PRIX_ENVOI : 0);

  const commande = {
    reference: reference(),
    recuLe: new Date().toISOString(),
    // Tant que Stripe n'a pas confirmé, le dossier existe mais n'est pas payé.
    // C'est le webhook qui fera basculer ce statut, jamais le navigateur.
    statut: 'en_attente_paiement' as const,
    client: { email, prenom, nom },
    langues: { source, cible },
    quantite,
    montant,
    moyen,
    envoiPostal,
    adressePostale: envoiPostal ? { adresse, codePostal, ville } : null,
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

  try {
    const deposes: string[] = [];
    for (const [i, f] of fichiers.entries()) {
      const cle = `commandes/${commande.reference}/${String(i + 1).padStart(2, '0')}-${nomSur(f.name)}`;
      await deposer(cle, Buffer.from(await f.arrayBuffer()), f.type);
      deposes.push(cle);
    }
    await ecrireFiche(commande.reference, { ...commande, cles: deposes });
  } catch (e) {
    console.error('[commande] échec du stockage', e);
    return NextResponse.json(
      { erreur: "Nous n'avons pas pu enregistrer vos documents. Réessayez." },
      { status: 500 },
    );
  }

  // Les e-mails ne partent plus ici : ils annonceraient une commande que le
  // client n'a pas encore payée. C'est le webhook Stripe qui les déclenche,
  // une fois l'encaissement confirmé.
  if (!stripeConfigure()) {
    console.error('[commande] STRIPE_SECRET_KEY absente, paiement impossible');
    return NextResponse.json(
      { erreur: 'Le paiement est momentanément indisponible. Réessayez dans quelques minutes.' },
      { status: 503 },
    );
  }

  try {
    const session = await creerSession({
      reference: commande.reference,
      quantite,
      envoiPostal,
      email,
      source,
      cible,
    });
    return NextResponse.json({
      reference: commande.reference,
      montant,
      clientSecret: session.client_secret,
    });
  } catch (e) {
    console.error('[commande] échec de la session Stripe', e);
    // Les fichiers sont déjà en lieu sûr : on peut réessayer le paiement sans
    // redemander au client de tout redéposer.
    return NextResponse.json(
      { erreur: "Le paiement n'a pas pu être initialisé. Réessayez." },
      { status: 502 },
    );
  }
}

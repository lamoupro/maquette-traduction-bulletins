import { NextResponse } from 'next/server';
import { MAX_DOCS, PRIX_OFFRE } from '@/lib/data';

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

  // TODO — étapes suivantes, dans cet ordre :
  //   1. stocker les fichiers (Vercel Blob ou S3) et persister la commande
  //   2. créer la session de paiement Stripe et rediriger
  //   3. sur webhook `checkout.session.completed` : e-mail de confirmation au
  //      client, et transfert des documents à l'adresse interne
  // Pour l'instant la commande est seulement journalisée : rien n'est débité.
  console.log('[commande]', JSON.stringify(commande));

  return NextResponse.json({ reference: commande.reference, montant });
}

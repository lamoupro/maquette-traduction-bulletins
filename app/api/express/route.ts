import { NextResponse } from 'next/server';
import { preparer } from '@/lib/finaliser';
import { creerIntention, stripeConfigure } from '@/lib/stripe';

export const runtime = 'nodejs';

/* Paiement express — Apple Pay, Google Pay.

   Ici, pas de session Checkout : la feuille du système s'est déjà ouverte
   au doigt et attend une intention de paiement. On la crée, on renvoie son
   secret, le navigateur confirme. Le nom n'est pas exigé : la feuille le
   fournit, et le webhook s'en sert pour compléter le dossier. */

export async function POST(requete: Request) {
  let corps: Record<string, unknown>;
  try {
    corps = await requete.json();
  } catch {
    return NextResponse.json({ erreur: 'Requête illisible.' }, { status: 400 });
  }

  const texte = (cle: string) => String(corps[cle] ?? '').trim();

  const { refus, commande, quantite, montant } = await preparer({
    reference: texte('reference'),
    email: texte('email'),
    prenom: texte('prenom'),
    nom: texte('nom'),
    source: texte('source'),
    cible: texte('cible'),
    remarque: texte('remarque').slice(0, 2000),
    quantite: Number(corps.quantite) || 1,
    envoiPostal: corps.envoiPostal === true,
    adresse: texte('adresse').slice(0, 200),
    codePostal: texte('codePostal').slice(0, 5),
    ville: texte('ville').slice(0, 100),
    identiteRequise: false,
  });

  if (refus) return NextResponse.json({ erreur: refus.erreur }, { status: refus.statut });

  if (!stripeConfigure()) {
    return NextResponse.json(
      { erreur: 'Le paiement est momentanément indisponible.' },
      { status: 503 },
    );
  }

  try {
    const intention = await creerIntention({
      reference: commande!.reference,
      montant: montant!,
      email: commande!.client.email,
      quantite: quantite!,
    });
    return NextResponse.json({ clientSecret: intention.client_secret, montant });
  } catch (e) {
    console.error('[express] échec de la création du paiement', e);
    return NextResponse.json(
      { erreur: "Le paiement n'a pas pu être initialisé. Réessayez." },
      { status: 502 },
    );
  }
}

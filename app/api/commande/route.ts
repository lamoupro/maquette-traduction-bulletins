import { NextResponse } from 'next/server';
import { preparer } from '@/lib/finaliser';
import { creerSession, stripeConfigure } from '@/lib/stripe';

export const runtime = 'nodejs';

/* Paiement par carte : ouvre une session Checkout sur un dossier déjà
   déposé. Les fichiers sont partis dès leur sélection, via /api/depot. */

export async function POST(requete: Request) {
  let donnees: FormData;
  try {
    donnees = await requete.formData();
  } catch {
    return NextResponse.json({ erreur: 'Requête illisible.' }, { status: 400 });
  }

  const texte = (cle: string) => String(donnees.get(cle) ?? '').trim();
  const moyen = texte('moyen');

  const { refus, commande, pages, montant } = await preparer({
    reference: texte('reference'),
    email: texte('email'),
    prenom: texte('prenom'),
    nom: texte('nom'),
    source: texte('source'),
    cible: texte('cible'),
    remarque: texte('remarque').slice(0, 2000),
    envoiPostal: texte('envoiPostal') === '1',
    adresse: texte('adresse').slice(0, 200),
    codePostal: texte('codePostal').slice(0, 5),
    ville: texte('ville').slice(0, 100),
    // La feuille Apple fournit le nom ; la carte, elle, l'exige du formulaire.
    identiteRequise: moyen !== 'applepay',
  });

  if (refus) return NextResponse.json({ erreur: refus.erreur }, { status: refus.statut });

  if (!stripeConfigure()) {
    console.error('[commande] STRIPE_SECRET_KEY absente');
    return NextResponse.json(
      { erreur: 'Le paiement est momentanément indisponible. Réessayez dans quelques minutes.' },
      { status: 503 },
    );
  }

  try {
    const session = await creerSession({
      reference: commande!.reference,
      pages: pages!,
      envoiPostal: commande!.envoiPostal,
      email: commande!.client.email,
      source: commande!.langues.source,
      cible: commande!.langues.cible,
    });
    return NextResponse.json({
      reference: commande!.reference,
      montant,
      clientSecret: session.client_secret,
    });
  } catch (e) {
    console.error('[commande] échec de la session Stripe', e);
    const st = e as { type?: string; code?: string; statusCode?: number };
    return NextResponse.json(
      {
        erreur: "Le paiement n'a pas pu être initialisé. Réessayez.",
        motif: st.code ?? st.type ?? 'inconnu',
      },
      { status: 502 },
    );
  }
}

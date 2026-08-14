import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { ecrireFiche, lireFiche } from '@/lib/stockage';
import { envoyerEmails } from '@/lib/email';

export const runtime = 'nodejs';

/* Confirmation de paiement.

   C'est ici, et nulle part ailleurs, qu'une commande devient payée. Le
   navigateur ne peut pas être cru : un client peut fermer son onglet juste
   après avoir payé, ou au contraire forger un appel à notre page de retour
   sans avoir rien réglé. Stripe, lui, signe ses notifications.

   Cette route doit rester accessible sans authentification — c'est un
   serveur de Stripe qui l'appelle, pas un visiteur. La signature tient lieu
   de mot de passe. */

async function traiter(reference: string, session: Stripe.Checkout.Session) {
  const cle = `commandes/${reference}/commande.json`;

  let commande;
  try {
    commande = await lireFiche(cle);
  } catch {
    console.error(`[webhook] dossier introuvable pour ${reference}`);
    return;
  }

  // Stripe réémet ses notifications en cas de doute. Sans cette garde, le
  // client recevrait plusieurs fois le même e-mail de confirmation.
  if (commande.statut === 'payee') {
    console.log(`[webhook] ${reference} déjà traitée, ignorée`);
    return;
  }

  const paye = {
    ...commande,
    statut: 'payee' as const,
    payeLe: new Date().toISOString(),
    stripe: {
      session: session.id,
      paymentIntent:
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : (session.payment_intent?.id ?? null),
      montantEncaisse: (session.amount_total ?? 0) / 100,
      devise: session.currency,
    },
  };

  await ecrireFiche(reference, paye);

  /* Le montant réellement encaissé fait foi. Un écart est normal quand un
     code promotionnel a été appliqué — Stripe le déduit après notre calcul.
     On le trace tout de même : c'est la seule façon de repérer un jour un
     encaissement qui ne correspond à rien. */
  const remise = (session.total_details?.amount_discount ?? 0) / 100;
  const attendu = commande.montant - remise;
  if (Math.abs(paye.stripe.montantEncaisse - attendu) > 0.01) {
    console.error(
      `[webhook] ${reference} : encaissé ${paye.stripe.montantEncaisse} € pour ${attendu} € attendus (remise ${remise} €)`,
    );
  } else if (remise > 0) {
    console.log(`[webhook] ${reference} : remise de ${remise} € appliquée`);
  }

  await envoyerEmails(paye, paye.fichiers?.length ?? paye.quantite);
  console.log(`[webhook] ${reference} payée, e-mails envoyés`);
}

export async function POST(requete: Request) {
  const signature = requete.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !secret) {
    console.error('[webhook] signature ou STRIPE_WEBHOOK_SECRET manquante');
    return NextResponse.json({ erreur: 'Signature manquante.' }, { status: 400 });
  }

  // Le corps brut est indispensable : la signature porte sur les octets
  // exacts, pas sur le JSON reconstruit.
  const brut = await requete.text();

  let evenement: Stripe.Event;
  try {
    evenement = stripe().webhooks.constructEvent(brut, signature, secret);
  } catch (e) {
    console.error('[webhook] signature invalide', e);
    return NextResponse.json({ erreur: 'Signature invalide.' }, { status: 400 });
  }

  if (
    evenement.type === 'checkout.session.completed' ||
    evenement.type === 'checkout.session.async_payment_succeeded'
  ) {
    const session = evenement.data.object as Stripe.Checkout.Session;
    const reference = session.metadata?.reference ?? session.client_reference_id;

    if (!reference) {
      console.error('[webhook] session sans référence', session.id);
    } else if (session.payment_status === 'paid') {
      try {
        await traiter(reference, session);
      } catch (e) {
        // On renvoie 500 pour que Stripe réessaie : mieux vaut un e-mail en
        // retard qu'une commande payée jamais prise en charge.
        console.error(`[webhook] échec du traitement de ${reference}`, e);
        return NextResponse.json({ erreur: 'Traitement impossible.' }, { status: 500 });
      }
    } else {
      console.log(`[webhook] ${reference} : paiement ${session.payment_status}, en attente`);
    }
  }

  return NextResponse.json({ recu: true });
}

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

/* Les deux chemins de paiement produisent des objets différents — une
   session Checkout pour la carte, une intention pour Apple Pay. On les
   réduit à ce dont la commande a besoin. */
type Encaissement = {
  id: string;
  paymentIntent: string | null;
  montant: number;
  devise: string | null;
  nom?: string | null;
  email?: string | null;
};

async function traiter(reference: string, enc: Encaissement) {
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

  /* En Apple Pay, le nom n'a pas été saisi sur le site : c'est la feuille
     du système qui le fournit, et Stripe nous le transmet ici. On complète
     le dossier plutôt que de laisser une fiche anonyme à l'administration. */
  const client = { ...commande.client };
  if (!client.prenom && !client.nom && enc.nom) {
    const parts = enc.nom.trim().split(/\s+/);
    client.prenom = parts.shift() ?? '';
    client.nom = parts.join(' ');
  }
  if (!client.email && enc.email) client.email = enc.email;

  const paye = {
    ...commande,
    client,
    statut: 'payee' as const,
    payeLe: new Date().toISOString(),
    stripe: {
      session: enc.id,
      paymentIntent: enc.paymentIntent,
      montantEncaisse: enc.montant,
      devise: enc.devise,
    },
  };

  await ecrireFiche(reference, paye);

  /* Le montant encaissé fait foi. Un écart est normal quand un code
     promotionnel a été appliqué. On le trace tout de même : c'est la seule
     façon de repérer un encaissement qui ne correspondrait à rien. */
  if (Math.abs(enc.montant - commande.montant) > 0.01) {
    console.log(
      `[webhook] ${reference} : encaissé ${enc.montant} € pour ${commande.montant} € calculés`,
    );
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

  /* Deux chemins mènent à un paiement abouti : la session Checkout pour la
     carte, l'intention pour Apple Pay et Google Pay. Les deux atterrissent
     dans la même fonction. */
  try {
    if (
      evenement.type === 'checkout.session.completed' ||
      evenement.type === 'checkout.session.async_payment_succeeded'
    ) {
      const s = evenement.data.object as Stripe.Checkout.Session;
      const reference = s.metadata?.reference ?? s.client_reference_id;
      if (!reference) {
        console.error('[webhook] session sans référence', s.id);
      } else if (s.payment_status === 'paid') {
        await traiter(reference, {
          id: s.id,
          paymentIntent:
            typeof s.payment_intent === 'string' ? s.payment_intent : (s.payment_intent?.id ?? null),
          montant: (s.amount_total ?? 0) / 100,
          devise: s.currency,
          nom: s.customer_details?.name,
          email: s.customer_details?.email,
        });
      } else {
        console.log(`[webhook] ${reference} : paiement ${s.payment_status}, en attente`);
      }
    }

    if (evenement.type === 'payment_intent.succeeded') {
      const pi = evenement.data.object as Stripe.PaymentIntent;
      const reference = pi.metadata?.reference;
      if (!reference) {
        // Une intention créée par Checkout arrive aussi ici : elle a déjà été
        // traitée par l'événement de session, on ne la reprend pas.
        console.log('[webhook] intention sans référence, ignorée', pi.id);
      } else {
        const details = pi.latest_charge as Stripe.Charge | string | null;
        const charge = typeof details === 'object' && details ? details : null;
        await traiter(reference, {
          id: pi.id,
          paymentIntent: pi.id,
          montant: (pi.amount_received || pi.amount) / 100,
          devise: pi.currency,
          nom: charge?.billing_details?.name ?? null,
          email: charge?.billing_details?.email ?? pi.receipt_email ?? null,
        });
      }
    }
  } catch (e) {
    // On renvoie 500 pour que Stripe réessaie : mieux vaut un e-mail en
    // retard qu'une commande payée jamais prise en charge.
    console.error('[webhook] échec du traitement', e);
    return NextResponse.json({ erreur: 'Traitement impossible.' }, { status: 500 });
  }

  return NextResponse.json({ recu: true });
}

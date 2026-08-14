import Stripe from 'stripe';
import { PRIX_ENVOI, PRIX_OFFRE } from './data';

/* Paiement Stripe, en mode Checkout intégré.

   Le client ne quitte jamais protranslayte.com : le formulaire est monté
   dans la carte de commande. Aucune donnée de carte ne touche nos serveurs,
   ce qui est exactement ce qu'annonce l'article 5 des CGV.

   Les montants sont recalculés ici à partir des constantes, jamais repris
   de ce que le navigateur envoie. */

export const stripeConfigure = () => Boolean(process.env.STRIPE_SECRET_KEY);

let memo: Stripe | null = null;
export function stripe() {
  if (memo) return memo;
  const cle = process.env.STRIPE_SECRET_KEY;
  if (!cle) throw new Error("Variable d'environnement manquante : STRIPE_SECRET_KEY");
  memo = new Stripe(cle);
  return memo;
}

const SITE = process.env.SITE_URL ?? 'https://protranslayte.com';

/** Stripe raisonne en centimes : 25 € s'écrit 2500. */
const centimes = (euros: number) => Math.round(euros * 100);

export async function creerSession(opts: {
  reference: string;
  quantite: number;
  envoiPostal: boolean;
  email: string;
  source: string;
  cible: string;
}) {
  const lignes: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    {
      quantity: opts.quantite,
      price_data: {
        currency: 'eur',
        unit_amount: centimes(PRIX_OFFRE),
        product_data: {
          name: 'Traduction assermentée',
          description: `${opts.source} → ${opts.cible} · par document`,
        },
      },
    },
  ];

  if (opts.envoiPostal) {
    lignes.push({
      quantity: 1,
      price_data: {
        currency: 'eur',
        unit_amount: centimes(PRIX_ENVOI),
        product_data: {
          name: "Envoi de l'original par courrier",
          description: 'Courrier suivi, France',
        },
      },
    });
  }

  return stripe().checkout.sessions.create({
    /* « embedded_page » et non « embedded » : les versions récentes de l'API
       ont renommé ce mode, et l'ancien nom est désormais refusé. */
    ui_mode: 'embedded_page',
    mode: 'payment',
    line_items: lignes,
    customer_email: opts.email || undefined,
    // La référence voyage avec le paiement : c'est elle qui permet au
    // webhook de retrouver le dossier déjà déposé dans le stockage.
    client_reference_id: opts.reference,
    metadata: { reference: opts.reference },
    payment_intent_data: { metadata: { reference: opts.reference } },
    locale: 'fr',
    /* Ouvre le champ « code promotionnel » dans le formulaire.

       Sert d'abord aux essais en conditions réelles : un code à usage unique
       permet de valider tout le tunnel pour quelques centimes sans toucher au
       tarif affiché. Il servira ensuite aux opérations commerciales.

       Aucun risque d'abus : un code Stripe n'existe que si on l'a créé, et
       chacun porte sa limite d'utilisations et sa date d'expiration. */
    allow_promotion_codes: true,
    return_url: `${SITE}/commande/retour?session_id={CHECKOUT_SESSION_ID}`,
  });
}

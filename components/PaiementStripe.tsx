'use client';

import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';

/* Formulaire de paiement Stripe, monté dans la carte de commande.

   La clé publique est destinée à être visible : c'est son rôle. La clé
   secrète, elle, ne quitte jamais le serveur.

   loadStripe est appelé au niveau du module, pas dans le composant : le
   script de Stripe ne doit être téléchargé qu'une fois par page. */

const cle = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = cle ? loadStripe(cle) : null;

export default function PaiementStripe({ clientSecret }: { clientSecret: string }) {
  if (!stripePromise) {
    return (
      <p className="toast" style={{ color: '#B3261E' }}>
        Le paiement n’est pas configuré. Écrivez-nous à contact@protranslayte.com, votre dossier est
        enregistré.
      </p>
    );
  }

  return (
    <div className="stripe-checkout">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}

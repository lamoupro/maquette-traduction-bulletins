'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  ExpressCheckoutElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';

/* Bouton Apple Pay / Google Pay natif.

   Toute la difficulté est là : Apple exige que sa feuille s'ouvre dans le
   geste même du doigt. Impossible d'y glisser un téléversement. C'est
   pourquoi les documents partent dès leur sélection, via /api/depot, et que
   ce bouton n'a plus qu'à référencer un dossier déjà en lieu sûr.

   L'intention de paiement, elle, est créée après l'autorisation — Stripe
   l'autorise, et ça évite d'ouvrir un paiement pour un geste abandonné. */

const cle = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = cle ? loadStripe(cle) : null;

export type DonneesExpress = {
  reference: string | null;
  email: string;
  prenom: string;
  nom: string;
  source: string;
  cible: string;
  remarque: string;
  quantite: number;
  envoiPostal: boolean;
  adresse: string;
  codePostal: string;
  ville: string;
};

function Bouton({
  donnees,
  montant,
  surErreur,
}: {
  donnees: DonneesExpress;
  montant: number;
  surErreur: (m: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [visible, setVisible] = useState(false);

  return (
    <div className={visible ? 'express-zone' : 'express-zone est-vide'}>
      <ExpressCheckoutElement
        options={{
          buttonType: { applePay: 'buy', googlePay: 'buy' },
          buttonTheme: { applePay: 'black', googlePay: 'black' },
          buttonHeight: 48,
          // Le nom et l'adresse arrivent par la feuille du système.
          paymentMethods: { link: 'never' },
        }}
        onReady={({ availablePaymentMethods }) => {
          setVisible(Boolean(availablePaymentMethods));
        }}
        onClick={({ resolve }) => {
          // Ouvre la feuille immédiatement : aucun appel réseau ici, sinon
          // Safari refuserait de l'afficher.
          resolve({ emailRequired: false });
        }}
        onConfirm={async () => {
          if (!stripe || !elements) return;
          try {
            const r = await fetch('/api/express', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(donnees),
            });
            const json = await r.json();
            if (!r.ok || !json.clientSecret) {
              throw new Error(json.erreur || "Le paiement n'a pas pu être initialisé.");
            }

            const { error } = await stripe.confirmPayment({
              elements,
              clientSecret: json.clientSecret,
              confirmParams: {
                return_url: `${window.location.origin}/commande/retour?ref=${encodeURIComponent(
                  donnees.reference ?? '',
                )}`,
              },
            });
            if (error) surErreur(error.message ?? 'Le paiement a été refusé.');
          } catch (e) {
            surErreur(e instanceof Error ? e.message : 'Le paiement a échoué. Réessayez.');
          }
        }}
      />
    </div>
  );
}

export default function BoutonExpress(props: {
  donnees: DonneesExpress;
  montant: number;
  surErreur: (m: string) => void;
}) {
  // Sans clé publique, ou sans dossier déposé, il n'y a rien à monter.
  if (!stripePromise || !props.donnees.reference || props.montant <= 0) return null;

  return (
    <Elements
      stripe={stripePromise}
      options={{
        mode: 'payment',
        amount: Math.round(props.montant * 100),
        currency: 'eur',
        locale: 'fr',
        appearance: { variables: { borderRadius: '6px' } },
      }}
    >
      <Bouton {...props} />
    </Elements>
  );
}

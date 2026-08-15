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
  actif,
  manque,
  surErreur,
}: {
  donnees: DonneesExpress;
  actif: boolean;
  manque: string;
  surErreur: (m: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [visible, setVisible] = useState(false);

  /* Tant que l'adresse électronique manque, le bouton d'Apple est affiché
     mais désaturé et inerte. Le visiteur voit ce qui l'attend, comprend
     qu'il lui manque une information, et le bouton reprend ses couleurs
     dès qu'elle est saisie. Le griser plutôt que le cacher évite qu'il
     surgisse de nulle part au dernier moment. */
  const classes = ['express-zone', visible ? '' : 'est-vide', actif ? '' : 'est-inactif']
    .filter(Boolean)
    .join(' ');

  return (
    <>
    <div className={classes} aria-disabled={!actif}>
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
          if (!donnees.reference) {
            surErreur('Vos documents finissent de se déposer, réessayez dans un instant.');
            return;
          }
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
    {/* La mention vit hors du bloc grisé : à l'intérieur, elle héritait de
        l'opacité à 40 % et devenait illisible, alors que c'est précisément
        elle qui explique pourquoi le bouton est éteint. */}
    {visible && !actif ? <p className="express-aide">{manque}</p> : null}
    </>
  );
}

export default function BoutonExpress(props: {
  donnees: DonneesExpress;
  montant: number;
  actif: boolean;
  manque: string;
  surErreur: (m: string) => void;
}) {
  /* Monté dès le premier écran, avant même le dépôt : le visiteur doit voir
     tout de suite qu'il pourra payer en un geste. Il reste grisé et inerte
     tant qu'il manque quelque chose. */
  if (!stripePromise || props.montant <= 0) return null;

  const centimes = Math.round(props.montant * 100);

  return (
    /* La clé force le remontage quand le montant change : Stripe ne relit
       pas `amount` après coup, et la feuille afficherait l'ancien prix. */
    <Elements
      key={centimes}
      stripe={stripePromise}
      options={{
        mode: 'payment',
        amount: centimes,
        currency: 'eur',
        locale: 'fr',
        appearance: { variables: { borderRadius: '6px' } },
      }}
    >
      <Bouton {...props} />
    </Elements>
  );
}

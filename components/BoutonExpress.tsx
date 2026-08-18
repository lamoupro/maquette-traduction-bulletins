'use client';

import { useEffect, useState } from 'react';
import type { Stripe } from '@stripe/stripe-js';
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

/* Stripe.js pèse plusieurs centaines de kilo-octets et bloque le fil
   principal une fois exécuté. Le charger au niveau du module le mettait sur
   le chemin critique de la page d'accueil : treize secondes avant l'affichage
   du contenu sur un téléphone en 4G, pour un script dont le visiteur n'a
   besoin qu'au moment de payer.

   Il part donc une fois la page rendue et le fil principal libre. La feuille
   d'Apple reste disponible bien avant que le formulaire soit rempli — le
   visiteur doit d'abord choisir ses langues et déposer ses documents. */
let promesse: Promise<Stripe | null> | null = null;

function chargerStripe() {
  if (!cle) return null;
  if (!promesse) {
    promesse = import('@stripe/stripe-js').then((m) => m.loadStripe(cle));
  }
  return promesse;
}

/** Renvoie Stripe une fois la page libre, pas avant. */
function useStripeDiffere() {
  const [stripe, setStripe] = useState<Promise<Stripe | null> | null>(null);

  useEffect(() => {
    if (!cle) return;
    let annule = false;
    const lancer = () => {
      if (!annule) setStripe(chargerStripe());
    };

    // requestIdleCallback attend que le fil principal ait fini son travail.
    // Safari ne le connaît toujours pas : un délai court y joue le même rôle.
    const w = window as typeof window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const oisif = typeof w.requestIdleCallback === 'function';
    const id = oisif
      ? w.requestIdleCallback!(lancer, { timeout: 2500 })
      : window.setTimeout(lancer, 1200);

    return () => {
      annule = true;
      if (oisif) w.cancelIdleCallback?.(id);
      else clearTimeout(id);
    };
  }, []);

  return stripe;
}

export type DonneesExpress = {
  reference: string | null;
  email: string;
  prenom: string;
  nom: string;
  source: string;
  cible: string;
  remarque: string;
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
  const stripePromise = useStripeDiffere();
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

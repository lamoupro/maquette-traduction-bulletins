import Script from 'next/script';

/* Lucky Orange — enregistrement de session et cartes de chaleur.

   Le script n'est émis que si NEXT_PUBLIC_LUCKY_ORANGE_ID existe. Sans cette
   variable, le composant ne rend rien et aucune requête ne part : le code peut
   donc vivre en production sans rien collecter tant que l'identifiant n'est
   pas renseigné.

   Attention : les variables NEXT_PUBLIC_ sont figées à la compilation. Après
   l'avoir ajoutée dans Vercel, il faut redéployer pour qu'elle prenne effet.

   Chargé en afterInteractive : assez tard pour ne pas repeupler le chemin
   critique qu'on vient de dégager, assez tôt pour que l'enregistrement ne
   rate pas les premières secondes de la visite. */

const siteId = process.env.NEXT_PUBLIC_LUCKY_ORANGE_ID;

export default function LuckyOrange() {
  if (!siteId) return null;

  return (
    <Script
      id="lucky-orange"
      strategy="afterInteractive"
      src={`https://tools.luckyorange.com/core/lo.js?site-id=${siteId}`}
    />
  );
}

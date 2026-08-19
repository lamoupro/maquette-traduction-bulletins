import Script from 'next/script';

/* Lucky Orange — enregistrement de session et cartes de chaleur.

   L'identifiant de site n'est pas un secret : il voyage dans le HTML public,
   au même titre que la clé publiable de Stripe. Le mettre en dur évite le
   détour par une variable NEXT_PUBLIC_, figée à la compilation, qui aurait
   imposé un redéploiement à chaque changement.

   beforeInteractive place la balise dans le <head>, comme le demande Lucky
   Orange : un enregistrement qui démarre après l'hydratation rate les
   premières secondes, c'est-à-dire précisément le moment où le visiteur
   décide s'il reste. Le script est en async, il ne bloque donc pas l'analyse
   du document — mais il consomme du fil principal à son exécution, ce qui se
   paie sur le TBT. */

const SITE_ID = 'ff921c8e';

export default function LuckyOrange() {
  return (
    <Script
      id="lucky-orange"
      strategy="beforeInteractive"
      src={`https://tools.luckyorange.com/core/lo.js?site-id=${SITE_ID}`}
    />
  );
}

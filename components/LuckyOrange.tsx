import Script from 'next/script';

/* Lucky Orange — enregistrement de session et cartes de chaleur.

   L'identifiant de site n'est pas un secret : il voyage dans le HTML public,
   au même titre que la clé publiable de Stripe. Le mettre en dur évite le
   détour par une variable NEXT_PUBLIC_, figée à la compilation, qui aurait
   imposé un redéploiement à chaque changement.

   Lucky Orange demande un chargement depuis le <head>. Essayé, mesuré,
   abandonné : en beforeInteractive le score mobile tombait de 78 à 56 et le
   blocage du fil principal passait de 672 ms à 4 382 ms, médiane sur trois
   runs. Le script est en async — il ne bloque pas l'analyse du document —
   mais ses 740 Ko de JavaScript coûtent cher à l'exécution, et en
   beforeInteractive cette exécution concourt avec l'hydratation de la page.

   afterInteractive le fait partir une fois la page interactive. On perd la
   première seconde ou deux d'enregistrement par visite ; on garde une page
   qui répond quand le visiteur clique, ce qui compte davantage quand le clic
   a été payé jusqu'à 3 € en publicité. */

const SITE_ID = 'ff921c8e';

export default function LuckyOrange() {
  return (
    <Script
      id="lucky-orange"
      strategy="afterInteractive"
      src={`https://tools.luckyorange.com/core/lo.js?site-id=${SITE_ID}`}
    />
  );
}

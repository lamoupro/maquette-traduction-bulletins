/* Devises, et comment on décide de celle qu'on facture.

   Le dollar est le DÉFAUT. C'est la devise du marché visé — un entraîneur
   américain envoie le lien à sa recrue, et un prix en dollars lui parle, à lui
   comme au jeune qui va s'installer là-bas.

   L'euro reste pour l'Europe et l'espace francophone : c'est l'activité qui
   tourne aujourd'hui, et on ne change pas le prix affiché à un client français
   parce qu'on ouvre un marché ailleurs.

   Le Canada bascule en dollars américains, et volontairement : ses athlètes
   partent aux États-Unis, le lien leur vient d'un entraîneur américain, et le
   dollar canadien n'ajoutait qu'une conversion mentale de plus.

   RÈGLE QUI NE SE NÉGOCIE PAS : la devise est décidée par le SERVEUR au moment
   du dépôt, à partir du pays de la requête, puis ÉCRITE dans la commande. Elle
   n'est jamais reprise de ce que le navigateur envoie ensuite — sinon il
   suffirait de rejouer la requête en annonçant un autre pays pour choisir le
   tarif le plus bas. C'est le même principe que le nombre de pages : le
   navigateur propose, le serveur décide. */

export type Devise = {
  code: string;
  /** Prix d'une page, dans cette devise. */
  page: number;
  /** Envoi de l'original par courrier. `null` quand l'option n'est pas offerte. */
  envoi: number | null;
  /** Comment l'écrire — l'étiquette monétaire ne se place pas au même endroit. */
  locale: string;
};

export const USD: Devise = { code: 'USD', page: 25, envoi: null, locale: 'en-US' };

/* L'envoi papier n'existe qu'en France métropolitaine : c'est une enveloppe
   déposée à la poste, pas un service international. Partout ailleurs, `envoi`
   vaut null et l'option disparaît de la carte de commande — proposer un port
   qu'on ne sait pas assurer est pire que ne rien proposer. */
const DEVISES: Record<string, Devise> = {
  FR: { code: 'EUR', page: 25, envoi: 4.9, locale: 'fr-FR' },

  BE: { code: 'EUR', page: 25, envoi: null, locale: 'fr-BE' },
  ES: { code: 'EUR', page: 25, envoi: null, locale: 'es-ES' },
  IT: { code: 'EUR', page: 25, envoi: null, locale: 'it-IT' },
  PT: { code: 'EUR', page: 25, envoi: null, locale: 'pt-PT' },
  DE: { code: 'EUR', page: 25, envoi: null, locale: 'de-DE' },
  NL: { code: 'EUR', page: 25, envoi: null, locale: 'nl-NL' },
  IE: { code: 'EUR', page: 25, envoi: null, locale: 'en-IE' },
  LU: { code: 'EUR', page: 25, envoi: null, locale: 'fr-LU' },

  CH: { code: 'CHF', page: 24, envoi: null, locale: 'fr-CH' },
  GB: { code: 'GBP', page: 21, envoi: null, locale: 'en-GB' },

  /* Espace francophone hors Europe : l'EURO, pas les devises locales.

     Le dirham, le dinar et le franc CFA ont été retirés le 6 septembre 2026.
     Ils ajoutaient trois façons de compter — le franc CFA n'a pas de décimale,
     le dinar tunisien en a trois — pour une clientèle qui raisonne déjà en
     euros dès qu'il s'agit d'un service européen, et dont la carte est
     souvent adossée à un compte en euros. */
  MA: { code: 'EUR', page: 25, envoi: null, locale: 'fr-MA' },
  DZ: { code: 'EUR', page: 25, envoi: null, locale: 'fr-DZ' },
  TN: { code: 'EUR', page: 25, envoi: null, locale: 'fr-TN' },
  SN: { code: 'EUR', page: 25, envoi: null, locale: 'fr-SN' },
  CI: { code: 'EUR', page: 25, envoi: null, locale: 'fr-CI' },
  CM: { code: 'EUR', page: 25, envoi: null, locale: 'fr-CM' },
};

/** La devise à facturer, d'après le pays de la requête. Dollar par défaut. */
export const deviseDuPays = (pays: string | null | undefined): Devise =>
  (pays && DEVISES[pays.toUpperCase()]) || USD;

/** Retrouve une devise déjà écrite dans une commande. */
export const deviseParCode = (code: string | null | undefined): Devise =>
  Object.values(DEVISES).find((d) => d.code === code) ?? USD;

/**
 * Montant lisible. Les sommes rondes restent sans décimale — « $25 », pas
 * « $25.00 » — parce qu'un prix simple se retient et se compare mieux.
 */
export function montantLisible(n: number, d: Devise, langue?: string) {
  return new Intl.NumberFormat(langue ?? d.locale, {
    style: 'currency',
    currency: d.code,
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(n);
}

/* Stripe compte en plus petite unité.

   Les quatre devises servies aujourd'hui — USD, EUR, CHF, GBP — ont toutes
   deux décimales. Les deux listes ci-dessous ne servent donc à rien pour
   l'instant, et c'est voulu : le jour où une devise sans décimale ou à trois
   décimales revient dans la table, le calcul est déjà juste. Sans elles, un
   montant serait facturé cent fois trop haut ou dix fois trop bas, et
   l'anomalie passerait pour un code promotionnel dans le journal. */
const SANS_DECIMALE = new Set(['XOF', 'XAF', 'JPY', 'KRW', 'VND', 'CLP', 'ISK']);
const TROIS_DECIMALES = new Set(['TND', 'KWD', 'BHD', 'JOD', 'OMR']);

export function versUniteStripe(montant: number, code: string) {
  if (SANS_DECIMALE.has(code)) return Math.round(montant);
  if (TROIS_DECIMALES.has(code)) return Math.round(montant * 1000);
  return Math.round(montant * 100);
}

export function depuisUniteStripe(unites: number, code: string) {
  if (SANS_DECIMALE.has(code)) return unites;
  if (TROIS_DECIMALES.has(code)) return unites / 1000;
  return unites / 100;
}

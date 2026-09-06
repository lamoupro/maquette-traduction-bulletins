/* Langues du site, et comment on choisit celle qu'on sert.

   Quatre langues, pas dix : anglais, français, espagnol, portugais. Elles
   couvrent le public qui ne lit pas l'anglais confortablement — Amérique
   latine, Brésil, espace francophone. Le reste du monde universitaire
   américain (Scandinavie, Pays-Bas, Allemagne, Serbie, Japon) lit l'anglais
   sans difficulté, et une version locale de plus n'y ajouterait rien qu'une
   traduction à tenir à jour.

   Le français reste À LA RACINE, sans préfixe : c'est le site existant, celui
   qui est référencé et qui tourne. On n'y touche pas.

   DEUX SIGNAUX, ET PAS UN SEUL :

   — la LANGUE vient du navigateur (`Accept-Language`), qui dit ce que la
     personne lit. Le pays ne le dit pas : un Brésilien en déplacement aux
     États-Unis lit toujours le portugais.
   — la DEVISE vient du pays (`x-vercel-ip-country`), qui lui est le bon
     signal pour savoir avec quoi on paie.

   Et dans les deux cas, la détection est un DÉFAUT, jamais une décision : un
   sélecteur reste visible, et le choix de la personne l'emporte ensuite. La
   géolocalisation se trompe couramment — réseaux d'entreprise, VPN, cartes
   SIM étrangères — et sans échappatoire l'utilisateur mal détecté est bloqué. */

export const LANGUES = ['fr', 'en', 'es', 'pt'] as const;
export type Langue = (typeof LANGUES)[number];

export const LANGUE_RACINE: Langue = 'fr';

export const NOMS: Record<Langue, string> = {
  fr: 'Français',
  en: 'English',
  es: 'Español',
  pt: 'Português',
};

/** Le code de langue tel que le veut l'attribut `lang` du document. */
export const BALISE: Record<Langue, string> = {
  fr: 'fr',
  en: 'en',
  es: 'es',
  pt: 'pt-BR',
};

export const estLangue = (v: string): v is Langue => (LANGUES as readonly string[]).includes(v);

/** Chemin d'une page dans une langue. Le français n'a pas de préfixe. */
export const chemin = (langue: Langue, suite = '') => {
  const base = langue === LANGUE_RACINE ? '' : `/${langue}`;
  return `${base}${suite}` || '/';
};

/* ---------- Détection de la langue ----------

   `Accept-Language` ressemble à « pt-BR,pt;q=0.9,en;q=0.8 ». On lit les
   préférences dans l'ordre de leur poids et on retient la première que nous
   savons servir. */
export function langueDuNavigateur(entete: string | null): Langue | null {
  if (!entete) return null;

  const prefs = entete
    .split(',')
    .map((morceau) => {
      const [code, ...params] = morceau.trim().split(';');
      const q = params.find((p) => p.trim().startsWith('q='));
      return { code: code.trim().toLowerCase(), poids: q ? Number(q.split('=')[1]) || 0 : 1 };
    })
    .sort((a, b) => b.poids - a.poids);

  for (const { code } of prefs) {
    // « pt-BR » compte comme « pt » : on ne sert pas de variantes régionales.
    const base = code.split('-')[0];
    if (estLangue(base)) return base;
  }
  return null;
}

/* ---------- Devise ----------

   Les devises locales existantes sont conservées : elles servent au marché
   francophone qui tourne déjà. Le reste du monde bascule en dollars plutôt
   que d'ajouter une ligne par pays pour un athlète qui arrive une fois l'an. */
export const DEVISE_DEFAUT = 'USD';

/* Pays dont la langue probable n'est pas celle du navigateur — dernier recours
   quand `Accept-Language` ne dit rien d'exploitable. */
const LANGUE_PAR_PAYS: Record<string, Langue> = {
  FR: 'fr', BE: 'fr', CH: 'fr', CA: 'fr', MA: 'fr', DZ: 'fr', TN: 'fr', SN: 'fr', CI: 'fr',
  BR: 'pt', PT: 'pt', AO: 'pt', MZ: 'pt',
  ES: 'es', MX: 'es', CO: 'es', AR: 'es', CL: 'es', VE: 'es', PE: 'es', DO: 'es',
  EC: 'es', GT: 'es', CR: 'es', UY: 'es', PY: 'es', BO: 'es',
};

export const langueDuPays = (pays: string | null): Langue | null =>
  (pays && LANGUE_PAR_PAYS[pays.toUpperCase()]) || null;

/**
 * La langue à servir, par ordre de fiabilité : le choix mémorisé, puis ce que
 * lit le navigateur, puis le pays.
 *
 * Renvoie `null` quand AUCUN signal ne renseigne — et c'est le point
 * important. Sans signal, on ne redirige pas : on sert la racine, en français.
 *
 * Le cas n'est pas théorique. Googlebot explore souvent sans en-tête
 * `Accept-Language` : avec un repli sur l'anglais, il serait renvoyé sur /en à
 * chaque passage et n'indexerait jamais la page d'accueil française — celle
 * qui porte l'activité d'aujourd'hui.
 */
export function langueChoisie(opts: {
  memorisee?: string | null;
  accept?: string | null;
  pays?: string | null;
}): Langue | null {
  if (opts.memorisee && estLangue(opts.memorisee)) return opts.memorisee;
  return langueDuNavigateur(opts.accept ?? null) ?? langueDuPays(opts.pays ?? null);
}

/** Cookie du choix explicite. Un an : c'est une préférence, pas une session. */
export const COOKIE_LANGUE = 'pt_langue';
export const LANGUE_JOURS = 365;

/* ---------- Langues des DOCUMENTS ----------

   À ne pas confondre avec la langue du site : ici il s'agit de ce qu'on
   traduit, de quoi vers quoi.

   La valeur enregistrée dans la commande est un CODE, pas un libellé. Le
   libellé change avec la langue du visiteur — un Brésilien lit « Francês »,
   un Espagnol « Francés » — et enregistrer ce qu'il a vu à l'écran rendrait
   les commandes incomparables entre elles. Le code, lui, ne bouge jamais. */
export const LANGUES_DOC = ['fr', 'en', 'es', 'ar', 'pt', 'it', 'de'] as const;
export type LangueDoc = (typeof LANGUES_DOC)[number];

const NOMS_DOC: Record<Langue, Record<LangueDoc, string>> = {
  fr: { fr: 'Français', en: 'Anglais', es: 'Espagnol', ar: 'Arabe', pt: 'Portugais', it: 'Italien', de: 'Allemand' },
  en: { fr: 'French', en: 'English', es: 'Spanish', ar: 'Arabic', pt: 'Portuguese', it: 'Italian', de: 'German' },
  es: { fr: 'Francés', en: 'Inglés', es: 'Español', ar: 'Árabe', pt: 'Portugués', it: 'Italiano', de: 'Alemán' },
  pt: { fr: 'Francês', en: 'Inglês', es: 'Espanhol', ar: 'Árabe', pt: 'Português', it: 'Italiano', de: 'Alemão' },
};

/** Le nom d'une langue de document, écrit dans la langue du lecteur. */
export function nomLangueDoc(code: string, lecteur: Langue = 'fr') {
  const table = NOMS_DOC[lecteur] ?? NOMS_DOC.fr;
  return table[code as LangueDoc] ?? code;
}

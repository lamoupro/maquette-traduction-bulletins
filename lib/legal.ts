/* Identité légale de l'entreprise — SOURCE UNIQUE.

   Les quatre pages légales lisent ce fichier. Pour mettre le site en
   conformité, il suffit de remplir les valeurs ci-dessous : rien d'autre
   n'est à modifier.

   Tant qu'une valeur vaut À_REMPLIR, elle s'affiche en rouge sur la page et
   `legalComplet()` renvoie false. C'est volontaire : un site marchand qui
   part en ligne avec « [nom de la société] » dans ses mentions légales est
   en infraction et se fait refuser par Stripe comme par Google Ads. */

export const A_REMPLIR = 'À_REMPLIR';

export const ENTREPRISE = {
  /* Nom commercial affiché au public. */
  nomCommercial: 'Protranslayte',

  /* Dénomination sociale exacte, telle qu'elle figure au répertoire SIRENE.
     Martin Lamou exerce en entreprise individuelle : la dénomination légale
     est son nom, et « Protranslayte » n'est qu'une enseigne commerciale. Les
     deux doivent apparaître, sans quoi le client ne peut pas rattacher le
     site à une personne identifiable. */
  raisonSociale: 'Martin Lamou',

  /* Nom d'usage déclaré au répertoire SIRENE. VOLONTAIREMENT NON AFFICHÉ :
     pour un entrepreneur individuel, seule la dénomination — le nom de la
     personne — est obligatoire. Faire figurer « Mouvement Précis de
     Performance » sur un site de traduction sème le doute sans rien
     apporter. Conservé ici pour mémoire. */
  nomDeclare: 'Mouvement Précis de Performance',

  /* « SASU », « SARL », « EURL », « Entrepreneur individuel »… */
  formeJuridique: 'Entrepreneur individuel',

  /* Capital social en euros. Laisser null pour un entrepreneur individuel :
     la mention disparaît alors de la page. */
  capital: null as number | null,

  /* Adresse du siège social, une ligne par élément.
     C'est un domicile privé. Martin a explicitement choisi de le publier le
     13 août 2026, faute de domiciliation. À remplacer dès qu'une adresse
     professionnelle existe — en particulier avant toute campagne payante. */
  adresse: ['Appartement 43 — 43 impasse de Soupetard', '31500 Toulouse'] as string[],

  /* 14 chiffres. Le SIREN (les 9 premiers) en est déduit automatiquement. */
  siret: '85053974300029',

  /* Ville du greffe d'immatriculation. Reste null pour un entrepreneur
     individuel : l'immatriculation se fait au Registre national des
     entreprises, mention affichée automatiquement à la place. */
  villeRcs: null as string | null,

  /* Numéro de TVA intracommunautaire. Laisser null si tu bénéficies de la
     franchise en base : la mention « TVA non applicable, article 293 B du
     CGI » s'affiche alors à la place, et elle est obligatoire. */
  tva: null as string | null,

  /* Personne responsable du contenu publié. En général le dirigeant. */
  directeurPublication: 'Martin Lamou',

  telephone: A_REMPLIR,
  email: 'contact@protranslayte.com',
  site: 'protranslayte.com',

  /* Médiateur de la consommation. L'adhésion à un dispositif de médiation
     est OBLIGATOIRE pour tout professionnel vendant à des particuliers
     (article L612-1 du code de la consommation), et son nom doit figurer
     dans les CGV. Compter environ 50 à 200 € par an. */
  mediateur: {
    nom: A_REMPLIR,
    site: A_REMPLIR,
    adresse: A_REMPLIR,
  },
};

/* Sous-traitants qui accèdent aux données, à jour de l'architecture réelle.
   Cette liste doit rester exacte : elle est opposable en cas de contrôle. */
export const SOUS_TRAITANTS = [
  {
    nom: 'Vercel Inc.',
    role: "Hébergement du site",
    lieu: 'États-Unis',
    adresse: '340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis',
  },
  {
    nom: 'Cloudflare, Inc.',
    role: 'Stockage chiffré des documents déposés',
    lieu: 'États-Unis',
    adresse: '101 Townsend St, San Francisco, CA 94107, États-Unis',
  },
  {
    nom: 'Resend (Plus Five Five, Inc.)',
    role: "Envoi des e-mails de confirmation",
    lieu: 'États-Unis',
    adresse: '2261 Market Street #5039, San Francisco, CA 94114, États-Unis',
  },
  {
    nom: 'Stripe Payments Europe, Ltd.',
    role: 'Traitement des paiements',
    lieu: 'Irlande',
    adresse: '1 Grand Canal Street Lower, Dublin 2, Irlande',
  },
  {
    nom: 'OVH SAS',
    role: 'Nom de domaine et messagerie professionnelle',
    lieu: 'France',
    adresse: '2 rue Kellermann, 59100 Roubaix, France',
  },
];

/** Vrai lorsque toutes les mentions obligatoires sont renseignées. */
export function legalComplet() {
  const e = ENTREPRISE;
  const valeurs = [
    e.raisonSociale,
    e.formeJuridique,
    e.siret,
    e.directeurPublication,
    e.telephone,
    e.mediateur.nom,
    e.mediateur.site,
    ...e.adresse,
  ];
  return valeurs.every((v) => v && v !== A_REMPLIR);
}

/** SIREN déduit du SIRET, ou null tant que le SIRET n'est pas renseigné. */
export function siren() {
  const s = ENTREPRISE.siret.replace(/\s/g, '');
  return /^\d{14}$/.test(s) ? s.slice(0, 9) : null;
}

/** Formate un SIRET en groupes lisibles : 123 456 789 00012 */
export function siretLisible() {
  const s = ENTREPRISE.siret.replace(/\s/g, '');
  if (!/^\d{14}$/.test(s)) return ENTREPRISE.siret;
  return `${s.slice(0, 3)} ${s.slice(3, 6)} ${s.slice(6, 9)} ${s.slice(9)}`;
}

export const DERNIERE_MAJ = '13 août 2026';

/* Données de démonstration du portail.

   DEUX PARTENAIRES, un seul portail. Le produit ne change pas d'un cas à
   l'autre — mêmes écrans, même livrable, même enchaînement — seuls changent
   l'habillage, le vocabulaire et le périmètre du second regard :

     Towson University    une INSTITUTION reçoit les dossiers de ses admis.
     Trackhouse           une AGENCE suit ses athlètes et ouvre l'accès aux
                          entraîneurs qui souscrivent à son vivier.

   C'est la même mécanique vue des deux bouts de la chaîne, et c'est
   précisément l'argument : l'agence prépare, l'université reçoit.

   DONNÉES RÉELLES ET DONNÉES INVENTÉES — la distinction est portée par le
   champ `reel` et elle n'est pas cosmétique :

   — Prince Folikoe est un CLIENT RÉEL, dont le dossier a été livré le
     28 août 2026. Ses bulletins sont les vrais, avec son accord. Ils vivent
     dans le store Blob privé « demo-portail », hors du dépôt Git.
   — tous les autres sont inventés, et doivent le rester. Aucune donnée d'un
     élève réel n'entre ici sans son accord explicite.

   Les libellés sont en anglais : le public de ce portail est américain. */

export type EtatPiece = 'missing' | 'received' | 'translating' | 'delivered';

/** Un fichier réellement servi, par opposition à un exemple fabriqué. */
export type Fichier = {
  nom: string;
  pages: number;
  /** Chemin sous donnees-demo/. Absent : le document est composé à la demande. */
  fichier?: string;
  /* Où se trouve, dans ce fichier, la page de certificat propre à la pièce.

     Les deux valeurs existent parce que les deux cas existent pour de vrai :
     les traductions du lycée ont été livrées une par une, chacune close par
     son certificat ; celles du collège sont venues d'un seul bloc dont le
     certificat ouvre le document et couvre les trois trimestres ensemble.

     Le dossier relié retire cette page, d'un bout ou de l'autre : il porte son
     propre certificat en tête, qui couvre les treize pièces à la fois, et
     empiler quatorze certificats dans un même document le rendrait illisible
     sans rien attester de plus. */
  certificat?: 'debut' | 'fin';
};

export type Piece = {
  /** L'intitulé tel que l'organisation l'exige — pas notre invention. */
  requirement: string;
  /* L'année scolaire à laquelle la pièce appartient, et l'unité de LECTURE du
     dossier. On suit le cursus au trimestre — c'est la maille d'un bulletin
     français — mais personne n'ouvre treize documents un par un : à l'écran on
     regroupe par année, et l'année s'ouvre en un seul PDF.

     Là où une pièce vaut à elle seule une année — un relevé annuel, un examen
     national — l'année porte simplement son intitulé. */
  annee: string;
  categorie: 'Academic' | 'Identity' | 'Language' | 'Financial';
  etat: EtatPiece;
  /** Ce que l'étudiant a déposé, quand il l'a fait. */
  original?: Fichier & { recuLe: string };
  /** Ce que nous avons produit. */
  traduction?: Fichier & { livreLe: string };
  /* Il reste un cas où une pièce suivie ne se traduit pas : un établissement
     étranger qui délivre déjà son relevé en anglais. Le champ existe pour lui,
     et pour qu'un tel document ne bloque pas le dossier en « traduction en
     cours » ni ne soit facturé. */
  traductionRequise?: boolean;
  /** La livraison qui l'a certifiée. Absent tant qu'elle n'est pas traduite. */
  livraison?: string;
};

/* Une LIVRAISON : un envoi certifié, avec son certificat et sa date.

   Un dossier peut en compter plusieurs, et il faut que le portail le dise.
   Un étudiant dépose rarement tout d'un coup — il trouve trois bulletins,
   commande, puis retrouve les autres deux semaines plus tard. Chaque envoi
   part alors avec SON certificat, qui couvre ce qu'il couvre et rien d'autre.

   Les réunir en un seul PDF sous un certificat neuf reviendrait à refaire une
   attestation à une date où le travail n'a pas eu lieu. On garde donc les
   livraisons telles qu'elles ont été faites : dossier complet à l'écran, deux
   téléchargements. */
export type Livraison = {
  /** Identifie la livraison : sert à la router et à nommer le fichier. */
  cle: string;
  /** Les commandes qu'elle réunit, telles qu'elles ont été facturées. */
  commandes: string[];
  /** Ce qu'elle couvre, en une ligne. */
  couverture: string;
  livreLe: string;
};

export type ClePartenaire = 'trackhouse' | 'towson';

export type Candidat = {
  id: string;
  partenaire: ClePartenaire;
  prenom: string;
  nom: string;
  pays: string;
  drapeau: string;
  /** Discipline pour une université, groupe d'épreuves pour une agence. */
  sport: string;
  entree: string;
  /** La référence affichée : celle de la livraison la plus récente. */
  reference: string;
  /** Les envois certifiés qui composent le dossier, du plus ancien au plus récent. */
  livraisons: Livraison[];
  /** Vrai dossier d'un vrai client, servi avec son accord. */
  reel?: boolean;
  pieces: Piece[];
};

/* ---------- Les partenaires ---------- */

export type Partenaire = {
  cle: ClePartenaire;
  nom: string;
  genre: 'agence' | 'institution';
  /** Ce que l'organisation fait, en une ligne — repris de sa propre plaquette. */
  metier: string;
  ville: string;
  /* Le domaine EST le contrôle d'accès : un lien envoyé là ne peut atterrir
     que dans une boîte de l'organisation, elle-même protégée par sa propre
     double authentification. */
  domaine: string;
  /* Logos servis depuis public/demo-*, dossiers EXCLUS DE GIT : ce sont des
     marques de tiers, réunies ici pour leur montrer leur propre maquette.
     Elles ne doivent jamais partir sur une adresse publique, ni rester en
     place quand la démonstration est montrée à quelqu'un d'autre. */
  logo: string;
  logoLargeur: number;
  logoHauteur: number;
  /** Le titre du rôle qui détient le portail. */
  responsable: string;
  /** Comment cette organisation nomme les gens qu'elle suit. */
  suivis: string;
  /** Libellés des deux regards, dans la bascule de démonstration. */
  vueProprietaire: string;
  /* Le second regard. Dans le produit réel ces valeurs viendront du compte
     connecté — c'est la session qui dira qui regarde et ce qu'il recrute. */
  entraineur: { nom: string; perimetre: string; titre: string };
};

export const PARTENAIRES: Record<ClePartenaire, Partenaire> = {
  trackhouse: {
    cle: 'trackhouse',
    nom: 'Trackhouse',
    genre: 'agence',
    metier: 'Elite recruiting service',
    ville: 'Los Angeles · Paris · Rabat',
    domaine: 'track-house.com',
    /* Le monogramme SEUL, et rien d'autre : c'est le logo en vigueur. Le
       lettrage « TRACKHOUSE » de la plaquette 2023-2024 a été écarté le
       10 septembre — c'est l'ancienne marque, et l'afficher les vieillirait
       d'un cran devant leurs propres interlocuteurs.

       Le fichier vient du PDF HD qu'ils fournissent, détouré du blanc sur
       lequel il est livré : le tracé n'a presque que des obliques, et rendre
       simplement le blanc transparent y laisserait un liseré sur chaque bord. */
    logo: '/portal/logo/trackhouse.png',
    logoLargeur: 263,
    logoHauteur: 240,
    responsable: 'Recruiting operations',
    suivis: 'athletes',
    vueProprietaire: 'Agency',
    /* Le périmètre est le GROUPE D'ÉPREUVES, et non la discipline : c'est
       ainsi que l'agence vend l'accès à son vivier — un abonnement Sprints,
       Jumps, Throws ou Distance. Un entraîneur abonné aux sprints n'a rien à
       faire dans le dossier d'un coureur de fond. */
    entraineur: { nom: 'Coach Jonathan Alexis', perimetre: 'Sprints', titre: 'Sprints package' },
  },
  towson: {
    cle: 'towson',
    nom: 'Towson University',
    genre: 'institution',
    metier: 'International admissions',
    ville: 'Towson, Maryland',
    domaine: 'towson.edu',
    logo: '/portal/logo/towson.png',
    logoLargeur: 194,
    logoHauteur: 44,
    responsable: 'International Admissions',
    suivis: 'applicants',
    vueProprietaire: 'Institution',
    entraineur: {
      nom: 'Coach Jonathan Alexis',
      perimetre: "Men's Track & Field",
      titre: "Men's Track & Field",
    },
  },
};

export const CLE_DEFAUT: ClePartenaire = 'trackhouse';

export const estClePartenaire = (v: string | undefined | null): v is ClePartenaire =>
  v === 'trackhouse' || v === 'towson';

export const partenaire = (cle: string | undefined | null): Partenaire =>
  PARTENAIRES[estClePartenaire(cle) ? cle : CLE_DEFAUT];

/** Cookie du partenaire affiché. Une préférence de démonstration, rien de plus. */
export const COOKIE_ORG = 'pt_org';

/* Drapeau de rejeu : le portail se remontre depuis l'écran d'entrée, session
   intacte. Voir app/portal/rejouer/route.ts. */
export const COOKIE_REJEU = 'pt_rejeu';

/* ---------- Ce qui est attendu, par partenaire ----------

   RESTREINT À CE QUI SE TRADUIT. Décidé le 5 septembre : une pièce qui
   n'appelle aucune traduction n'a rien à faire ici. Le passeport et le score
   d'anglais partent directement à l'école, par le canal qu'elle indique.

   Ce n'est pas qu'une simplification d'écran. Ne jamais collecter de passeport,
   c'est ne jamais détenir de pièce d'identité — même raisonnement que pour les
   relevés bancaires, écartés pour la même raison. Le périmètre se dit alors en
   une phrase : nous ne traitons que des relevés scolaires. */
export type Exigence = { requirement: string; categorie: Piece['categorie']; annee: string };

/* Sans année donnée, la pièce EST son année : c'est le cas d'un relevé annuel
   ou d'un examen, qui ne se découpe pas en trimestres. */
const aca = (requirement: string, annee?: string): Exigence => ({
  requirement,
  categorie: 'Academic',
  annee: annee ?? requirement,
});

/* L'agence suit le cursus TRIMESTRE PAR TRIMESTRE, et sur QUATRE ANNÉES.

   Deux décisions dans cette liste, et aucune n'est cosmétique.

   Le trimestre d'abord : un dossier français ou marocain compte trois
   bulletins par année. Demander « le relevé de seconde » ne veut rien dire
   là-bas, et un dossier auquel il manque le deuxième trimestre est refusé pour
   incomplétude.

   La quatrième année ensuite. Un lycée français couvre les grades 10 à 12 ;
   un high school américain en couvre QUATRE, de la 9th à la 12th. Sans la
   3ème, le dossier le mieux tenu reste incomplet aux yeux d'un registrar
   américain — et c'est un collège, pas un lycée, qui délivre ce bulletin-là,
   donc une démarche de plus pour l'étudiant. Autant la lui demander tout de
   suite. */
const TRIMESTRES: Exigence[] = [
  aca('Grade 9 — Term 1 report', 'Grade 9'),
  aca('Grade 9 — Term 2 report', 'Grade 9'),
  aca('Grade 9 — Term 3 report', 'Grade 9'),
  aca('Grade 10 — Term 1 report', 'Grade 10'),
  aca('Grade 10 — Term 2 report', 'Grade 10'),
  aca('Grade 10 — Term 3 report', 'Grade 10'),
  aca('Grade 11 — Term 1 report', 'Grade 11'),
  aca('Grade 11 — Term 2 report', 'Grade 11'),
  aca('Grade 11 — Term 3 report', 'Grade 11'),
  aca('Grade 12 — Term 1 report', 'Grade 12'),
  aca('Grade 12 — Term 2 report', 'Grade 12'),
  aca('Grade 12 — Term 3 report', 'Grade 12'),
  aca('National examination results'),
];

const EXIGENCES_PAR_PARTENAIRE: Record<ClePartenaire, Exigence[]> = {
  trackhouse: TRIMESTRES,
  towson: [
    aca('Grade 10 transcript'),
    aca('Grade 11 transcript'),
    aca('Grade 12 transcript'),
    aca('Secondary school diploma'),
    aca('National examination results'),
  ],
};

export const exigences = (p: Partenaire) => EXIGENCES_PAR_PARTENAIRE[p.cle];

const p = (
  requirement: string,
  categorie: Piece['categorie'],
  etat: EtatPiece,
  livraison?: string,
  original?: Piece['original'],
  traduction?: Piece['traduction'],
): Piece => ({ requirement, annee: requirement, categorie, etat, livraison, original, traduction });

/* ---------- Prince Folikoe — dossier RÉEL ----------

   L'intégralité du cursus secondaire, de la 3ème au baccalauréat, sans
   trimestre manquant : quatre années pleines, c'est-à-dire la 9th à la 12th
   grade telle qu'un registrar américain l'attend.

   ET IL EST ARRIVÉ EN DEUX FOIS, ce qui est le cas ordinaire :

     28 août 2026    lycée Frédéric Fays, Villeurbanne — la seconde, la
                     première, la terminale et le relevé du bac. Deux
                     commandes facturées, un seul envoi certifié.
     8 septembre     collège Molière, Lyon — les trois trimestres de 3ème,
                     retrouvés après coup. Un second envoi, son certificat.

   Le dossier est donc COMPLET à l'écran et se télécharge en DEUX documents.
   Les réunir sous un certificat neuf daterait l'attestation d'un jour où le
   travail n'a pas eu lieu.

   Les fichiers servis sont les VRAIS, avec l'accord de l'athlète. Ils vivent
   dans le store Blob privé « demo-portail », sous folikoe/ — hors du dépôt
   Git ET hors de public/, qui est servi sans aucune garde. Voir
   lib/fichier-demo.ts. */

const COLLEGE = 'PT-260907-8X5T';
const LYCEE = 'PT-260827-0RIT';

const LIVRAISONS_FOLIKOE: Livraison[] = [
  {
    cle: LYCEE,
    commandes: ['PT-260827-AASU', 'PT-260827-0RIT'],
    couverture: 'Grades 10 to 12 and the Baccalauréat',
    livreLe: '2026-08-28',
  },
  {
    cle: COLLEGE,
    commandes: [COLLEGE],
    couverture: 'Grade 9',
    livreLe: '2026-09-08',
  },
];

const fol = (
  n: number,
  requirement: string,
  annee: string,
  nomOriginal: string,
  pagesOriginal: number,
  pagesTraduction: number,
  livraison: Livraison,
  /* Où se trouve le certificat dans le fichier livré. Les traductions du lycée
     sont parties une par une, chacune close par le sien ; celles du collège
     sont venues d'un bloc dont le certificat ouvre le document. */
  ou: 'debut' | 'fin',
  recuLe: string,
): Piece => {
  const num = String(n).padStart(2, '0');
  return {
    requirement,
    annee,
    categorie: 'Academic',
    etat: 'delivered',
    livraison: livraison.cle,
    original: {
      nom: `${nomOriginal}.pdf`,
      pages: pagesOriginal,
      fichier: `folikoe/${num}-original.pdf`,
      recuLe,
    },
    traduction: {
      nom: `${requirement.replace(/—/g, '-')} - certified translation.pdf`,
      pages: pagesTraduction,
      fichier: `folikoe/${num}-translation.pdf`,
      certificat: ou,
      livreLe: livraison.livreLe,
    },
  };
};

const [ENVOI_LYCEE, ENVOI_COLLEGE] = LIVRAISONS_FOLIKOE;

/** Un bulletin de 3ème : collège Molière, année 2020/2021. */
const troisieme = (n: number, t: number, po: number, pt: number) =>
  fol(n, `Grade 9 — Term ${t} report`, 'Grade 9', `Bulletin 3EME4 2020-2021 T${t}`, po, pt,
      ENVOI_COLLEGE, 'debut', '2026-09-07');

/** Un bulletin du lycée Frédéric Fays, ou le relevé du bac. */
const lycee = (n: number, requirement: string, annee: string, nom: string, po: number, pt: number) =>
  fol(n, requirement, annee, nom, po, pt, ENVOI_LYCEE, 'fin', '2026-08-27');

const FOLIKOE: Candidat = {
  id: 'p-folikoe',
  partenaire: 'trackhouse',
  prenom: 'Prince',
  nom: 'Folikoe',
  pays: 'France',
  drapeau: '🇫🇷',
  sport: 'Sprints',
  entree: 'Fall 2026',
  reference: COLLEGE,
  livraisons: LIVRAISONS_FOLIKOE,
  reel: true,
  pieces: [
    troisieme(1, 1, 1, 2),
    troisieme(2, 2, 2, 3),
    troisieme(3, 3, 1, 2),
    lycee(4, 'Grade 10 — Term 1 report', 'Grade 10', 'Bulletin 2DE02 2021-2022 T1', 1, 2),
    lycee(5, 'Grade 10 — Term 2 report', 'Grade 10', 'Bulletin 2DE02 2021-2022 T2', 2, 3),
    lycee(6, 'Grade 10 — Term 3 report', 'Grade 10', 'Bulletin 2DE02 2021-2022 T3', 2, 3),
    lycee(7, 'Grade 11 — Term 1 report', 'Grade 11', 'Bulletin 1G1 2022-2023 T1', 2, 3),
    lycee(8, 'Grade 11 — Term 2 report', 'Grade 11', 'Bulletin 1G1 2022-2023 T2', 2, 3),
    lycee(9, 'Grade 11 — Term 3 report', 'Grade 11', 'Bulletin 1G1 2022-2023 T3', 2, 3),
    lycee(10, 'Grade 12 — Term 1 report', 'Grade 12', 'Bulletin TG1 2023-2024 T1', 2, 3),
    lycee(11, 'Grade 12 — Term 2 report', 'Grade 12', 'Bulletin TG1 2023-2024 T2', 1, 2),
    lycee(12, 'Grade 12 — Term 3 report', 'Grade 12', 'Bulletin TG1 2023-2024 T3', 1, 2),
    lycee(13, 'National examination results', 'National examination results', 'Releve de notes Baccalaureat 2024', 1, 2),
    /* Le DIPLÔME du bac, lui, n'est pas passé par nous : Prince l'a fait
       traduire ailleurs avant de nous confier le reste. Il manque donc à ce
       dossier, et le portail doit le dire — un dossier annoncé complet alors
       qu'il lui manque une pièce est pire qu'un dossier incomplet assumé.
       Il se comblera le jour où on ajoutera le document à la main. */
    {
      requirement: 'Secondary school diploma',
      annee: 'Secondary school diploma',
      categorie: 'Academic',
      etat: 'missing',
    },
  ],
};

/* Les trois autres athlètes sont INVENTÉS. Leurs pays suivent la carte réelle
   des recruteurs de l'agence — Maroc, Kenya, Colombie — pour que la liste
   ressemble à un vivier plutôt qu'à un jeu d'essai. Aucun n'existe. */
const inv = (
  e: Exigence,
  etat: EtatPiece,
  livraison: string,
  nom?: string,
  pagesOriginal = 2,
  pagesTraduction = 2,
): Piece => ({
  requirement: e.requirement,
  annee: e.annee,
  categorie: 'Academic',
  etat,
  livraison: etat === 'delivered' ? livraison : undefined,
  original: nom ? { nom: `${nom}.pdf`, pages: pagesOriginal, recuLe: '2026-09-05' } : undefined,
  traduction:
    etat === 'delivered'
      ? {
          nom: `${e.requirement.replace(/—/g, '-')} - certified translation.pdf`,
          pages: pagesTraduction,
          livreLe: '2026-09-07',
        }
      : undefined,
});

/** Une livraison unique, pour un dossier qui n'a pas été fractionné. */
const envoiSimple = (reference: string, livreLe = '2026-09-07'): Livraison[] => [
  { cle: reference, commandes: [reference], couverture: 'The full academic file', livreLe },
];

/* Les intitulés des quatre années, dans l'ordre — ce que l'agence attend de
   chaque athlète. On les reprend d'EXIGENCES pour qu'un ajout dans la liste se
   propage partout au lieu d'être recopié dans quatre dossiers. */
const T = TRIMESTRES;

export const CANDIDATS: Candidat[] = [
  FOLIKOE,
  {
    id: 'y-bouzid',
    partenaire: 'trackhouse',
    prenom: 'Yassine',
    nom: 'Bouzid',
    pays: 'Morocco',
    drapeau: '🇲🇦',
    sport: 'Distance',
    entree: 'Fall 2027',
    reference: 'PT-260905-Q9VD',
    livraisons: envoiSimple('PT-260905-Q9VD'),
    pieces: [
      inv(T[0], 'delivered', 'PT-260905-Q9VD', 'Bulletin college 3eme S1', 1),
      inv(T[1], 'delivered', 'PT-260905-Q9VD', 'Bulletin college 3eme S2', 1),
      inv(T[2], 'delivered', 'PT-260905-Q9VD', 'Bulletin college 3eme S3', 1),
      inv(T[3], 'delivered', 'PT-260905-Q9VD', 'Bulletin tronc commun T1'),
      inv(T[4], 'delivered', 'PT-260905-Q9VD', 'Bulletin tronc commun T2'),
      inv(T[5], 'delivered', 'PT-260905-Q9VD', 'Bulletin tronc commun T3'),
      inv(T[6], 'delivered', 'PT-260905-Q9VD', 'Bulletin 1re annee bac T1'),
      inv(T[7], 'translating', 'PT-260905-Q9VD', 'Bulletin 1re annee bac T2'),
      inv(T[8], 'translating', 'PT-260905-Q9VD', 'Bulletin 1re annee bac T3'),
      inv(T[9], 'received', 'PT-260905-Q9VD', 'Bulletin 2e annee bac T1'),
      inv(T[10], 'missing', 'PT-260905-Q9VD'),
      inv(T[11], 'missing', 'PT-260905-Q9VD'),
      inv(T[12], 'missing', 'PT-260905-Q9VD'),
    ],
  },
  {
    id: 'g-wanjiru',
    partenaire: 'trackhouse',
    prenom: 'Grace',
    nom: 'Wanjiru',
    pays: 'Kenya',
    drapeau: '🇰🇪',
    sport: 'Distance',
    entree: 'Fall 2027',
    reference: 'PT-260906-3JKL',
    livraisons: envoiSimple('PT-260906-3JKL'),
    pieces: TRIMESTRES.map((e, i) => ({
      /* Le Kenya délivre ses relevés en anglais : rien à traduire, et rien à
         facturer. La pièce est suivie quand même — l'agence a besoin de savoir
         qu'elle est là — mais elle n'entre ni dans le décompte des traductions
         ni dans un dossier certifié. */
      ...inv(e, 'received', 'PT-260906-3JKL', `KCSE record ${i + 1}`, 1),
      traductionRequise: false,
    })),
  },
  {
    id: 'm-restrepo',
    partenaire: 'trackhouse',
    prenom: 'Mateo',
    nom: 'Restrepo',
    pays: 'Colombia',
    drapeau: '🇨🇴',
    sport: 'Sprints',
    entree: 'Spring 2027',
    reference: 'PT-260908-7XBN',
    livraisons: envoiSimple('PT-260908-7XBN', '2026-09-09'),
    pieces: [
      inv(T[0], 'delivered', 'PT-260908-7XBN', 'Boletin noveno P1', 1, 2),
      inv(T[1], 'delivered', 'PT-260908-7XBN', 'Boletin noveno P2', 1, 2),
      inv(T[2], 'delivered', 'PT-260908-7XBN', 'Boletin noveno P3', 1, 2),
      inv(T[3], 'delivered', 'PT-260908-7XBN', 'Boletin decimo P1', 1, 2),
      inv(T[4], 'delivered', 'PT-260908-7XBN', 'Boletin decimo P2', 1, 2),
      inv(T[5], 'delivered', 'PT-260908-7XBN', 'Boletin decimo P3', 1, 2),
      inv(T[6], 'delivered', 'PT-260908-7XBN', 'Boletin once P1', 1, 2),
      inv(T[7], 'delivered', 'PT-260908-7XBN', 'Boletin once P2', 1, 2),
      inv(T[8], 'delivered', 'PT-260908-7XBN', 'Boletin once P3', 1, 2),
      inv(T[9], 'translating', 'PT-260908-7XBN', 'Boletin doce P1', 1),
      inv(T[10], 'translating', 'PT-260908-7XBN', 'Boletin doce P2', 1),
      inv(T[11], 'missing', 'PT-260908-7XBN'),
      inv(T[12], 'delivered', 'PT-260908-7XBN', 'Resultados ICFES Saber 11', 1, 2),
    ],
  },

  /* ---------- Towson University — entièrement fictif ---------- */
  {
    id: 'j-dupont',
    partenaire: 'towson',
    prenom: 'Jean',
    nom: 'Dupont',
    pays: 'France',
    drapeau: '🇫🇷',
    sport: "Men's Track & Field",
    entree: 'Fall 2027',
    reference: 'PT-260902-K4RM',
    livraisons: envoiSimple('PT-260902-K4RM', '2026-09-03'),
    pieces: [
      p('Grade 10 transcript', 'Academic', 'delivered', 'PT-260902-K4RM',
        { nom: 'Bulletin 2nde 2023-2024.pdf', pages: 2, recuLe: '2026-09-02' },
        { nom: 'Grade 10 transcript — certified translation.pdf', pages: 2, livreLe: '2026-09-03' }),
      p('Grade 11 transcript', 'Academic', 'delivered', 'PT-260902-K4RM',
        { nom: 'Bulletin 1re 2024-2025.pdf', pages: 2, recuLe: '2026-09-02' },
        { nom: 'Grade 11 transcript — certified translation.pdf', pages: 2, livreLe: '2026-09-03' }),
      p('Grade 12 transcript', 'Academic', 'delivered', 'PT-260902-K4RM',
        { nom: 'Bulletin Terminale 2025-2026.pdf', pages: 3, recuLe: '2026-09-02' },
        { nom: 'Grade 12 transcript — certified translation.pdf', pages: 3, livreLe: '2026-09-03' }),
      p('Secondary school diploma', 'Academic', 'delivered', 'PT-260902-K4RM',
        { nom: 'Diplome Baccalaureat.pdf', pages: 1, recuLe: '2026-09-02' },
        { nom: 'Secondary school diploma — certified translation.pdf', pages: 1, livreLe: '2026-09-03' }),
      p('National examination results', 'Academic', 'delivered', 'PT-260902-K4RM',
        { nom: 'Releve de notes Bac 2026.pdf', pages: 1, recuLe: '2026-09-02' },
        { nom: 'National examination results — certified translation.pdf', pages: 1, livreLe: '2026-09-03' }),
    ],
  },
  {
    id: 'c-mendes',
    partenaire: 'towson',
    prenom: 'Carlos',
    nom: 'Mendes',
    pays: 'Brazil',
    drapeau: '🇧🇷',
    sport: "Men's Soccer",
    entree: 'Fall 2027',
    reference: 'PT-260904-8TQZ',
    livraisons: envoiSimple('PT-260904-8TQZ', '2026-09-05'),
    pieces: [
      p('Grade 10 transcript', 'Academic', 'delivered', 'PT-260904-8TQZ',
        { nom: 'Historico 1o ano.pdf', pages: 1, recuLe: '2026-09-04' },
        { nom: 'Grade 10 transcript — certified translation.pdf', pages: 1, livreLe: '2026-09-05' }),
      p('Grade 11 transcript', 'Academic', 'missing'),
      p('Grade 12 transcript', 'Academic', 'delivered', 'PT-260904-8TQZ',
        { nom: 'Historico 3o ano.pdf', pages: 1, recuLe: '2026-09-04' },
        { nom: 'Grade 12 transcript — certified translation.pdf', pages: 1, livreLe: '2026-09-05' }),
      p('Secondary school diploma', 'Academic', 'delivered', 'PT-260904-8TQZ',
        { nom: 'Certificado de Conclusao.pdf', pages: 1, recuLe: '2026-09-04' },
        { nom: 'Secondary school diploma — certified translation.pdf', pages: 1, livreLe: '2026-09-05' }),
      p('National examination results', 'Academic', 'missing'),
    ],
  },
  {
    id: 'a-schmidt',
    partenaire: 'towson',
    prenom: 'Anna',
    nom: 'Schmidt',
    pays: 'Germany',
    drapeau: '🇩🇪',
    sport: "Women's Volleyball",
    entree: 'Spring 2027',
    reference: 'PT-260905-2WNP',
    livraisons: envoiSimple('PT-260905-2WNP'),
    pieces: [
      p('Grade 10 transcript', 'Academic', 'translating', undefined,
        { nom: 'Zeugnis Klasse 10.pdf', pages: 1, recuLe: '2026-09-05' }),
      p('Grade 11 transcript', 'Academic', 'translating', undefined,
        { nom: 'Zeugnis Klasse 11.pdf', pages: 1, recuLe: '2026-09-05' }),
      p('Grade 12 transcript', 'Academic', 'translating', undefined,
        { nom: 'Zeugnis Klasse 12.pdf', pages: 2, recuLe: '2026-09-05' }),
      p('Secondary school diploma', 'Academic', 'translating', undefined,
        { nom: 'Abiturzeugnis.pdf', pages: 2, recuLe: '2026-09-05' }),
      p('National examination results', 'Academic', 'received', undefined,
        { nom: 'Abitur Ergebnisse.pdf', pages: 1, recuLe: '2026-09-05' }),
    ],
  },
  {
    id: 'y-elamrani',
    partenaire: 'towson',
    prenom: 'Youssef',
    nom: 'El Amrani',
    pays: 'Morocco',
    drapeau: '🇲🇦',
    sport: "Men's Track & Field",
    entree: 'Fall 2027',
    reference: 'PT-260905-Q9VD',
    livraisons: envoiSimple('PT-260905-Q9VD'),
    pieces: [
      p('Grade 10 transcript', 'Academic', 'received', undefined,
        { nom: 'Bulletin tronc commun.pdf', pages: 1, recuLe: '2026-09-05' }),
      p('Grade 11 transcript', 'Academic', 'received', undefined,
        { nom: 'Bulletin 1re annee bac.pdf', pages: 1, recuLe: '2026-09-05' }),
      p('Grade 12 transcript', 'Academic', 'missing'),
      p('Secondary school diploma', 'Academic', 'missing'),
      p('National examination results', 'Academic', 'missing'),
    ],
  },
];

/* ---------- Lectures dérivées ---------- */

export const ETATS: Record<EtatPiece, { texte: string; ton: 'ok' | 'attente' | 'manque' }> = {
  delivered: { texte: 'Translated', ton: 'ok' },
  translating: { texte: 'In translation', ton: 'attente' },
  received: { texte: 'Received', ton: 'attente' },
  missing: { texte: 'Not received', ton: 'manque' },
};

/** Une pièce est-elle terminée du point de vue de l'organisation ? */
export const aboutie = (x: Piece) =>
  x.etat === 'delivered' || (x.etat === 'received' && x.traductionRequise === false);

export function avancement(c: Candidat) {
  const attendues = c.pieces.length;
  const recues = c.pieces.filter((x) => x.etat !== 'missing').length;
  const manquantes = c.pieces.filter((x) => x.etat === 'missing');
  const enCours = c.pieces.some((x) => x.etat === 'translating');
  return {
    attendues,
    recues,
    manquantes,
    enCours,
    /* L'ordre de ces trois cas dit ce qui appelle une action : ce qui manque
       vient de l'étudiant, ce qui traduit vient de nous, et « complete » ne
       s'affiche que quand plus personne n'a rien à faire — donc quand chaque
       pièce est aboutie : reçue et traduite, ou reçue quand la traduction n'a
       pas lieu d'être. */
    resume: manquantes.length
      ? { texte: `${manquantes.length} document${manquantes.length > 1 ? 's' : ''} outstanding`, ton: 'manque' as const }
      : enCours || !c.pieces.every(aboutie)
        ? { texte: 'Translation in progress', ton: 'attente' as const }
        : { texte: 'Complete', ton: 'ok' as const },
  };
}

/* ---------- Le dossier vu PAR ANNÉE ----------

   Le suivi se fait au trimestre : c'est la maille d'un bulletin français, et
   c'est ce qu'on relance quand il manque quelque chose. La LECTURE, elle, se
   fait par année — personne n'ouvre treize documents un par un pour se faire
   une idée d'un élève.

   Une année s'ouvre donc en un seul PDF, ses trimestres mis bout à bout, et
   SANS les pages de certificat. Le certificat n'a de sens que sur le document
   qui circule : celui qu'on télécharge, pas celui qu'on regarde à l'écran.
   C'est aussi ce qui évite qu'un extrait de consultation, enregistré depuis le
   navigateur, se mette à ressembler à une pièce certifiée. */
export type AnneeDossier = {
  nom: string;
  pieces: Piece[];
  manquantes: Piece[];
  /** L'état le plus défavorable de l'année : c'est lui qui appelle une action. */
  etat: EtatPiece;
  /** Aucune des pièces n'appelle de traduction — tout était déjà en anglais. */
  rienATraduire: boolean;
  /** Pages une fois les trimestres réunis, certificats retirés. */
  pagesOriginal: number;
  pagesTraduction: number;
  recuLe?: string;
  livreLe?: string;
};

export function anneesDuDossier(c: Candidat): AnneeDossier[] {
  const ordre: string[] = [];
  const parNom = new Map<string, Piece[]>();
  for (const piece of c.pieces) {
    if (!parNom.has(piece.annee)) {
      parNom.set(piece.annee, []);
      ordre.push(piece.annee);
    }
    parNom.get(piece.annee)!.push(piece);
  }

  return ordre.map((nom) => {
    const pieces = parNom.get(nom)!;
    const manquantes = pieces.filter((x) => x.etat === 'missing');

    /* L'ordre de ces cas dit ce qui appelle une action : ce qui manque vient
       de l'étudiant, ce qui traduit vient de nous, et « delivered » ne
       s'affiche que quand plus personne n'a rien à faire. */
    const etat: EtatPiece = manquantes.length
      ? 'missing'
      : pieces.some((x) => x.etat === 'translating')
        ? 'translating'
        : pieces.every(aboutie)
          ? pieces.every((x) => x.traductionRequise === false)
            ? 'received'
            : 'delivered'
          : 'received';

    const dernier = (dates: (string | undefined)[]) =>
      dates.filter(Boolean).sort().pop() as string | undefined;

    return {
      nom,
      pieces,
      manquantes,
      etat,
      rienATraduire: pieces.every((x) => x.traductionRequise === false),
      pagesOriginal: pieces.reduce((n, x) => n + (x.original?.pages ?? 0), 0),
      /* Chaque traduction réunie perd sa page de certificat — un seul
         certificat par document, et il n'est pas dans celui-ci. */
      pagesTraduction: pieces.reduce(
        (n, x) => n + (x.traduction ? x.traduction.pages - (x.traduction.certificat ? 1 : 0) : 0),
        0,
      ),
      recuLe: dernier(pieces.map((x) => x.original?.recuLe)),
      livreLe: dernier(pieces.map((x) => x.traduction?.livreLe)),
    };
  });
}

/* ---------- Périmètre du second regard ----------

   Un entraîneur voit le dossier ENTIER des athlètes qu'il recrute, et ceux-là
   seulement. C'est la bonne ligne de partage : lui cacher les notes ne
   protégeait rien — l'athlète les lui envoie de toute façon — alors que le
   laisser ouvrir le dossier d'un athlète hors de son périmètre est
   précisément ce qu'un service compliance refusera.

   Ce que « son périmètre » veut dire dépend du partenaire : une discipline
   pour une université, un groupe d'épreuves pour l'agence, qui vend l'accès à
   son vivier par épreuve. Dans le produit réel il viendra du COMPTE, jamais
   d'un paramètre d'adresse : c'est la session qui dira ce qu'un entraîneur
   recrute.

   Règle qui va avec, et qui compte davantage que le filtrage de la liste :
   `dansLePerimetre` est vérifié aussi à l'ouverture d'un dossier. Une liste
   filtrée dont les adresses restent accessibles ne restreint rien, elle cache. */
export const dansLePerimetre = (c: Candidat, pa: Partenaire, coach: boolean) =>
  c.partenaire === pa.cle && (!coach || c.sport === pa.entraineur.perimetre);

/** Les dossiers d'un partenaire, vus par un rôle donné. */
export const roster = (pa: Partenaire, coach: boolean) =>
  CANDIDATS.filter((c) => dansLePerimetre(c, pa, coach));

export const trouver = (id: string) => CANDIDATS.find((c) => c.id === id);

/* ---------- Relance de l'étudiant ----------

   Le message est rédigé ici, pas laissé à écrire à chaque fois : une relance
   qu'il faut composer soi-même n'est pas envoyée. Sobre, sans emoji, et
   nommant les pièces exactes — c'est un message d'admission, pas un rappel
   d'application.

   WhatsApp plutôt que SMS : les athlètes recrutés sont à l'étranger, et c'est
   par là que les entraîneurs les joignent réellement. Le lien ouvre
   l'application installée sur mobile comme sur ordinateur.

   Sans numéro de téléphone dans la maquette, WhatsApp ouvre son sélecteur de
   contact avec le message déjà écrit. Le produit réel passera le numéro de
   l'étudiant dans l'adresse, et la conversation s'ouvrira directement. */
export function messageRelance(c: Candidat, organisation: string) {
  const manquantes = avancement(c).manquantes;
  const lignes = manquantes.map((m, i) => `${i + 1}. ${m.requirement}`).join('\n');

  return (
    `Hi ${c.prenom},\n\n` +
    `${organisation} still needs ${manquantes.length} document` +
    `${manquantes.length > 1 ? 's' : ''} to complete your academic file:\n\n` +
    `${lignes}\n\n` +
    `Once you send them, the certified English translations are produced and delivered for you.\n\n` +
    `Reference: ${c.reference}`
  );
}

export const lienEmail = (c: Candidat, organisation: string, texte: string) =>
  `mailto:?subject=${encodeURIComponent(
    `${organisation} — documents still needed (${c.reference})`,
  )}&body=${encodeURIComponent(texte)}`;

/* Données de démonstration du portail universitaire.

   ENTIÈREMENT FICTIVES, et elles doivent le rester. Aucune donnée d'un élève
   réel ne doit jamais entrer dans ce fichier : il sert à filmer le produit et
   à le montrer avant qu'il ait des clients.

   L'établissement est inventé lui aussi. On ne se sert pas du nom ni du logo
   d'une université réelle sans son accord — un service juridique universitaire
   le remarque, et c'est le genre de détail qui ferme une porte définitivement.

   Les libellés sont en anglais : le public de ce portail est américain. */

export type EtatPiece = 'missing' | 'received' | 'translating' | 'delivered';

export type Piece = {
  /** L'intitulé tel que l'ÉTABLISSEMENT l'exige — pas notre invention. */
  requirement: string;
  categorie: 'Academic' | 'Identity' | 'Language' | 'Financial';
  etat: EtatPiece;
  /** Ce que l'étudiant a déposé, quand il l'a fait. */
  original?: { nom: string; pages: number; recuLe: string };
  /** Ce que nous avons produit. */
  traduction?: { nom: string; pages: number; livreLe: string };
  /* Il reste un cas où une pièce suivie ne se traduit pas : un établissement
     étranger qui délivre déjà son relevé en anglais. Le champ existe pour lui,
     et pour qu'un tel document ne bloque pas le dossier en « traduction en
     cours » ni ne soit facturé. */
  traductionRequise?: boolean;
};

export type Candidat = {
  id: string;
  prenom: string;
  nom: string;
  pays: string;
  drapeau: string;
  sport: string;
  entree: string;
  reference: string;
  pieces: Piece[];
};

export const ETABLISSEMENT = {
  nom: 'Towson University',
  ville: 'Towson, Maryland',
  /* Le domaine EST le contrôle d'accès : un lien envoyé là ne peut atterrir
     que dans une boîte de l'établissement, elle-même protégée par leur propre
     double authentification. */
  domaine: 'towson.edu',
  /* Logo servi depuis public/demo-towson/, dossier EXCLU DE GIT : c'est la
     marque d'un tiers, réunie ici pour lui montrer sa propre maquette. Elle
     ne doit jamais partir sur une adresse publique, ni rester en place si la
     démonstration est montrée à un autre établissement. */
  logo: '/demo-towson/towson-university-logo-couleurs.png',
  /* Le contact déclaré côté école : c'est cette personne qui définit la liste
     des pièces exigées. Nous ne la devinons jamais. */
  responsable: 'International Admissions',
};

/* La liste vient de l'établissement, mais RESTREINTE À CE QUI SE TRADUIT.

   Décidé le 5 septembre : une pièce qui n'appelle aucune traduction n'a rien
   à faire ici. Le passeport et le score d'anglais partent directement à
   l'école, par le canal qu'elle indique.

   Ce n'est pas qu'une simplification d'écran. Ne jamais collecter de passeport,
   c'est ne jamais détenir de pièce d'identité — même raisonnement que pour les
   relevés bancaires, écartés pour la même raison. Le périmètre se dit alors en
   une phrase : nous ne traitons que des relevés scolaires. */
export const EXIGENCES: { requirement: string; categorie: Piece['categorie'] }[] = [
  { requirement: 'Grade 10 transcript', categorie: 'Academic' },
  { requirement: 'Grade 11 transcript', categorie: 'Academic' },
  { requirement: 'Grade 12 transcript', categorie: 'Academic' },
  { requirement: 'Secondary school diploma', categorie: 'Academic' },
  { requirement: 'National examination results', categorie: 'Academic' },
];

const p = (
  requirement: string,
  categorie: Piece['categorie'],
  etat: EtatPiece,
  original?: Piece['original'],
  traduction?: Piece['traduction'],
): Piece => ({
  requirement,
  categorie,
  etat,
  original,
  traduction,
});

export const CANDIDATS: Candidat[] = [
  {
    id: 'j-dupont',
    prenom: 'Jean',
    nom: 'Dupont',
    pays: 'France',
    drapeau: '🇫🇷',
    sport: "Men's Track & Field",
    entree: 'Fall 2027',
    reference: 'PT-260902-K4RM',
    pieces: [
      p('Grade 10 transcript', 'Academic', 'delivered',
        { nom: 'Bulletin 2nde 2023-2024.pdf', pages: 2, recuLe: '2026-09-02' },
        { nom: 'Grade 10 transcript — certified translation.pdf', pages: 2, livreLe: '2026-09-03' }),
      p('Grade 11 transcript', 'Academic', 'delivered',
        { nom: 'Bulletin 1re 2024-2025.pdf', pages: 2, recuLe: '2026-09-02' },
        { nom: 'Grade 11 transcript — certified translation.pdf', pages: 2, livreLe: '2026-09-03' }),
      p('Grade 12 transcript', 'Academic', 'delivered',
        { nom: 'Bulletin Terminale 2025-2026.pdf', pages: 3, recuLe: '2026-09-02' },
        { nom: 'Grade 12 transcript — certified translation.pdf', pages: 3, livreLe: '2026-09-03' }),
      p('Secondary school diploma', 'Academic', 'delivered',
        { nom: 'Diplome Baccalaureat.pdf', pages: 1, recuLe: '2026-09-02' },
        { nom: 'Secondary school diploma — certified translation.pdf', pages: 1, livreLe: '2026-09-03' }),
      p('National examination results', 'Academic', 'delivered',
        { nom: 'Releve de notes Bac 2026.pdf', pages: 1, recuLe: '2026-09-02' },
        { nom: 'National examination results — certified translation.pdf', pages: 1, livreLe: '2026-09-03' }),
    ],
  },
  {
    id: 'c-mendes',
    prenom: 'Carlos',
    nom: 'Mendes',
    pays: 'Brazil',
    drapeau: '🇧🇷',
    sport: "Men's Soccer",
    entree: 'Fall 2027',
    reference: 'PT-260904-8TQZ',
    pieces: [
      p('Grade 10 transcript', 'Academic', 'delivered',
        { nom: 'Historico 1o ano.pdf', pages: 1, recuLe: '2026-09-04' },
        { nom: 'Grade 10 transcript — certified translation.pdf', pages: 1, livreLe: '2026-09-05' }),
      p('Grade 11 transcript', 'Academic', 'missing'),
      p('Grade 12 transcript', 'Academic', 'delivered',
        { nom: 'Historico 3o ano.pdf', pages: 1, recuLe: '2026-09-04' },
        { nom: 'Grade 12 transcript — certified translation.pdf', pages: 1, livreLe: '2026-09-05' }),
      p('Secondary school diploma', 'Academic', 'delivered',
        { nom: 'Certificado de Conclusao.pdf', pages: 1, recuLe: '2026-09-04' },
        { nom: 'Secondary school diploma — certified translation.pdf', pages: 1, livreLe: '2026-09-05' }),
      p('National examination results', 'Academic', 'missing'),
    ],
  },
  {
    id: 'a-schmidt',
    prenom: 'Anna',
    nom: 'Schmidt',
    pays: 'Germany',
    drapeau: '🇩🇪',
    sport: "Women's Volleyball",
    entree: 'Spring 2027',
    reference: 'PT-260905-2WNP',
    pieces: [
      p('Grade 10 transcript', 'Academic', 'translating',
        { nom: 'Zeugnis Klasse 10.pdf', pages: 1, recuLe: '2026-09-05' }),
      p('Grade 11 transcript', 'Academic', 'translating',
        { nom: 'Zeugnis Klasse 11.pdf', pages: 1, recuLe: '2026-09-05' }),
      p('Grade 12 transcript', 'Academic', 'translating',
        { nom: 'Zeugnis Klasse 12.pdf', pages: 2, recuLe: '2026-09-05' }),
      p('Secondary school diploma', 'Academic', 'translating',
        { nom: 'Abiturzeugnis.pdf', pages: 2, recuLe: '2026-09-05' }),
      p('National examination results', 'Academic', 'received',
        { nom: 'Abitur Ergebnisse.pdf', pages: 1, recuLe: '2026-09-05' }),
    ],
  },
  {
    id: 'y-elamrani',
    prenom: 'Youssef',
    nom: 'El Amrani',
    pays: 'Morocco',
    drapeau: '🇲🇦',
    sport: "Men's Track & Field",
    entree: 'Fall 2027',
    reference: 'PT-260905-Q9VD',
    pieces: [
      p('Grade 10 transcript', 'Academic', 'received',
        { nom: 'Bulletin tronc commun.pdf', pages: 1, recuLe: '2026-09-05' }),
      p('Grade 11 transcript', 'Academic', 'received',
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

/** Une pièce est-elle terminée du point de vue de l'établissement ? */
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
       s'affiche que quand plus personne n'a rien à faire. */
    /* « Complete » ne s'affiche que si chaque pièce est aboutie : reçue et
       traduite, ou reçue quand la traduction n'a pas lieu d'être. */
    resume: manquantes.length
      ? { texte: `${manquantes.length} document${manquantes.length > 1 ? 's' : ''} outstanding`, ton: 'manque' as const }
      : enCours || !c.pieces.every(aboutie)
        ? { texte: 'Translation in progress', ton: 'attente' as const }
        : { texte: 'Complete', ton: 'ok' as const },
  };
}

/* ---------- Périmètre d'un entraîneur ----------

   Un entraîneur voit le dossier ENTIER des athlètes qu'il recrute, et ceux-là
   seulement. C'est la bonne ligne de partage : lui cacher les notes ne
   protégeait rien — l'athlète les lui envoie de toute façon — alors que le
   laisser ouvrir le dossier des recrues d'un autre sport est précisément ce
   qu'un service compliance refusera.

   Dans la maquette, le périmètre est la discipline. Dans le produit réel il
   viendra du COMPTE, jamais d'un paramètre d'adresse : c'est la session qui
   dira quels athlètes un entraîneur recrute.

   Règle qui va avec, et qui compte davantage que le filtrage de la liste :
   `dansLePerimetre` est vérifié aussi à l'ouverture d'un dossier. Une liste
   filtrée dont les adresses restent accessibles ne restreint rien, elle cache. */
export const SPORT_ENTRAINEUR = "Men's Track & Field";

/* L'entraîneur de la démonstration. Dans le produit réel, ces deux valeurs
   viendront du compte connecté — c'est la session qui dira qui regarde et
   quels athlètes il recrute. */
export const ENTRAINEUR = { nom: 'Coach Jonathan Alexis', sport: SPORT_ENTRAINEUR };

export const dansLePerimetre = (c: Candidat, coach: boolean) =>
  !coach || c.sport === SPORT_ENTRAINEUR;

/* ---------- Relance de l'étudiant ----------

   Le message est rédigé ici, pas laissé à écrire à chaque fois : une relance
   qu'il faut composer soi-même n'est pas envoyée. Sobre, sans emoji, et
   nommant les pièces exactes — c'est un message d'admission, pas un rappel
   d'application.

   WhatsApp plutôt que SMS : les athlètes recrutés sont à l'étranger, et c'est
   par là que les entraîneurs les joignent réellement. Le lien wa.me ouvre
   l'application installée sur mobile comme sur ordinateur.

   Sans numéro de téléphone dans la maquette, WhatsApp ouvre son sélecteur de
   contact avec le message déjà écrit. Le produit réel passera le numéro de
   l'étudiant dans l'adresse, et la conversation s'ouvrira directement.

   L'ouverture est faite par le composant RelanceWhatsApp, qui s'adresse à
   l'application installée plutôt qu'au site wa.me — celui-ci propose de
   télécharger WhatsApp avant de proposer de l'ouvrir. */
export function messageRelance(c: Candidat, etablissement: string) {
  const manquantes = avancement(c).manquantes;
  const lignes = manquantes.map((m, i) => `${i + 1}. ${m.requirement}`).join('\n');

  return (
    `Hi ${c.prenom},\n\n` +
    `${etablissement} still needs ${manquantes.length} document` +
    `${manquantes.length > 1 ? 's' : ''} to complete your international application file:\n\n` +
    `${lignes}\n\n` +
    `Once you send them, the certified English translations are produced and delivered to the university for you.\n\n` +
    `Reference: ${c.reference}`
  );
}

export const lienEmail = (c: Candidat, etablissement: string, texte: string) =>
  `mailto:?subject=${encodeURIComponent(
    `${etablissement} — documents still needed (${c.reference})`,
  )}&body=${encodeURIComponent(texte)}`;

export const trouver = (id: string) => CANDIDATS.find((c) => c.id === id);

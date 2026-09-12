/* La démarche NCAA, côté élève.

   CE QUE LA NCAA EXIGE, ET QUI COMMANDE TOUT LE RESTE — vérifié sur le guide
   officiel « International Academic Standards for Athletics Eligibility »
   et la fiche « Submitting International Documents » :

   — Les documents partent à ec-processing@ncaa.org. Cette adresse n'est
     ouverte qu'aux établissements, aux ministères et organismes émetteurs,
     et aux services de traduction pour les seules traductions.
   — L'envoi doit venir d'une ADRESSE OFFICIELLE d'établissement. Les
     messages venant de Gmail, Yahoo ou Hotmail sont refusés. C'est le piège
     le plus coûteux : une secrétaire qui transfère depuis sa boîte
     personnelle fait échouer la démarche sans que personne s'en aperçoive
     avant des semaines.
   — L'objet doit porter le NOM de l'élève et son NCAA ID, sans quoi rien
     n'est rattaché à son dossier.
   — Les pièces en langue étrangère doivent être accompagnées d'une
     traduction anglaise certifiée.

   L'élève ne peut donc rien envoyer lui-même. Tout ce que ce fichier
   fabrique sert à une seule chose : qu'il n'ait qu'à transmettre un message
   déjà écrit à son établissement, et que celui-ci comprenne en dix secondes
   ce qu'on attend de lui. */

export const ADRESSE_NCAA = 'ec-processing@ncaa.org';

export type InfosNcaa = {
  /** L'identifiant délivré par l'Eligibility Center à l'inscription. */
  id: string;
  /** ISO court, AAAA-MM-JJ. Ce qui permet au lycée de retrouver l'élève. */
  naissance?: string;
  telephone?: string;
  enregistreLe: string;
};

/* Dix chiffres en général, mais on ne le fige pas : un format refusé à tort
   coûte plus cher qu'un format accepté trop largement, que la NCAA rejettera
   de toute façon si elle ne le reconnaît pas. */
export const ncaaIdValide = (v: string) => /^[0-9]{6,14}$/.test(v.replace(/\s/g, ''));

export const dateLisible = (iso?: string) => {
  if (!iso) return null;
  const [a, m, j] = iso.split('-');
  return a && m && j ? `${j}/${m}/${a}` : null;
};

export type Eleve = {
  prenom: string;
  nom: string;
  ncaa: InfosNcaa;
  /** Ce que réunit le document livré, en clair. Une liste par défaut sinon. */
  pieces?: string[];
};

/** L'objet EXACT que le lycée doit reprendre. Le nom et l'identifiant, rien d'autre. */
export const objetPourLaNcaa = (e: Eleve) =>
  `${e.prenom} ${e.nom.toUpperCase()} — NCAA ID ${e.ncaa.id}`;

/* « élève de Lycée Frédéric Fays » se lit comme une faute, et ce message est
   signé par l'élève : il doit être écrit comme il l'aurait écrit lui-même. */
function avecArticle(nom: string) {
  const n = nom.trim();
  /* Sur le PREMIER MOT, sans accents : « \b » de JavaScript ne reconnaît pas
     la frontière après un « é », et « Cité scolaire » passait au travers. */
  const tete = n
    .split(/\s+/)[0]
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  if (['lycee', 'college', 'groupe', 'centre', 'conservatoire'].includes(tete)) return `du ${n}`;
  if (['cite', 'faculte', 'maison', 'section'].includes(tete)) return `de la ${n}`;
  // Commence par une voyelle : l'élision s'impose.
  if (['ecole', 'institut', 'universite', 'academie', 'etablissement'].includes(tete)) {
    return `de l\u2019${n}`;
  }
  return `de ${n}`;
}

/* Le message que l'élève transmet à son établissement.

   Écrit pour une secrétaire de vie scolaire qui n'a jamais entendu parler de
   la NCAA et qui traite trente demandes par jour : ce qu'on demande tient
   dans les premières lignes, les deux contraintes qui font échouer l'envoi
   sont isolées et numérotées, et la formulation reste celle d'un ancien élève
   qui demande un service — pas celle d'une administration qui somme. */
export function messageAuLycee(e: Eleve, etablissement?: string) {
  const naissance = dateLisible(e.ncaa.naissance);
  /* UN SEUL DOCUMENT, et c'est tout le raisonnement de ce message.

     Nous livrons un PDF unique qui réunit le parcours entier — de la 3e au
     baccalauréat, diplôme compris — chaque pièce suivie de sa traduction
     certifiée. L'établissement n'a donc rien à rassembler, rien à choisir,
     rien à scanner : il transmet la pièce jointe telle quelle. Une demande
     qui tient en un geste est une demande qui aboutit ; une demande qui
     suppose de retrouver huit bulletins dans un dossier d'archives attend
     trois semaines, puis se perd. */
  const contenu = e.pieces?.length
    ? e.pieces.join(', ')
    : 'mes bulletins de la 3e à la terminale, mon diplôme et mon relevé de notes du baccalauréat';

  return (
    `Madame, Monsieur,\n\n` +
    `Je m'appelle ${e.prenom} ${e.nom.toUpperCase()}${naissance ? `, né(e) le ${naissance}` : ''}, ` +
    `ancien(ne) élève ${etablissement ? avecArticle(etablissement) : 'de votre établissement'}.\n\n` +
    `Je candidate dans une université américaine. L'organisme qui valide les dossiers scolaires, ` +
    `la NCAA Eligibility Center, exige que ce soit l'établissement lui-même qui lui transmette les ` +
    `documents : je n'ai pas le droit de les envoyer moi-même.\n\n` +
    `Je joins à ce message un document PDF unique qui réunit ${contenu}, ` +
    `chaque pièce étant suivie de sa traduction anglaise certifiée.\n\n` +
    `Pourriez-vous le transmettre tel quel, en pièce jointe, à ${ADRESSE_NCAA} ?\n\n` +
    `Deux points sur lesquels la NCAA est stricte, et qui font refuser l'envoi s'ils ne sont pas ` +
    `respectés :\n\n` +
    `   1. L'objet du message doit être exactement :\n` +
    `      ${objetPourLaNcaa(e)}\n\n` +
    `   2. L'e-mail doit partir d'une adresse officielle de l'établissement. ` +
    `Les envois venant d'une adresse personnelle (Gmail, Yahoo, Hotmail…) sont refusés.\n\n` +
    `Je vous remercie sincèrement du temps que vous voudrez bien y consacrer — sans cet envoi, ` +
    `mon dossier ne peut pas aboutir.\n\n` +
    `${e.prenom} ${e.nom.toUpperCase()}\n` +
    `${e.ncaa.telephone ? `${e.ncaa.telephone}\n` : ''}`
  );
}

export const objetPourLeLycee = (e: Eleve) =>
  `Demande d'envoi de mon dossier scolaire à la NCAA — ${e.prenom} ${e.nom.toUpperCase()}`;

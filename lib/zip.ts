/* Écriture d'une archive ZIP, sans dépendance.

   Volontairement en mode « stocké » : aucune compression. Les pièces d'une
   commande sont des PDF et des JPEG, déjà compressés — les recomprimer ferait
   gagner quelques pour cent pour un coût processeur réel sur une fonction
   serverless. Le format « stocké » est aussi le plus simple à produire sans
   erreur, et il s'ouvre partout, y compris avec l'utilitaire d'archive de
   macOS.

   Référence : APPNOTE.TXT de PKWARE, sections 4.3.7 (en-tête local),
   4.3.12 (répertoire central) et 4.3.16 (fin de répertoire). */

export type Piece = { nom: string; donnees: Buffer };

/* Table CRC-32 (polynôme 0xEDB88320), calculée une fois au chargement.
   Le ZIP exige cette empreinte pour chaque pièce : un lecteur qui ne la
   retrouve pas déclare l'archive corrompue. */
const TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf: Buffer) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/* Le ZIP date ses pièces au format MS-DOS : deux mots de 16 bits, avec des
   secondes stockées par pas de deux et une année comptée depuis 1980. */
function horodatageDos(d: Date) {
  const heure =
    (d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2);
  const date =
    ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  return { heure, date };
}

/** Nettoie un nom pour qu'il vive dans une archive : pas de chemin, pas de nul. */
function nomDansArchive(nom: string) {
  return (
    nom
      .split(/[\\/]/)
      .pop()!
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0000-\u001f\u007f]/g, '')
      .slice(0, 200) || 'document'
  );
}

/**
 * Construit l'archive en mémoire.
 *
 * Les commandes tiennent dans une vingtaine de fichiers de quelques centaines
 * de kilo-octets : tout charger est sans risque ici, et évite la mécanique
 * d'un flux pour un gain qui n'existe pas à cette taille.
 */
export function creerZip(pieces: Piece[], date = new Date()): Buffer {
  const { heure, date: jour } = horodatageDos(date);
  const locaux: Buffer[] = [];
  const central: Buffer[] = [];
  let position = 0;

  for (const p of pieces) {
    const nom = Buffer.from(nomDansArchive(p.nom), 'utf8');
    const somme = crc32(p.donnees);
    const taille = p.donnees.length;

    const entete = Buffer.alloc(30);
    entete.writeUInt32LE(0x04034b50, 0); // signature
    entete.writeUInt16LE(20, 4); // version minimale
    entete.writeUInt16LE(0x0800, 6); // drapeau : nom encodé en UTF-8
    entete.writeUInt16LE(0, 8); // méthode : stocké
    entete.writeUInt16LE(heure, 10);
    entete.writeUInt16LE(jour, 12);
    entete.writeUInt32LE(somme, 14);
    entete.writeUInt32LE(taille, 18); // taille compressée
    entete.writeUInt32LE(taille, 22); // taille réelle : identiques en stocké
    entete.writeUInt16LE(nom.length, 26);
    entete.writeUInt16LE(0, 28); // pas de champ additionnel

    locaux.push(entete, nom, p.donnees);

    const fiche = Buffer.alloc(46);
    fiche.writeUInt32LE(0x02014b50, 0);
    fiche.writeUInt16LE(20, 4); // version d'écriture
    fiche.writeUInt16LE(20, 6); // version minimale de lecture
    fiche.writeUInt16LE(0x0800, 8);
    fiche.writeUInt16LE(0, 10);
    fiche.writeUInt16LE(heure, 12);
    fiche.writeUInt16LE(jour, 14);
    fiche.writeUInt32LE(somme, 16);
    fiche.writeUInt32LE(taille, 20);
    fiche.writeUInt32LE(taille, 24);
    fiche.writeUInt16LE(nom.length, 28);
    fiche.writeUInt16LE(0, 30); // champ additionnel
    fiche.writeUInt16LE(0, 32); // commentaire
    fiche.writeUInt16LE(0, 34); // disque de départ
    fiche.writeUInt16LE(0, 36); // attributs internes
    fiche.writeUInt32LE(0, 38); // attributs externes
    fiche.writeUInt32LE(position, 42); // où trouver l'en-tête local

    central.push(fiche, nom);
    position += entete.length + nom.length + taille;
  }

  const repertoire = Buffer.concat(central);
  const fin = Buffer.alloc(22);
  fin.writeUInt32LE(0x06054b50, 0);
  fin.writeUInt16LE(0, 4); // numéro de disque
  fin.writeUInt16LE(0, 6); // disque du répertoire
  fin.writeUInt16LE(pieces.length, 8);
  fin.writeUInt16LE(pieces.length, 10);
  fin.writeUInt32LE(repertoire.length, 12);
  fin.writeUInt32LE(position, 16); // le répertoire commence après les pièces
  fin.writeUInt16LE(0, 20); // pas de commentaire

  return Buffer.concat([...locaux, repertoire, fin]);
}

/* Reconnaissance du type réel d'un fichier, par ses octets.

   Le navigateur envoie deux choses : le fichier, et une étiquette qui dit ce
   que c'est. Cette étiquette est du texte libre, choisi par celui qui envoie.
   Un exécutable renommé « bulletin.png » et annoncé « image/png » passait donc
   tous nos contrôles, se rangeait dans le stockage, et s'affichait dans
   l'administration comme une pièce ordinaire — jusqu'à ce qu'on le télécharge.

   La cible d'un fichier piégé n'est pas le serveur, qui ne l'exécute jamais :
   c'est la machine de celui qui ouvre la pièce.

   Le principe inverse est tout aussi important : **ne rien refuser à tort.**
   Un parent qui photographie un bulletin avec un iPhone envoie du HEIC, un
   scanner de bureau produit du TIFF. Les refuser coûterait des commandes, ce
   qui serait un dégât bien plus certain que celui qu'on prévient. La liste
   ci-dessous est donc large sur les formats d'image, et fermée sur tout le
   reste : ni archive, ni document bureautique, ni exécutable, ni script. */

export type TypeReel = { mime: string; libelle: string };

const debute = (o: Buffer, octets: number[], depart = 0) =>
  o.length >= depart + octets.length && octets.every((v, i) => o[depart + i] === v);

const marque = (o: Buffer, texte: string, depart: number) =>
  o.length >= depart + texte.length &&
  o.subarray(depart, depart + texte.length).toString('latin1') === texte;

/* Signatures refusées AVANT toute autre chose : archives, exécutables,
   documents bureautiques. Ce contrôle existe pour une raison précise, trouvée
   à l'essai — la tolérance sur le préambule PDF ci-dessous faisait accepter une
   archive ZIP contenant des PDF stockés sans compression, parce que la marque
   « %PDF- » y apparaît dès les premières dizaines d'octets. Sans cette liste,
   n'importe quel fichier portant ces cinq caractères au début passait. */
const INTERDITS: number[][] = [
  [0x50, 0x4b, 0x03, 0x04], // ZIP, et donc DOCX, XLSX, ODT, JAR
  [0x50, 0x4b, 0x05, 0x06],
  [0x50, 0x4b, 0x07, 0x08],
  [0x4d, 0x5a], // exécutable Windows
  [0x7f, 0x45, 0x4c, 0x46], // exécutable Linux
  [0xcf, 0xfa, 0xed, 0xfe], // exécutables macOS, quatre variantes plus la grasse
  [0xce, 0xfa, 0xed, 0xfe],
  [0xfe, 0xed, 0xfa, 0xce],
  [0xfe, 0xed, 0xfa, 0xcf],
  [0xca, 0xfe, 0xba, 0xbe],
  [0xd0, 0xcf, 0x11, 0xe0], // document Office ancien (.doc, .xls)
  [0x52, 0x61, 0x72, 0x21], // RAR
  [0x37, 0x7a, 0xbc, 0xaf], // 7z
  [0x1f, 0x8b], // gzip
  [0x23, 0x21], // #! : script
];

/* Un PDF conforme commence par « %PDF- » à la position zéro. Certains fichiers
   réels traînent quelques octets avant, et les lecteurs le tolèrent : on cherche
   donc dans le premier kilo-octet — mais seulement après avoir écarté les
   conteneurs ci-dessus, sans quoi la tolérance devient une porte d'entrée. */
const estPdf = (o: Buffer) =>
  marque(o, '%PDF-', 0) || o.subarray(0, 1024).includes(Buffer.from('%PDF-', 'latin1'));

/* Les formats de la famille ISO-BMFF — HEIC des iPhone, AVIF — portent
   « ftyp » en quatrième position, suivi d'une marque de sous-format. */
const FAMILLE_FTYP: Record<string, TypeReel> = {
  heic: { mime: 'image/heic', libelle: 'photo HEIC' },
  heix: { mime: 'image/heic', libelle: 'photo HEIC' },
  hevc: { mime: 'image/heic', libelle: 'photo HEIC' },
  heim: { mime: 'image/heic', libelle: 'photo HEIC' },
  mif1: { mime: 'image/heif', libelle: 'photo HEIF' },
  msf1: { mime: 'image/heif', libelle: 'photo HEIF' },
  avif: { mime: 'image/avif', libelle: 'photo AVIF' },
};

/**
 * Le type réel du fichier, ou null s'il n'est pas de ceux que nous acceptons.
 *
 * Ne lit que l'en-tête : le coût est indépendant de la taille du fichier.
 */
export function reconnaitre(octets: Buffer): TypeReel | null {
  if (octets.length < 12) return null;

  for (const signature of INTERDITS) {
    if (debute(octets, signature)) return null;
  }

  if (estPdf(octets)) return { mime: 'application/pdf', libelle: 'PDF' };

  // JPEG : FF D8 FF
  if (debute(octets, [0xff, 0xd8, 0xff])) return { mime: 'image/jpeg', libelle: 'photo JPEG' };

  // PNG : signature de huit octets, dont un retour chariot qui sert à détecter
  // les transferts ayant abîmé les fins de ligne.
  if (debute(octets, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    return { mime: 'image/png', libelle: 'image PNG' };

  if (marque(octets, 'ftyp', 4)) {
    const sous = octets.subarray(8, 12).toString('latin1').toLowerCase();
    if (FAMILLE_FTYP[sous]) return FAMILLE_FTYP[sous];
  }

  // WEBP : conteneur RIFF portant la marque WEBP en huitième position.
  if (marque(octets, 'RIFF', 0) && marque(octets, 'WEBP', 8))
    return { mime: 'image/webp', libelle: 'image WEBP' };

  // TIFF : les scanners de bureau en produisent encore. Deux ordres d'octets.
  if (debute(octets, [0x49, 0x49, 0x2a, 0x00]) || debute(octets, [0x4d, 0x4d, 0x00, 0x2a]))
    return { mime: 'image/tiff', libelle: 'scan TIFF' };

  if (marque(octets, 'GIF8', 0)) return { mime: 'image/gif', libelle: 'image GIF' };

  if (debute(octets, [0x42, 0x4d])) return { mime: 'image/bmp', libelle: 'image BMP' };

  return null;
}

/** Message adressé au client, à la place d'un refus sec. */
export const refusDeType = (nom: string) =>
  `« ${nom} » n'est pas un document que nous savons lire. Déposez un PDF ou une photo de vos pages (JPEG, PNG, HEIC). Si le fichier a été renommé, envoyez plutôt l'original.`;

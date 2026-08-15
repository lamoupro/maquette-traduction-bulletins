import { PDFDocument } from 'pdf-lib';

/* Comptage des pages d'un document.

   L'unité facturée est la page, pas le fichier : un bulletin de lycée en
   fait souvent deux, un livret scolaire annuel jusqu'à six. Facturer au
   fichier revenait à travailler gratuitement sur tout ce qui dépasse une
   page.

   Le comptage se fait ici, côté serveur, et le résultat est stocké dans le
   dossier. Le navigateur ne décide jamais du nombre de pages, donc jamais
   du prix. */

export const PAGE_ILLISIBLE = Symbol('page-illisible');

/** Une image — photo ou scan — vaut une page. */
const estImage = (type: string) => type.startsWith('image/');

/**
 * Nombre de pages d'un fichier. Renvoie null si le document est un PDF
 * qu'on ne sait pas lire : on préfère refuser le dépôt plutôt que de
 * facturer une page pour un document qui en compte vingt.
 */
export async function compterPages(donnees: Buffer, type: string): Promise<number | null> {
  if (estImage(type)) return 1;

  if (type === 'application/pdf') {
    try {
      // ignoreEncryption : beaucoup de PDF administratifs portent une
      // protection contre l'impression, sans empêcher la lecture.
      const doc = await PDFDocument.load(donnees, {
        ignoreEncryption: true,
        updateMetadata: false,
      });
      const n = doc.getPageCount();
      return n > 0 ? n : null;
    } catch {
      return null;
    }
  }

  return null;
}

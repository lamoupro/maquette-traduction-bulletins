import { PDFDocument } from 'pdf-lib';

/* Deux gestes sur les PDF, partagés par les routes du portail.

   Ils vivaient dans la route du dossier ; la consultation par année en a
   besoin aussi, et deux copies d'un découpage de pages finissent toujours par
   diverger. */

/**
 * Retire du fichier la page de certificat propre à la pièce.
 *
 * Elle est en queue ou en tête selon la façon dont l'envoi a été fait : une
 * traduction livrée seule est close par son certificat, un lot livré d'un bloc
 * s'ouvre par le sien. Les deux cas existent dans les dossiers réels.
 */
export async function sansPageCertificat(source: Buffer, ou: 'debut' | 'fin'): Promise<Buffer> {
  const doc = await PDFDocument.load(source, { ignoreEncryption: true });
  if (doc.getPageCount() > 1) doc.removePage(ou === 'debut' ? 0 : doc.getPageCount() - 1);
  return Buffer.from(await doc.save());
}

/** Met plusieurs PDF bout à bout, dans l'ordre donné. */
export async function fusionner(sources: Buffer[], titre?: string): Promise<Buffer> {
  if (sources.length === 1 && !titre) return sources[0];

  const out = await PDFDocument.create();
  for (const s of sources) {
    const src = await PDFDocument.load(s, { ignoreEncryption: true });
    const pages = await out.copyPages(src, src.getPageIndices());
    for (const pg of pages) out.addPage(pg);
  }
  if (titre) out.setTitle(titre);
  out.setProducer('protranslayte');
  return Buffer.from(await out.save());
}

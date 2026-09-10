import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

/* Documents d'exemple du portail de démonstration.

   Ils ne contiennent AUCUN contenu scolaire : une page par page annoncée, qui
   dit ce qu'elle représente et rien de plus. L'intérêt est de pouvoir cliquer
   et voir s'ouvrir quelque chose — vérifier que l'enchaînement tient — sans
   fabriquer de faux bulletins, qui n'apprendraient rien et finiraient par
   traîner quelque part.

   Chaque page porte la mention qu'elle est un exemple. Un document de
   démonstration qui ne se distingue pas d'un vrai est un piège : il se
   retrouve un jour joint à un dossier réel.

   pdf-lib est déjà dans le projet, pour le comptage des pages. Aucune
   dépendance nouvelle. */

export const A4: [number, number] = [595.28, 841.89];

export const ENCRE = rgb(0.063, 0.137, 0.235);
export const BLEU = rgb(0.075, 0.349, 0.722);
export const GRIS = rgb(0.42, 0.47, 0.55);
export const FILET = rgb(0.85, 0.88, 0.92);

/* Les polices standard n'encodent que le jeu WinAnsi : un caractère hors de ce
   jeu fait échouer l'écriture entière. On remplace donc ce qui n'y est pas
   plutôt que de laisser la génération casser sur un nom exotique. */
export const sur = (t: string) =>
  t
    .normalize('NFC')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[^\u0020-\u007e\u00a0-\u00ff]/g, '');

export type Apercu = {
  /** « Brazil », « France »… pour un original ; « English » pour une traduction. */
  langue: string;
  /** L'intitulé exigé par l'établissement. */
  intitule: string;
  candidat: string;
  reference: string;
  pages: number;
  traduction: boolean;
};

export async function apercuPdf(a: Apercu): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const normale = await doc.embedFont(StandardFonts.Helvetica);
  const grasse = await doc.embedFont(StandardFonts.HelveticaBold);
  const total = Math.max(1, Math.min(20, a.pages));

  doc.setTitle(sur(`${a.intitule} - ${a.traduction ? 'English translation' : a.langue}`));
  doc.setProducer('protranslayte');

  for (let i = 1; i <= total; i++) {
    const pg = doc.addPage(A4);
    const [L, H] = A4;

    const centre = (texte: string, y: number, taille: number, police = normale, couleur = ENCRE) => {
      const t = sur(texte);
      pg.drawText(t, {
        x: (L - police.widthOfTextAtSize(t, taille)) / 2,
        y,
        size: taille,
        font: police,
        color: couleur,
      });
    };

    // Bandeau de marque, comme sur les vrais livrables.
    pg.drawText('pro', { x: 42, y: H - 34, size: 13, font: grasse, color: ENCRE });
    pg.drawText('translayte', {
      x: 42 + grasse.widthOfTextAtSize('pro', 13),
      y: H - 34,
      size: 13,
      font: grasse,
      color: BLEU,
    });
    pg.drawLine({
      start: { x: 42, y: H - 46 },
      end: { x: L - 42, y: H - 46 },
      thickness: 0.7,
      color: FILET,
    });
    const ref = sur(`Ref. ${a.reference}`);
    pg.drawText(ref, {
      x: L - 42 - normale.widthOfTextAtSize(ref, 7),
      y: H - 34,
      size: 7,
      font: normale,
      color: GRIS,
    });

    // Le cœur de la page : ce qu'elle représente, en un coup d'œil.
    centre(a.traduction ? 'ENGLISH' : a.langue.toUpperCase(), H / 2 + 46, 30, grasse, BLEU);
    centre(a.traduction ? 'CERTIFIED TRANSLATION' : 'ORIGINAL DOCUMENT', H / 2 + 16, 15, grasse);
    centre(a.intitule, H / 2 - 16, 13);
    centre(a.candidat, H / 2 - 38, 11, normale, GRIS);
    centre(`Page ${i} of ${total}`, H / 2 - 70, 10, normale, GRIS);

    if (a.traduction) {
      centre('Certificate of translation accuracy attached', H / 2 - 96, 9, normale, GRIS);
    }

    // Mention d'exemple, en pied, pour qu'une page égarée reste identifiable.
    pg.drawLine({
      start: { x: 42, y: 62 },
      end: { x: L - 42, y: 62 },
      thickness: 0.7,
      color: FILET,
    });
    centre('SAMPLE DOCUMENT - DEMONSTRATION ONLY', 44, 8, grasse, GRIS);
    centre('This page is a placeholder. It is not a student record.', 32, 8, normale, GRIS);
  }

  return Buffer.from(await doc.save());
}

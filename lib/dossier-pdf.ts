import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { A4, BLEU, ENCRE, FILET, GRIS, sur } from './apercu-pdf';

/* Le dossier certifié : UN seul fichier, et rien d'autre.

   L'ordre suit celui des dossiers américains reçus par les universités, relevé
   sur un document de Foundation for International Services fourni comme
   référence :

     page 1      certificat, EN TÊTE, avec le sommaire de ce qu'il couvre
     puis        tous les originaux, dans l'ordre déclaré par l'établissement
     puis        toutes les traductions, dans le même ordre

   Deux conséquences à ne pas défaire :

   — le certificat étant en tête, la formule dit « the following », jamais
     « the foregoing ». Une première version plaçait le certificat en dernier
     avec la formule inverse : les deux vont ensemble, changer l'un oblige à
     changer l'autre.
   — le sommaire donne pour chaque pièce SES DEUX pagination, original et
     traduction. C'est ce qui remplace des signets de navigation, que la
     bibliothèque PDF ne sait pas écrire.

   Le pied de page est posé ICI, sur chaque page, y compris celles qui viennent
   d'ailleurs : la référence et la mention d'altération appartiennent au dossier
   relié, pas aux pièces prises isolément. */

const ROUGE = rgb(0.639, 0.125, 0.125);
const VERT = rgb(0.055, 0.478, 0.329);

/* Formulation reprise du document de référence : elle nomme explicitement
   l'écriture manuscrite et la rature, que « altération » seul laisse discuter.
   Martin doit encore arrêter la sienne — un seul endroit à changer. */
export const MENTION_INTEGRITE =
  'Any alteration to this document, including handwriting or crossed out text, renders it void.';

export type PieceReliee = {
  reference: string;
  intitule: string;
  /** Absents tant que la pièce n'est pas arrivée, ou pas encore traduite. */
  original?: Buffer;
  traduction?: Buffer;
};

export type Dossier = {
  etablissement: string;
  candidat: string;
  pays: string;
  detail: string;
  reference: string;
  pieces: PieceReliee[];
  certificat: { traducteur: string; adresse: string; contact: string };
  /** Mention d'exemple, tant que le portail sert des données fictives. */
  demonstration?: boolean;
};

export async function construireDossier(d: Dossier): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const normale = await doc.embedFont(StandardFonts.Helvetica);
  const grasse = await doc.embedFont(StandardFonts.HelveticaBold);
  const italique = await doc.embedFont(StandardFonts.HelveticaOblique);
  const [L, H] = A4;

  const marque = (pg: ReturnType<typeof doc.addPage>) => {
    pg.drawText('pro', { x: 42, y: H - 52, size: 15, font: grasse, color: ENCRE });
    pg.drawText('translayte', {
      x: 42 + grasse.widthOfTextAtSize('pro', 15),
      y: H - 52,
      size: 15,
      font: grasse,
      color: BLEU,
    });
    pg.drawLine({
      start: { x: 42, y: H - 64 },
      end: { x: L - 42, y: H - 64 },
      thickness: 0.8,
      color: FILET,
    });
  };

  /* On charge tout avant de composer la garde : le sommaire annonce des
     numéros de page, ils doivent être ceux du document produit. */
  const chargees: {
    p: PieceReliee;
    original: PDFDocument | null;
    traduction: PDFDocument | null;
    pages: number;
  }[] = [];
  for (const p of d.pieces) {
    const o = p.original ? await PDFDocument.load(p.original, { ignoreEncryption: true }) : null;
    const t = p.traduction
      ? await PDFDocument.load(p.traduction, { ignoreEncryption: true })
      : null;
    chargees.push({
      p,
      original: o,
      traduction: t,
      pages: (o?.getPageCount() ?? 0) + (t?.getPageCount() ?? 0),
    });
  }

  /* Pagination calculée avant toute composition : le sommaire annonce des
     numéros, ils doivent être ceux du document produit. La page 1 est le
     certificat ; les originaux suivent, puis les traductions. */
  let curseur = 2;
  const plan = chargees.map((c) => {
    const o = c.original?.getPageCount() ?? 0;
    const debut = o > 0 ? curseur : 0;
    curseur += o;
    return { ...c, pagesOriginal: o, debutOriginal: debut };
  });
  const planComplet = plan.map((c) => {
    const t = c.traduction?.getPageCount() ?? 0;
    const debut = t > 0 ? curseur : 0;
    curseur += t;
    return { ...c, pagesTraduction: t, debutTraduction: debut };
  });

  // ---------- page 1 : le certificat, et ce qu'il couvre ----------
  const garde = doc.addPage(A4);
  marque(garde);
  const txt = (
    x: number,
    y: number,
    t: string,
    taille = 9.5,
    police = normale,
    couleur = ENCRE,
  ) => garde.drawText(sur(t), { x, y, size: taille, font: police, color: couleur });

  const dest = sur(d.etablissement);
  garde.drawText(dest, {
    x: L - 42 - normale.widthOfTextAtSize(dest, 9),
    y: H - 50,
    size: 9,
    font: normale,
    color: GRIS,
  });

  const titre = 'CERTIFICATE OF TRANSLATION ACCURACY';
  garde.drawText(sur(titre), {
    x: (L - grasse.widthOfTextAtSize(titre, 13)) / 2,
    y: H - 104,
    size: 13,
    font: grasse,
    color: ENCRE,
  });

  const langue = d.pays === 'France' ? 'French' : `the language of the records listed below`;
  const formule = `I, ${d.certificat.traducteur}, certify that I am competent to translate from ${langue} into English, and that the following documentation has been completely and accurately translated. Each record appears below in its original language, followed by its English translation.`;
  let y = H - 142;
  let ligne = '';
  for (const mot of formule.split(' ')) {
    const essai = (ligne + ' ' + mot).trim();
    if (normale.widthOfTextAtSize(sur(essai), 9.6) > L - 100) {
      txt(50, y, ligne, 9.6);
      y -= 14;
      ligne = mot;
    } else ligne = essai;
  }
  if (ligne) txt(50, y, ligne, 9.6);
  y -= 30;

  txt(50, y, d.candidat, 12, grasse);
  y -= 15;
  txt(50, y, `${d.detail} · Ref. ${d.reference}`, 9, normale, GRIS);
  y -= 13;
  txt(50, y, `Issued ${new Date().toISOString().slice(0, 10)}`, 9, normale, GRIS);
  y -= 30;

  // ---------- sommaire : deux paginations par pièce ----------
  const COL_O = 372;
  const COL_T = 470;
  txt(50, y, 'DOCUMENTATION COVERED', 8, grasse, GRIS);
  const enTete = (x: number, t: string) => {
    const w = normale.widthOfTextAtSize(t, 7.4);
    garde.drawText(sur(t), { x: x + 76 - w, y, size: 7.4, font: normale, color: GRIS });
  };
  enTete(COL_O, 'ORIGINAL');
  enTete(COL_T, 'ENGLISH');
  y -= 7;
  garde.drawLine({ start: { x: 50, y }, end: { x: L - 50, y }, thickness: 0.6, color: FILET });
  y -= 17;

  const pagination = (n: number, debut: number) =>
    n === 0 ? '—' : n === 1 ? `${debut}` : `${debut}–${debut + n - 1}`;

  /* Le sommaire ne liste QUE ce que le document contient.

     Une version antérieure y faisait figurer les pièces non reçues, et un
     encadré « This file is not complete ». C'était une faute : un certificat
     atteste l'exactitude d'une traduction, il ne dit rien de l'état du dossier
     de candidature. Y porter ce qui manque revenait à formuler, dans un
     document signé et destiné à circuler, un jugement sur le dossier de
     l'étudiant — que nous n'avons aucune qualité pour porter.

     L'avertissement existe, mais à l'écran, avant le téléchargement. Il n'entre
     jamais dans le livrable. */
  for (const c of planComplet.filter((x) => x.pagesOriginal > 0)) {
    txt(50, y, c.p.intitule, 9.6);
    for (const [x, n, debut] of [
      [COL_O, c.pagesOriginal, c.debutOriginal],
      [COL_T, c.pagesTraduction, c.debutTraduction],
    ] as const) {
      const t = pagination(n, debut);
      const w = normale.widthOfTextAtSize(t, 9);
      garde.drawText(sur(t), { x: x + 76 - w, y, size: 9, font: normale, color: GRIS });
    }
    y -= 17;
  }

  y -= 14;

  // ---------- signature ----------
  y = Math.min(y, 190);
  garde.drawLine({ start: { x: 50, y: y + 12 }, end: { x: 250, y: y + 12 }, thickness: 0.7, color: GRIS });
  txt(50, y, d.certificat.traducteur, 10.5, grasse);
  y -= 13;
  txt(50, y, 'Translator - protranslayte', 8.4, normale, GRIS);
  y -= 11;
  txt(50, y, d.certificat.adresse, 8.4, normale, GRIS);
  y -= 11;
  txt(50, y, d.certificat.contact, 8.4, normale, GRIS);

  // ---------- les originaux, puis les traductions ----------
  for (const source of [
    planComplet.map((c) => c.original),
    planComplet.map((c) => c.traduction),
  ]) {
    for (const src of source) {
      if (!src) continue;
      const pages = await doc.copyPages(src, src.getPageIndices());
      for (const pg of pages) doc.addPage(pg);
    }
  }

  /* ---------- pied de page, sur TOUTES les pages ----------
     Posé en dernier, une fois le document complet : c'est la seule façon
     d'avoir une pagination juste et de marquer aussi les pages venues
     d'ailleurs. Une page détachée du dossier reste ainsi rattachable, et dit
     elle-même qu'elle ne vaut rien seule. */
  const total = doc.getPageCount();
  doc.getPages().forEach((pg, i) => {
    const gauche = `${d.reference} · ${d.candidat}`;
    const droite = `Page ${i + 1} of ${total}`;
    pg.drawText(sur(gauche), { x: 42, y: 22, size: 6.6, font: normale, color: GRIS });
    pg.drawText(sur(MENTION_INTEGRITE), {
      x: (L - italique.widthOfTextAtSize(sur(MENTION_INTEGRITE), 6.6)) / 2,
      y: 22,
      size: 6.6,
      font: italique,
      color: GRIS,
    });
    pg.drawText(sur(droite), {
      x: L - 42 - normale.widthOfTextAtSize(droite, 6.6),
      y: 22,
      size: 6.6,
      font: normale,
      color: GRIS,
    });
    /* La mention d'exemple ne va que sur les pages que NOUS composons : les
       pièces en portent déjà une, et l'empiler ferait un pied illisible. */
    if (d.demonstration && (i === 0 || i === total - 1)) {
      const s = 'SAMPLE FILE - DEMONSTRATION ONLY. Not a student record.';
      pg.drawText(sur(s), {
        x: (L - grasse.widthOfTextAtSize(sur(s), 6.6)) / 2,
        y: 11,
        size: 6.6,
        font: grasse,
        color: GRIS,
      });
    }
  });

  doc.setTitle(sur(`${d.candidat} - certified academic file`));
  doc.setProducer('protranslayte');
  return Buffer.from(await doc.save());
}

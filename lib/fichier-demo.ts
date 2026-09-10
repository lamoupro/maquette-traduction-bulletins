import { readFile } from 'node:fs/promises';
import path from 'node:path';

/* Lecture des pièces réelles de la démonstration.

   ELLES NE SONT PAS DANS public/, et c'est le point entier de ce fichier.

   Tout ce qui vit sous public/ est servi en statique, sans passer par la
   moindre garde : le logo d'un partenaire peut s'y trouver, les bulletins d'un
   élève réel, jamais. Les y mettre reviendrait à publier le dossier scolaire
   de quelqu'un à une adresse devinable.

   Ils vivent donc dans donnees-demo/, hors du dépôt et hors du statique, et
   ne sortent que par une route qui vérifie la session. */

const RACINE = path.join(process.cwd(), 'donnees-demo');

/**
 * Le contenu d'une pièce de démonstration.
 *
 * Le chemin vient de nos propres données, jamais d'une requête — mais on le
 * vérifie quand même. Une donnée de confiance aujourd'hui devient un champ
 * modifiable le jour où ces pièces viendront d'une base, et une remontée
 * `../../` lirait alors n'importe quel fichier du serveur.
 */
export async function lireFichierDemo(relatif: string): Promise<Buffer> {
  const complet = path.resolve(RACINE, relatif);
  if (complet !== path.normalize(complet) || !complet.startsWith(RACINE + path.sep)) {
    throw new Error(`Chemin de démonstration hors périmètre : ${relatif}`);
  }
  return readFile(complet);
}

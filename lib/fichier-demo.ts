import { get } from '@vercel/blob';

/* Lecture des pièces réelles de la démonstration.

   ELLES NE SONT PAS DANS public/, et c'est le point entier de ce fichier.

   Tout ce qui vit sous public/ est servi en statique, sans passer par la
   moindre garde : le logo d'un partenaire peut s'y trouver, les bulletins d'un
   élève réel, jamais. Les y mettre reviendrait à publier le dossier scolaire
   de quelqu'un à une adresse devinable.

   Elles vivent donc dans le store Blob PRIVÉ « demo-portail » — hors du
   dépôt Git, hors du statique, introuvables sans le jeton du serveur — et ne
   sortent que par une route qui vérifie la session. Un disque local aurait
   fait l'affaire en développement, mais Vercel n'en garde aucun entre les
   déploiements : voir scripts/televerser-blob.ts pour l'envoi initial. */

/**
 * Le contenu d'une pièce de démonstration, à son chemin dans le store — par
 * exemple `folikoe/01-original.pdf` ou `logos/trackhouse-monogramme.png`.
 *
 * Le chemin vient de nos propres données, jamais d'une requête : voir les
 * appelants dans lib/portail-demo.ts.
 */
export async function lireFichierDemo(chemin: string): Promise<Buffer> {
  const resultat = await get(chemin, { access: 'private' });
  if (!resultat || !resultat.stream) {
    throw new Error(`Fichier de démonstration introuvable : ${chemin}`);
  }
  return Buffer.from(await new Response(resultat.stream).arrayBuffer());
}

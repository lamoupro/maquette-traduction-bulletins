import { CANDIDATS, type Candidat, estClePartenaire, partenaire } from '@/lib/portail-demo';

/* D'OÙ VIENNENT LES SPORTIFS DU PORTAIL RÉEL — et la seule couture à changer
   le jour où ils viendront de la base.

   Aujourd'hui ils viennent de lib/portail-demo.ts, et ce n'est pas un
   raccourci honteux : c'est exactement ce que le client a demandé à voir.
   Le dossier de Prince Folikoe y est RÉEL — livré, payé, montré avec son
   accord — et les autres sont des exemples, signalés comme tels à l'écran
   (badge « demo ») pour que Trackhouse voie à quoi ressemble un dossier
   complet avant d'en avoir un à eux, et puisse les retirer ensuite.

   Ce que ce fichier garantit en revanche, et qui n'a rien de provisoire :
   une organisation ne voit QUE ses propres sportifs. `partenaire()` retombe
   sur Trackhouse quand on lui donne une clé inconnue — utile pour une
   démonstration, catastrophique ici, où ça montrerait le vivier de
   Trackhouse au premier autre client qui se connecte. D'où le passage
   obligé par `estClePartenaire`, et le tableau vide sinon. */

export function sportifsDe(orgSlug: string): Candidat[] {
  if (!estClePartenaire(orgSlug)) return [];
  /* SEULEMENT LES DOSSIERS RÉELS. Les dossiers d'exemple restent dans les
     données — la démonstration de démarchage s'en sert toujours, sous
     /portal — mais ils n'ont plus rien à faire dans le portail d'un vrai
     client : celui-ci ne doit contenir que ses propres athlètes. */
  return CANDIDATS.filter((c) => c.partenaire === orgSlug && c.reel);
}

export function sportifDe(orgSlug: string, id: string): Candidat | undefined {
  return sportifsDe(orgSlug).find((c) => c.id === id);
}

/* Les intitulés que cette organisation attend d'un dossier, et le vocabulaire
   qu'elle emploie — « athlete » pour une agence, « applicant » pour une
   université. Repris du même endroit, pour la même raison. */
export function vocabulaireDe(orgSlug: string) {
  if (!estClePartenaire(orgSlug)) return null;
  return partenaire(orgSlug);
}

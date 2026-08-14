import PagePaiement from '@/components/PagePaiement';

export const metadata = {
  title: 'Paiement — Protranslayte',
  robots: { index: false, follow: false },
};

/* Page de paiement isolée.

   Volontairement dépouillée : ni menu, ni avis, ni carrousel, ni pied de
   page marchand. Au moment de sortir sa carte, le client doit vérifier un
   montant, pas être sollicité. Tout ce qui bouge à côté du champ de carte
   fait douter.

   C'est aussi une vraie adresse, et non un état caché de la page d'accueil :
   le bouton « retour » du navigateur ramène donc au formulaire, au lieu de
   faire quitter le site. */

export default function Paiement() {
  return <PagePaiement />;
}

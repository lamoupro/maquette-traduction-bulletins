import Connexion from './Connexion';
import { ETABLISSEMENT } from '@/lib/portail-demo';

export const metadata = {
  title: 'Sign in — International Document Portal',
  robots: { index: false, follow: false },
};

/* Entrée du portail.

   Pas de mot de passe : un lien envoyé à une adresse du domaine de
   l'établissement prouve le contrôle d'une boîte institutionnelle, elle-même
   déjà protégée par la double authentification de l'université. On emprunte
   leur sécurité au lieu d'en fabriquer une moins bonne — et il n'y a rien à
   stocker, donc rien à perdre.

   L'autre raison est d'usage, et elle pèse autant : un entraîneur qui doit
   installer une application d'authentification pour regarder deux recrues ne
   revient pas. */

export default function Entree() {
  return <Connexion etablissement={ETABLISSEMENT.nom} domaine={ETABLISSEMENT.domaine} />;
}

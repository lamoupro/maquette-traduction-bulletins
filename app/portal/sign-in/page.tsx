import Connexion from './Connexion';
import { partenaireActif } from '@/lib/partenaire-actif';

export const metadata = {
  title: 'Sign in — International Document Portal',
  robots: { index: false, follow: false },
};

/* Entrée du portail.

   Pas de mot de passe : un lien envoyé à une adresse du domaine du partenaire
   prouve le contrôle d'une boîte professionnelle, elle-même déjà protégée par
   la double authentification de l'organisation. On emprunte leur sécurité au
   lieu d'en fabriquer une moins bonne — et il n'y a rien à stocker, donc rien
   à perdre.

   L'autre raison est d'usage, et elle pèse autant : un entraîneur qui doit
   installer une application d'authentification pour regarder deux recrues ne
   revient pas. */

export default async function Entree() {
  const pa = await partenaireActif();
  return (
    <Connexion
      organisation={pa.nom}
      domaine={pa.domaine}
      responsable={pa.responsable}
      logo={pa.logo}
      logoLargeur={pa.logoLargeur}
      logoHauteur={pa.logoHauteur}
    />
  );
}

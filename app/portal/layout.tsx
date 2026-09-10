import { peutVoirLaDemo } from '@/lib/auth';
import { cookies } from 'next/headers';
import { Suspense } from 'react';
import { COOKIE_REJEU } from '@/lib/portail-demo';
import { partenaireActif } from '@/lib/partenaire-actif';
import BasculeOrg from './BasculeOrg';
import BasculeVue from './BasculeVue';
import Habillage from './Habillage';
import Identite from './Identite';
import './portal.css';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'International Document Portal',
  robots: { index: false, follow: false },
};

/* Portail partenaire — démonstration.

   Il n'a PAS encore ses propres comptes : l'accès passe par la session
   d'administration, le temps que la base de données et l'authentification à
   deux facteurs existent. C'est délibéré et provisoire — mais ça veut dire
   qu'aucun lien ne doit être envoyé à un partenaire avant que ce soit fait,
   sinon la seule chose qui protège ces écrans est un mot de passe partagé.

   Le bandeau de démonstration reste visible tant que le portail ne sert pas de
   vrais dossiers à leurs vrais destinataires. Il porte deux sélecteurs qui
   n'existent que pour la présentation : le partenaire, et le rôle. */

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  /* Le gabarit ne redirige plus : il habille, ou il n'habille pas.

     Il portait la garde, et redirigeait vers /portal/sign-in — page qui vit
     sous ce même gabarit. Elle se redirigeait donc vers elle-même, en boucle,
     et personne sans clé ne pouvait voir l'écran d'entrée. C'est le piège
     classique d'une garde posée sur un gabarit qui couvre sa propre porte.

     Chaque page protégée porte désormais sa propre garde. Ici on décide
     seulement s'il y a un en-tête à afficher : la page d'entrée n'en a pas
     besoin, elle se suffit à elle-même. */
  const habille = await peutVoirLaDemo();
  const pa = await partenaireActif();

  /* La palette du partenaire est posée par le SERVEUR, dès le premier octet.
     Seule la bascule `est-partenaire` reste au navigateur.

     Une version antérieure laissait Habillage poser les deux classes. La page
     d'entrée, qui n'affiche pas Habillage, restait donc en bleu et affichait
     « Trackhouse » dans NOS couleurs — le premier écran d'une démonstration,
     et le seul qui n'était pas à leur marque. */
  if (!habille) {
    /* L'écran d'entrée bascule LUI AUSSI, et c'est même là qu'il faut le faire :
       c'est le premier écran d'une démonstration, celui qu'on regarde avant
       d'avoir rien lu. Une version antérieure l'ouvrait directement aux
       couleurs du partenaire — correct, mais l'effet était perdu.

       Pas de bouton de rejeu ici : cet écran finira dans une vidéo, et une
       commande de service au milieu de l'image la trahirait. On recharge. */
    return (
      <div className={`pt org-${pa.cle}`}>
        {children}
        <Habillage bouton={false} />
      </div>
    );
  }

  return (
    <div className={`pt org-${pa.cle}`}>
      <div className="pt-demo">
        <div className="pt-wrap">
          <strong>Demonstration</strong>
          <BasculeOrg actif={pa.cle} />
          <Suspense fallback={null}>
            <BasculeVue proprietaire={pa.vueProprietaire} />
          </Suspense>
          <Habillage />
        </div>
      </div>

      <header className="pt-tete">
        <div className="pt-wrap">
          {/* Le cartouche de marque : notre nom, puis celui du partenaire.

              Notre marque ne s'efface pas — elle prend leurs couleurs. Ce que
              la bascule raconte n'est pas « nous disparaissons chez vous »
              mais « votre portail, tenu par nous » : les deux noms restent
              côte à côte, dans la même teinte. */}
          <span className="pt-cartouche">
            <span className="pt-notre-marque">
              pro<span className="bleu">translayte</span>
            </span>
            <span className="pt-croix" aria-hidden="true">
              ×
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="pt-logo-ecole"
              src={pa.logo}
              alt={pa.nom}
              width={pa.logoLargeur}
              height={pa.logoHauteur}
            />
          </span>

          <Suspense fallback={null}>
            <Identite
              responsable={pa.responsable}
              coach={`${pa.entraineur.nom} · ${pa.entraineur.titre}`}
            />
          </Suspense>
          <div className="pt-marque">
            Powered by <b>protranslayte</b>
            <br />
            Certified translation from any language
          </div>
        </div>
      </header>

      {children}

      <footer className="pt-pied">
        <div className="pt-wrap">
          <span>
            Documents are held only until {pa.nom} exports and removes them.
          </span>
          <a href="/admin" style={{ marginLeft: 'auto' }}>
            ← Back to administration
          </a>
        </div>
      </footer>
    </div>
  );
}

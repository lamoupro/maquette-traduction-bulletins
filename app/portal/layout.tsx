import { peutVoirLaDemo } from '@/lib/auth';
import { Suspense } from 'react';
import { ETABLISSEMENT } from '@/lib/portail-demo';
import BasculeVue from './BasculeVue';
import Habillage from './Habillage';
import Identite from './Identite';
import './portal.css';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'International Document Portal',
  robots: { index: false, follow: false },
};

/* Portail institutionnel — démonstration.

   Il n'a PAS encore ses propres comptes : l'accès passe par la session
   d'administration, le temps que la base de données et l'authentification à
   deux facteurs existent. C'est délibéré et provisoire — mais ça veut dire
   qu'aucun lien ne doit être envoyé à une université avant que ce soit fait,
   sinon la seule chose qui protège ces écrans est un mot de passe partagé.

   Le bandeau de démonstration reste visible tant que les données sont
   fictives. Le retirer sera le signal que le portail sert de vrais dossiers. */

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

  if (!habille) return <div className="pt">{children}</div>;

  return (
    <div className="pt">
      <div className="pt-demo">
        <div className="pt-wrap">
          <strong>Demonstration</strong>
          <span>Sample applicants — no real student data on this page.</span>
          <Suspense fallback={null}>
            <BasculeVue />
          </Suspense>
          <Habillage />
        </div>
      </div>

      <header className="pt-tete">
        <div className="pt-wrap">
          {/* Le cartouche de marque : notre nom, puis celui de l'établissement.

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
              src={ETABLISSEMENT.logo}
              alt={ETABLISSEMENT.nom}
              width={194}
              height={44}
            />
          </span>

          <Suspense fallback={null}>
            <Identite />
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
          <span>Documents are held only until the institution exports and removes them.</span>
          <a href="/admin" style={{ marginLeft: 'auto' }}>
            ← Back to administration
          </a>
        </div>
      </footer>
    </div>
  );
}

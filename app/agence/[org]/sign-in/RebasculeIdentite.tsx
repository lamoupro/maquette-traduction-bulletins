'use client';

import { useEffect } from 'react';
import { REPOS_MS, cleVu } from './script-anti-flash';

/* La bascule d'identité de l'écran de connexion réel — protranslayte, puis
   les couleurs de l'organisation.

   Contrairement à la démonstration (app/portal/Habillage.tsx), qui rejoue
   l'animation à CHAQUE chargement pour un visiteur qui la regarde une fois,
   ici c'est un employé qui revient tous les jours : la rejouer à chaque
   visite deviendrait un tic agaçant plutôt qu'un argument montré. On ne la
   joue donc qu'une fois par « venue » — mémorisée dans localStorage, propre
   à cette organisation — puis on la retient éteinte tant que la personne
   revient dans l'heure. Passé ce délai sans repasser par ici, on considère
   qu'elle a quitté et qu'on peut la remontrer à son retour.

   Pas de garde côté « après connexion réussie » : une fois connecté, le
   parcours quitte cette page pour /entree puis le tableau de bord, qui ne
   repasse jamais par ici tant que la session tient (30 jours). Le seul
   chemin de retour vers cet écran est une déconnexion ou une session
   expirée — un vrai retour, pour lequel rejouer la bascule est correct. */

const ATTENTE = 400;

export default function RebasculeIdentite({
  orgSlug,
  couleurEncre,
  couleurSignature,
  couleurVif,
  couleurVifSombre,
  couleurBoutonTexte,
}: {
  orgSlug: string;
  couleurEncre: string;
  couleurSignature: string;
  couleurVif: string;
  couleurVifSombre: string;
  couleurBoutonTexte: string;
}) {
  useEffect(() => {
    const k = cleVu(orgSlug);
    const vu = localStorage.getItem(k);
    const recent = vu ? Date.now() - Number(vu) < REPOS_MS : false;

    // Chaque venue remet le compteur à zéro — « inactif depuis une heure »
    // se mesure depuis la dernière fois qu'on a été vu ici, pas depuis la
    // toute première fois.
    localStorage.setItem(k, String(Date.now()));

    if (recent) return; // déjà à ses couleurs, posées par le serveur — rien à faire

    const t = setTimeout(() => {
      const el = document.querySelector('.pt') as HTMLElement | null;
      if (!el) return;
      el.style.setProperty('--pt-p-encre', couleurEncre);
      el.style.setProperty('--pt-p-signature', couleurSignature);
      el.style.setProperty('--pt-vif', couleurVif);
      el.style.setProperty('--pt-vif-sombre', couleurVifSombre);
      el.style.setProperty('--pt-bouton-texte', couleurBoutonTexte);
      el.style.setProperty('--pt-accent', couleurVifSombre);
      // Le logo apparaît EN MÊME TEMPS que les couleurs, pas avant : voir
      // agence.css, où script-anti-flash.ts avait retiré cette classe.
      el.classList.add('est-revele');
    }, ATTENTE);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgSlug]);

  return null;
}

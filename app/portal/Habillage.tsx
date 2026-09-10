'use client';

import { useEffect, useState } from 'react';

/* La bascule d'identité, au chargement.

   Le portail s'ouvre dans nos couleurs, marque en toutes lettres, puis passe
   à celles du partenaire, son logo apparaissant à côté de la nôtre. C'est
   l'argument du produit montré au lieu d'être expliqué — et c'est le plan
   d'ouverture d'une vidéo de démarchage.

   Quatre dixièmes de seconde avant la bascule. Le point de départ doit être
   aperçu, pas examiné : on veut que le visiteur voie quelque chose se produire
   avant d'avoir eu le temps de lire la page, pas qu'il attende que ça vienne.

   Le bouton « Replay » existe pour l'enregistrement d'écran : recommencer une
   prise sans recharger la page ni reperdre sa position de défilement. Il vit
   dans le bandeau de démonstration, et l'écran d'entrée n'en a pas — la
   bascule s'y joue donc sans commande visible, et se rejoue en rechargeant.
   C'est voulu : cet écran-là finira dans une vidéo, et un bouton de service au
   milieu de l'image la trahirait. */

const ATTENTE = 400;

export default function Habillage({ bouton = true }: { bouton?: boolean }) {
  const [bascule, setBascule] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setBascule(true), ATTENTE);
    return () => clearTimeout(t);
  }, []);

  /* Les classes vivent sur le conteneur du portail, pas ici : toute la feuille
     de style en dépend, et un état porté par un composant enfant ne pourrait
     pas repeindre l'en-tête.

     Deux classes distinctes, et pas une seule : `org-…` dit DE QUI sont les
     couleurs, `est-partenaire` dit si on les porte déjà. La première est
     posée par le serveur ; on ne touche donc ici qu'à la seconde. */
  useEffect(() => {
    document.querySelector('.pt')?.classList.toggle('est-partenaire', bascule);
  }, [bascule]);

  if (!bouton) return null;

  return (
    <button
      type="button"
      className="pt-rejouer"
      onClick={() => {
        setBascule(false);
        setTimeout(() => setBascule(true), ATTENTE);
      }}
      title="Rejouer la bascule vers l'identité du partenaire"
    >
      ↻ Replay
    </button>
  );
}

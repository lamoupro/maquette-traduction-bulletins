'use client';

import { useEffect, useState } from 'react';

/* La bascule d'identité, au chargement.

   Le portail s'ouvre dans nos couleurs, marque en toutes lettres, puis passe
   à celles de l'établissement, son logo apparaissant à la place de la nôtre.
   C'est l'argument du produit montré au lieu d'être expliqué — et c'est le
   plan d'ouverture d'une vidéo de démarchage.

   Quatre dixièmes de seconde avant la bascule. Le point de départ doit être
   aperçu, pas examiné : on veut que le visiteur voie quelque chose se produire
   avant d'avoir eu le temps de lire la page, pas qu'il attende que ça vienne.

   Le bouton « Replay » existe pour l'enregistrement d'écran : recommencer une
   prise sans recharger la page ni reperdre sa position de défilement. */

const ATTENTE = 400;

export default function Habillage() {
  const [bascule, setBascule] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setBascule(true), ATTENTE);
    return () => clearTimeout(t);
  }, []);

  /* La classe vit sur le conteneur du portail, pas ici : toute la feuille de
     style en dépend, et un état porté par un composant enfant ne pourrait pas
     repeindre l'en-tête. */
  useEffect(() => {
    const racine = document.querySelector('.pt');
    if (!racine) return;
    racine.classList.toggle('est-etablissement', bascule);
  }, [bascule]);

  return (
    <button
      type="button"
      className="pt-rejouer"
      onClick={() => {
        setBascule(false);
        setTimeout(() => setBascule(true), ATTENTE);
      }}
      title="Rejouer la bascule vers l'identité de l'établissement"
    >
      ↻ Replay
    </button>
  );
}

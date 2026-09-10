'use client';

import { COOKIE_ORG, PARTENAIRES, type ClePartenaire } from '@/lib/portail-demo';

/* Changement de partenaire, pendant une démonstration.

   Ce n'est pas un réglage du produit : c'est de quoi passer d'un rendez-vous à
   l'autre sans rebâtir la maquette. Un client ne voit jamais ce sélecteur — il
   vit dans le bandeau de démonstration, qui disparaîtra avec lui.

   Le cookie est posé ici, côté navigateur, et la page rechargée : le rendu du
   portail est fait par le serveur, il faut donc qu'il relise. Un an, parce
   qu'une préférence d'affichage n'a pas de raison d'expirer, et limité au
   chemin du portail — il n'a rien à faire dans le reste du site. */

const UN_AN = 365 * 24 * 60 * 60;

export default function BasculeOrg({ actif }: { actif: ClePartenaire }) {
  return (
    <div className="pt-demo-orgs">
      {Object.values(PARTENAIRES).map((p) => (
        <button
          key={p.cle}
          type="button"
          aria-current={p.cle === actif}
          onClick={() => {
            if (p.cle === actif) return;
            document.cookie = `${COOKIE_ORG}=${p.cle}; path=/portal; max-age=${UN_AN}; samesite=lax`;
            window.location.reload();
          }}
        >
          {p.nom}
        </button>
      ))}
    </div>
  );
}

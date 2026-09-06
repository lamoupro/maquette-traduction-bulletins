'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

/* Bascule entre le regard de l'établissement et celui de l'entraîneur.

   Ce n'est pas un réglage du produit : c'est un outil de démonstration, pour
   montrer les deux rôles dans un même enregistrement d'écran. Dans le produit
   réel, le rôle viendra du compte, jamais d'un paramètre d'adresse — un
   entraîneur ne doit pas pouvoir devenir registrar en modifiant une URL. */

const VUES = [
  { cle: '', libelle: 'Institution' },
  { cle: 'coach', libelle: 'Coach' },
];

export default function BasculeVue() {
  const chemin = usePathname();
  const params = useSearchParams();
  const active = params.get('view') ?? '';

  // Avant la connexion, il n'y a pas de rôle à basculer.
  if (chemin.startsWith('/portal/sign-in')) return null;

  return (
    <div className="pt-demo-vues">
      {VUES.map((v) => (
        <Link
          key={v.cle || 'institution'}
          href={v.cle ? `${chemin}?view=${v.cle}` : chemin}
          aria-current={active === v.cle}
        >
          {v.libelle}
        </Link>
      ))}
    </div>
  );
}

'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

/* Bascule entre le regard du partenaire et celui de l'entraîneur.

   Ce n'est pas un réglage du produit : c'est un outil de démonstration, pour
   montrer les deux rôles dans un même enregistrement d'écran. Dans le produit
   réel, le rôle viendra du compte, jamais d'un paramètre d'adresse — un
   entraîneur ne doit pas pouvoir devenir registrar en modifiant une URL.

   Le libellé du premier regard change avec le partenaire : une université est
   une « Institution », une agence est une « Agency ». Le second est un
   entraîneur dans les deux cas — c'est bien le même métier qui regarde. */

export default function BasculeVue({ proprietaire }: { proprietaire: string }) {
  const chemin = usePathname();
  const params = useSearchParams();
  const active = params.get('view') ?? '';

  // Avant la connexion, il n'y a pas de rôle à basculer.
  if (chemin.startsWith('/portal/sign-in')) return null;

  const vues = [
    { cle: '', libelle: proprietaire },
    { cle: 'coach', libelle: 'Coach' },
  ];

  return (
    <div className="pt-demo-vues">
      {vues.map((v) => (
        <Link
          key={v.cle || 'proprietaire'}
          href={v.cle ? `${chemin}?view=${v.cle}` : chemin}
          aria-current={active === v.cle}
        >
          {v.libelle}
        </Link>
      ))}
    </div>
  );
}

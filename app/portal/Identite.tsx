'use client';

import { usePathname, useSearchParams } from 'next/navigation';

/* La ligne d'identité, à côté du cartouche de marque : qui regarde, et à quel
   titre.

   Elle affichait le rôle du partenaire quelle que soit la vue, y compris à un
   entraîneur — ce qui était simplement faux. Un portail doit dire à qui il
   parle, sans quoi personne ne sait de quel poste il regarde.

   Comme la bascule de vue, elle lit l'adresse : c'est un artifice de
   démonstration. Dans le produit, ces valeurs viennent du compte. */

export default function Identite({
  responsable,
  coach,
}: {
  responsable: string;
  coach: string;
}) {
  const chemin = usePathname();
  const vueCoach = useSearchParams().get('view') === 'coach';

  // Personne n'est encore identifié sur l'écran d'entrée.
  if (chemin.startsWith('/portal/sign-in')) return null;

  return (
    <div className="pt-ecole">
      <span>{vueCoach ? coach : `${responsable} · International Document Portal`}</span>
    </div>
  );
}

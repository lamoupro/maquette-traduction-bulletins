'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { ENTRAINEUR, ETABLISSEMENT } from '@/lib/portail-demo';

/* La ligne d'identité, sous le cartouche de marque : qui regarde, et à quel
   titre.

   Elle affichait « International Admissions » quelle que soit la vue, y compris
   à un entraîneur — ce qui était simplement faux. Un portail institutionnel doit
   dire à qui il parle, sans quoi personne ne sait de quel poste il regarde.

   Comme la bascule de vue, elle lit l'adresse : c'est un artifice de
   démonstration. Dans le produit, ces valeurs viennent du compte. */

export default function Identite() {
  const chemin = usePathname();
  const coach = useSearchParams().get('view') === 'coach';

  // Personne n'est encore identifié sur l'écran d'entrée.
  if (chemin.startsWith('/portal/sign-in')) return null;

  return (
    <div className="pt-ecole">
      <span>
        {coach
          ? `${ENTRAINEUR.nom} · ${ENTRAINEUR.sport}`
          : `${ETABLISSEMENT.responsable} · International Document Portal`}
      </span>
    </div>
  );
}

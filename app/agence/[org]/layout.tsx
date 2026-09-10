import { notFound } from 'next/navigation';
import { organisation } from '@/lib/agence/organisations';
import '../agence.css';

export const dynamic = 'force-dynamic';

/* Le portail agence RÉEL. Sous /agence/[org]/, complètement séparé de
   /portal — voir la note en tête de lib/agence/auth.ts.

   L'organisation vient de la base, jamais d'un cookie : c'est ce qui change
   par rapport à la démonstration, où le partenaire affiché est une
   préférence de présentation. Ici c'est une ligne réelle, et une adresse qui
   ne correspond à aucune organisation reçoit un 404 — pas un portail vide. */

export default async function GabaritAgence({
  params,
  children,
}: {
  params: Promise<{ org: string }>;
  children: React.ReactNode;
}) {
  const { org: slug } = await params;
  const org = await organisation({ slug });
  if (!org) notFound();

  /* Les jetons de couleur de CETTE organisation, posés en variables CSS sur
     le conteneur racine. Le reste de agence.css les lit déjà — rien d'autre
     à faire pour qu'un nouveau client s'affiche à ses couleurs le jour où il
     est ajouté en base, sans toucher une ligne de CSS. */
  const style = {
    '--pt-p-encre': org.couleurEncre,
    '--pt-p-signature': org.couleurSignature,
    '--pt-vif': org.couleurVif,
    '--pt-vif-sombre': org.couleurVifSombre,
    '--pt-bouton-texte': org.couleurBoutonTexte,
    '--pt-accent': org.couleurVifSombre,
  } as React.CSSProperties;

  return (
    <div className="pt" style={style}>
      {children}
    </div>
  );
}

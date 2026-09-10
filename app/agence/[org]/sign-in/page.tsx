import { notFound } from 'next/navigation';
import { organisation } from '@/lib/agence/organisations';
import { connexionEmail, connexionGoogle, connexionMicrosoft } from '../actions';
import Connexion from './Connexion';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ org: string }> }) {
  const { org: slug } = await params;
  const org = await organisation({ slug });
  return { title: `Sign in — ${org?.nom ?? 'Document Portal'}`, robots: { index: false, follow: false } };
}

/* L'écran d'entrée du portail RÉEL.

   La différence avec app/portal/sign-in n'est pas seulement technique : là où
   la démonstration MONTRE une bascule de marque à quelqu'un qui n'a encore
   rien à faire ici, cette page-ci s'adresse à quelqu'un qui a déjà un compte
   quelque part chez Google, Microsoft, ou une passkey posée sur son
   appareil — le travail est de le laisser passer le plus vite possible, pas
   de raconter une histoire. */

export default async function EntreeAgence({
  params,
  searchParams,
}: {
  params: Promise<{ org: string }>;
  searchParams: Promise<{ refuse?: string }>;
}) {
  const { org: slug } = await params;
  const { refuse } = await searchParams;
  const org = await organisation({ slug });
  if (!org) notFound();

  return (
    <Connexion
      orgSlug={org.slug}
      refuse={refuse === '1'}
      orgNom={org.nom}
      logo={org.logo}
      logoLargeur={org.logoLargeur}
      logoHauteur={org.logoHauteur}
      domaines={org.domaines.map((d) => d.domaine)}
      actionGoogle={connexionGoogle.bind(null, org.slug)}
      actionMicrosoft={connexionMicrosoft.bind(null, org.slug)}
      actionEmail={connexionEmail.bind(null, org.slug)}
    />
  );
}

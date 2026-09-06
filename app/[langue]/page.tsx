import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Accueil from '@/components/Accueil';
import { LANGUES, LANGUE_RACINE, estLangue } from '@/lib/langues';
import { textes } from '@/lib/traductions';

/* Les langues autres que le français : /en, /es, /pt.

   Chacune a son adresse propre, donc sa page indexable et partageable. Un
   entraîneur peut envoyer /pt directement à sa recrue brésilienne sans
   dépendre d'une détection. */

export function generateStaticParams() {
  return LANGUES.filter((l) => l !== LANGUE_RACINE).map((langue) => ({ langue }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ langue: string }>;
}): Promise<Metadata> {
  const { langue } = await params;
  if (!estLangue(langue)) return {};
  const t = textes(langue);
  return { title: t.meta.titre, description: t.meta.description };
}

export default async function PageLangue({ params }: { params: Promise<{ langue: string }> }) {
  const { langue } = await params;
  // Le français n'a pas de préfixe : /fr n'existe pas, et ne doit pas répondre.
  if (!estLangue(langue) || langue === LANGUE_RACINE) notFound();
  return <Accueil langue={langue} />;
}

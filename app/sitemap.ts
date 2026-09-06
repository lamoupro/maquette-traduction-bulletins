import type { MetadataRoute } from 'next';
import { LANGUES, LANGUE_RACINE, chemin } from '@/lib/langues';

const SITE = 'https://protranslayte.com';

/* Le plan du site accélère la découverte des pages par Google. Seules les
   pages publiques y figurent : l'administration, le portail et le tunnel de
   paiement restent hors index.

   Les quatre langues y figurent TOUTES. Sans quoi Google ne découvrirait
   jamais /en, /es et /pt : rien ne pointe vers elles depuis l'extérieur, et la
   redirection de la racine ne se déclenche que sur un en-tête de langue que le
   robot n'envoie pas toujours. */

const PAGES: [string, MetadataRoute.Sitemap[number]['changeFrequency'], number][] = [
  ['', 'weekly', 1],
  ['/contact', 'monthly', 0.5],
  ['/cgv', 'yearly', 0.3],
  ['/mentions-legales', 'yearly', 0.3],
  ['/confidentialite', 'yearly', 0.3],
];

export default function sitemap(): MetadataRoute.Sitemap {
  const maj = new Date();
  return LANGUES.flatMap((langue) =>
    PAGES.map(([suite, changeFrequency, priority]) => ({
      url: `${SITE}${chemin(langue, suite)}`,
      lastModified: maj,
      changeFrequency,
      // Le français reste prioritaire : c'est la version référencée aujourd'hui.
      priority: langue === LANGUE_RACINE ? priority : Math.max(0.2, priority - 0.1),
    })),
  );
}

import type { MetadataRoute } from 'next';

const SITE = 'https://protranslayte.com';

/* Le plan du site accélère la découverte des pages par Google. Seules les
   pages publiques y figurent : l'administration et le tunnel de paiement
   restent hors index. */

export default function sitemap(): MetadataRoute.Sitemap {
  const maj = new Date();
  return [
    { url: `${SITE}/`, lastModified: maj, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE}/contact`, lastModified: maj, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE}/cgv`, lastModified: maj, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE}/mentions-legales`, lastModified: maj, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE}/confidentialite`, lastModified: maj, changeFrequency: 'yearly', priority: 0.3 },
  ];
}

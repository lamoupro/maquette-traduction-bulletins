import type { MetadataRoute } from 'next';

/* Les robots ont besoin de savoir où ne pas aller : l'administration et le
   tunnel de paiement n'ont rien à faire dans un index public, et les y
   laisser gaspille le budget d'exploration du site. */

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/admin/', '/api/', '/commande/'],
    },
    sitemap: 'https://protranslayte.com/sitemap.xml',
  };
}

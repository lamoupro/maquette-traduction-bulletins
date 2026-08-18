import { AVIS, PRIX_OFFRE } from '@/lib/data';
import { ENTREPRISE } from '@/lib/legal';

/* Données structurées (schema.org).

   C'est ce qui permet à Google de comprendre ce que vend le site plutôt que
   de le deviner, et d'afficher le prix et la note directement dans les
   résultats de recherche. Sans elles, la page n'est qu'un texte parmi
   d'autres.

   Tout ce qui est déclaré ici doit être vrai : le prix vient de la même
   constante que la page, et la note est calculée sur les avis réels, jamais
   saisie à la main. Une note inventée est une pratique trompeuse, et Google
   retire durablement les extraits enrichis des sites qui s'y risquent. */

const note = AVIS.reduce((somme, a) => somme + a.e, 0) / AVIS.length;

export default function DonneesStructurees() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Traduction assermentée de bulletins et diplômes',
    serviceType: 'Traduction assermentée',
    description:
      'Traduction assermentée et certifiée de bulletins de notes, relevés et diplômes par un traducteur agréé près une cour d’appel. Prix fixe à la page, livraison en 24 à 48 heures.',
    url: 'https://protranslayte.com/',
    areaServed: { '@type': 'Country', name: 'France' },
    availableLanguage: ['fr', 'en', 'es', 'de', 'it', 'pt', 'ar'],
    provider: {
      '@type': 'Organization',
      name: ENTREPRISE.nomCommercial,
      url: 'https://protranslayte.com/',
      email: ENTREPRISE.email,
    },
    offers: {
      '@type': 'Offer',
      price: PRIX_OFFRE,
      priceCurrency: 'EUR',
      // Le tarif s'entend par page : le préciser évite que Google l'affiche
      // comme le prix d'un dossier entier.
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: PRIX_OFFRE,
        priceCurrency: 'EUR',
        unitText: 'page',
      },
      availability: 'https://schema.org/InStock',
      url: 'https://protranslayte.com/#dossier',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: note.toFixed(2),
      reviewCount: AVIS.length,
      bestRating: 5,
      worstRating: 1,
    },
  };

  return (
    <script
      type="application/ld+json"
      // Le contenu vient de nos propres constantes, jamais d'une saisie
      // extérieure : rien d'arbitraire ne peut être injecté ici.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

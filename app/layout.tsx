import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import { BALISE, LANGUE_RACINE, estLangue } from '@/lib/langues';
import './globals.css';

export const metadata: Metadata = {
  // Le mot-clé porteur est placé en tête : personne ne cherche la marque, et
  // les 60 premiers caractères sont les seuls réellement lus dans Google.
  title: 'Traduction assermentée de bulletins et diplômes — 25 € sous 48 h',
  description:
    'Traduction assermentée et certifiée de bulletins de notes, relevés et diplômes par un traducteur agréé près une cour d’appel. Prix fixe de 25 € la page, livrée en 24 à 48 h, sans devis à attendre.',
  // Ouvert à l'indexation le 16 août 2026, en même temps que la campagne
  // Google Ads : le site est commercialement prêt, et le référencement
  // naturel met plusieurs semaines à s'installer.
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://protranslayte.com/',
    /* Chaque langue a son adresse propre, et on le DIT à Google : sans ces
       liens, il verrait quatre pages concurrentes sur le même sujet et n'en
       retiendrait qu'une. Avec eux, il sert la bonne selon le lecteur. */
    languages: {
      'x-default': 'https://protranslayte.com/',
      fr: 'https://protranslayte.com/',
      en: 'https://protranslayte.com/en',
      es: 'https://protranslayte.com/es',
      'pt-BR': 'https://protranslayte.com/pt',
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1359B8',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  /* La langue vient du middleware, qui la pose sur chaque requête. Le gabarit
     racine n'a aucun autre moyen de la connaître : il est au-dessus des
     segments d'adresse, et Next ne la lui passe pas. */
  const entete = (await headers()).get('x-langue');
  const langue = entete && estLangue(entete) ? entete : LANGUE_RACINE;

  return (
    <html lang={BALISE[langue]}>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}

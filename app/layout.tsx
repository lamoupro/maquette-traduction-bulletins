import type { Metadata, Viewport } from 'next';
import LuckyOrange from '@/components/LuckyOrange';
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
  alternates: { canonical: 'https://protranslayte.com/' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1359B8',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0 }}>
        {children}
        <LuckyOrange />
      </body>
    </html>
  );
}

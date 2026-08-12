import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'protranslayte — traduction assermentée de bulletins de notes',
  description:
    'Traduction assermentée de bulletins de notes — 25 € le document, livraison sous 24 à 48 h.',
  // Le site reste hors index tant qu'il n'est pas commercialement prêt.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1359B8',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}

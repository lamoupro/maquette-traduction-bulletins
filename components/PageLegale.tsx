import Link from 'next/link';
import { A_REMPLIR, DERNIERE_MAJ } from '@/lib/legal';
import Logo from './Logo';

/* Enveloppe commune aux quatre pages légales : même en-tête, même pied de
   page, même largeur de lecture. Aucune de ces pages n'est indexée tant que
   le site entier ne l'est pas — le réglage vit dans app/layout.tsx. */

/** Affiche une valeur, ou un avertissement visible si elle manque. */
export function Champ({ v }: { v: string | null | undefined }) {
  if (!v || v === A_REMPLIR) return <mark className="manquant">à compléter</mark>;
  return <>{v}</>;
}

export default function PageLegale({
  titre,
  intro,
  children,
}: {
  titre: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="legal-tete">
        <div className="wrap">
          <Link href="/" aria-label="Retour à l'accueil">
            <Logo />
          </Link>
          <Link href="/" className="legal-retour">
            ← Retour au site
          </Link>
        </div>
      </header>

      <main className="legal">
        <div className="wrap">
          <h1>{titre}</h1>
          {intro ? <p className="legal-intro">{intro}</p> : null}
          <p className="legal-maj">Dernière mise à jour : {DERNIERE_MAJ}</p>
          {children}
        </div>
      </main>

      <footer className="site legal-pied">
        <div className="wrap">
          <div className="foot-bottom" style={{ marginTop: 0, borderTop: 'none' }}>
            <span>© 2026 Protranslayte</span>
            <span className="legal-liens">
              <Link href="/mentions-legales">Mentions légales</Link>
              <Link href="/cgv">CGV</Link>
              <Link href="/confidentialite">Confidentialité</Link>
              <Link href="/contact">Contact</Link>
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}

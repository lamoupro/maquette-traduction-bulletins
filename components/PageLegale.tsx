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
  langue = 'fr',
}: {
  titre: string;
  intro?: string;
  children: React.ReactNode;
  /* Le chrome suit la langue de la page. Le lien de retour doit ramener à la
     version qu'on lisait, pas à la racine française. */
  langue?: 'fr' | 'en' | 'es' | 'pt';
}) {
  const accueil = langue === 'fr' ? '/' : `/${langue}`;
  const retour = {
    fr: 'Retour au site',
    en: 'Back to the site',
    es: 'Volver al sitio',
    pt: 'Voltar ao site',
  }[langue];
  return (
    <>
      <header className="legal-tete">
        <div className="wrap">
          <Link href={accueil} aria-label={retour}>
            <Logo />
          </Link>
          <Link href={accueil} className="legal-retour">
            ← {retour}
          </Link>
        </div>
      </header>

      <main className="legal">
        <div className="wrap">
          <h1>{titre}</h1>
          {intro ? <p className="legal-intro">{intro}</p> : null}
          <p className="legal-maj">
            {langue === 'fr' ? 'Dernière mise à jour : ' : 'Last updated: '}
            {DERNIERE_MAJ}
          </p>
          {children}
        </div>
      </main>

      <footer className="site legal-pied">
        <div className="wrap">
          <div className="foot-bottom" style={{ marginTop: 0, borderTop: 'none' }}>
            <span>© 2026 Protranslayte</span>
            <span className="legal-liens">
              {(langue === 'fr'
                ? ([
                    ['/mentions-legales', 'Mentions légales'],
                    ['/cgv', 'CGV'],
                    ['/confidentialite', 'Confidentialité'],
                    ['/contact', 'Contact'],
                  ] as const)
                : ([
                    [`/${langue}/mentions-legales`, 'Legal notice'],
                    [`/${langue}/cgv`, 'Terms of sale'],
                    [`/${langue}/confidentialite`, 'Privacy'],
                    [`/${langue}/contact`, 'Contact'],
                  ] as const)
              ).map(([lien, nom]) => (
                <Link key={lien} href={lien}>
                  {nom}
                </Link>
              ))}
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}

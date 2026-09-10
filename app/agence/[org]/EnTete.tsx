import Link from 'next/link';
import type { Autorise } from '@/lib/agence/garde';
import { deconnexion } from './dashboard-actions';

/* L'en-tête du portail réel, partagé par toutes ses pages SAUF l'écran de
   connexion — celui-ci porte sa marque dans sa propre carte, et n'a personne
   à déconnecter.

   Le cartouche « protranslayte × leur logo » est le même qu'à l'entrée, à
   plat : notre marque ne s'efface pas chez le client, elle prend ses
   couleurs. Elle ramène aussi à l'accueil, ce qu'un logo en tête de page est
   censé faire. */

export default function EnTete({
  ctx,
  actuel,
}: {
  ctx: Autorise;
  actuel: 'sportifs' | 'compte';
}) {
  const { org, role, email } = ctx;

  return (
    <header className="pt-tete">
      <div className="pt-wrap">
        <Link
          href={ctx.lien('')}
          className="pt-cartouche"
          style={{ marginBottom: 0, paddingBottom: 0, border: 'none', textDecoration: 'none' }}
        >
          <span className="pt-notre-marque">
            pro<span className="bleu">translayte</span>
          </span>
          <span className="pt-croix" aria-hidden="true">×</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="pt-logo-org"
            src={org.logo}
            alt={org.nom}
            width={org.logoLargeur}
            height={org.logoHauteur}
          />
        </Link>

        <nav className="pt-nav">
          <Link href={ctx.lien('')} aria-current={actuel === 'sportifs' ? 'page' : undefined}>
            Athletes
          </Link>
          <Link href={ctx.lien('/compte')} aria-current={actuel === 'compte' ? 'page' : undefined}>
            Account
          </Link>
        </nav>

        <div className="pt-tete-fin">
          <span className="pt-role">{role}</span>
          <span className="pt-tete-email">{email}</span>
          <form action={deconnexion.bind(null, org.slug)}>
            <button type="submit" className="pt-bouton">Sign out</button>
          </form>
        </div>
      </div>
    </header>
  );
}

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from './auth';
import { verifierAcces } from './acces';
import { organisation } from './organisations';
import { adresseAgence } from './host';
import type { Role } from './roles';

/* La garde du portail réel, en un seul endroit.

   Elle est revérifiée à CHAQUE page et à CHAQUE route, jamais une seule fois
   à l'entrée : un accès qui ne se contrôle qu'à la connexion reste valable
   après qu'on a retiré quelqu'un de l'organisation. C'est la raison d'être de
   la session en base plutôt qu'en jeton auto-porteur — autant s'en servir.

   Deux variantes, parce que les deux mondes ne se trompent pas de la même
   façon : une page REDIRIGE vers l'écran de connexion, une route répond un
   code. Rediriger une requête de PDF donnerait une page HTML téléchargée sous
   un nom en .pdf. */

async function contexte(slug: string) {
  const hote = (await headers()).get('host');
  const proto = hote?.startsWith('localhost') ? 'http' : 'https';
  return { hote, origine: `${proto}://${hote}` };
}

export type Autorise = {
  role: Role;
  utilisateurId: string;
  email: string;
  nom: string | null;
  org: NonNullable<Awaited<ReturnType<typeof organisation>>>;
  /** Le préfixe d'adresse à utiliser dans les liens de CETTE requête. */
  lien: (suite: string) => string;
};

async function verifier(slug: string) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) return { genre: 'anonyme' as const };

  const acces = await verifierAcces(slug, session.user.id, session.user.email);
  if (acces.genre === 'refuse') return { genre: 'refuse' as const };

  const org = await organisation({ slug });
  if (!org) return { genre: 'anonyme' as const };

  return {
    genre: 'ok' as const,
    role: acces.role,
    utilisateurId: session.user.id,
    email: session.user.email,
    nom: session.user.name ?? null,
    org,
  };
}

/** Pour une PAGE : renvoie le contexte, ou redirige vers l'écran de connexion. */
export async function garde(slug: string): Promise<Autorise> {
  const { hote, origine } = await contexte(slug);
  const versSignIn = (suite = '') => adresseAgence(slug, hote, `/sign-in${suite}`, origine);

  const r = await verifier(slug);
  if (r.genre === 'anonyme') redirect(versSignIn());
  if (r.genre === 'refuse') redirect(versSignIn('?refuse=1'));

  return {
    role: r.role,
    utilisateurId: r.utilisateurId,
    email: r.email,
    nom: r.nom,
    org: r.org,
    /* Chemin court sur le sous-domaine du client, long partout ailleurs.
       Sans ça, un visiteur de trackhouse.protranslayte.com verrait
       « /agence/trackhouse/… » apparaître dans sa barre d'adresse au premier
       lien suivi. */
    lien: (suite: string) => adresseAgence(slug, hote, suite, origine),
  };
}

/** Pour une ROUTE : renvoie le contexte, ou rien — à l'appelant de répondre 401. */
export async function gardeRoute(slug: string) {
  const r = await verifier(slug);
  return r.genre === 'ok' ? r : null;
}

import { redemanderLien } from './actions';
import Redemander from './Redemander';
import '../agence.css';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Sign in — Protranslayte',
  robots: { index: false, follow: false },
};

/* La page où atterrit toute connexion qui a échoué.

   Elle n'existait pas, et c'était un vrai trou : Auth.js y renvoie chaque
   erreur (`pages.error` dans lib/agence/auth.ts), si bien qu'un lien expiré
   se terminait par un 404 brut. Un lien vit dix minutes et ne sert qu'une
   fois : le cas n'est pas exotique, c'est le plus banal de tous.

   Une page d'erreur qui ne fait que nommer l'erreur ne vaut pas mieux qu'un
   404 : celle-ci porte la sortie. On y redemande un lien sans avoir à
   retrouver l'adresse de son organisation — le domaine de l'adresse suffit à
   la retrouver pour nous. */

const MESSAGES: Record<string, { titre: string; corps: string }> = {
  Verification: {
    titre: 'This link has expired',
    corps:
      'Sign-in links last 10 minutes and work once. Ask for a new one below — it arrives in a few seconds.',
  },
  AccessDenied: {
    titre: 'That account can\'t be used here',
    corps:
      'You signed in successfully, but that account isn\'t linked to an organisation on this portal. Ask your organisation\'s admin to invite you.',
  },
  Configuration: {
    titre: 'Something is wrong on our side',
    corps:
      'Sign-in is temporarily unavailable. It is not your account, and there is nothing to fix on your end — try again shortly.',
  },
  OAuthAccountNotLinked: {
    titre: 'Use the same method as last time',
    corps:
      'This email address was first used with a different sign-in method. Use the one you signed in with originally, or ask for a link below.',
  },
};

const DEFAUT = {
  titre: 'That didn\'t work',
  corps: 'The sign-in couldn\'t be completed. Ask for a new link below and try again.',
};

export default async function ErreurConnexion({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const message = (error && MESSAGES[error]) || DEFAUT;

  return (
    <div className="pt est-revele">
      <main className="pt-entree">
        <div className="pt-carte">
          <span className="pt-cartouche">
            <span className="pt-notre-marque">
              pro<span className="bleu">translayte</span>
            </span>
          </span>
          <span className="pt-carte-lab">Sign-in</span>
          <h1>{message.titre}</h1>
          <p>{message.corps}</p>
          <Redemander action={redemanderLien} />
        </div>
      </main>
    </div>
  );
}

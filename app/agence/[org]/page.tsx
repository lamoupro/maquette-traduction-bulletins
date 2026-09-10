import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import Link from 'next/link';
import { auth, signOut } from '@/lib/agence/auth';
import { verifierAcces } from '@/lib/agence/acces';
import { organisation } from '@/lib/agence/organisations';
import { adresseAgence } from '@/lib/agence/host';
import { db } from '@/lib/agence/db/client';
import { authenticators, users } from '@/lib/agence/db/schema';
import { eq } from 'drizzle-orm';
import { jetonSessionActuelle, sessionsDe } from '@/lib/agence/sessions-liste';
import { deconnecterAppareil, reporterPasskey } from './dashboard-actions';
import PropositionPasskey from './PropositionPasskey';

export const dynamic = 'force-dynamic';

/* Le tableau de bord — volontairement minimal. Ce n'est pas ici que vivront
   les sportifs et les dossiers réels : cette migration-là est un chantier à
   part, distinct de « le système de connexion » qui est l'objet de ce
   dossier. Cette page prouve que la boucle entière fonctionne — connexion,
   vérification d'appartenance, proposition de passkey, liste des
   sessions — et sert de fondation à ce qui viendra dessus. */

export default async function TableauDeBord({ params }: { params: Promise<{ org: string }> }) {
  const { org: slug } = await params;
  /* Chemin court sur le sous-domaine du client, long partout ailleurs — voir
     lib/agence/host.ts. Sans ça, un visiteur non connecté sur
     trackhouse.protranslayte.com se retrouverait, l'instant d'une
     redirection, avec "/agence/trackhouse/sign-in" dans sa barre d'adresse. */
  const hote = (await headers()).get('host');
  const versSignIn = (suite = '') =>
    adresseAgence(slug, hote, `/sign-in${suite}`, `https://${hote}`);

  /* Revérifié ICI, pas seulement à /entree : la même règle que la
     démonstration applique déjà à ses propres pages — un accès qui ne se
     revérifie qu'une fois, à la connexion, reste valable même après qu'on a
     retiré la personne. Voir la note dans app/portal/[id]/page.tsx. */
  const session = await auth();
  if (!session?.user?.id || !session.user.email) redirect(versSignIn());

  const acces = await verifierAcces(slug, session.user.id, session.user.email);
  if (acces.genre === 'refuse') redirect(versSignIn('?refuse=1'));

  const org = await organisation({ slug });
  if (!org) redirect(versSignIn());

  const [mesPasskeys, mesSessions, jetonActuel, moi] = await Promise.all([
    db.query.authenticators.findMany({ where: eq(authenticators.userId, session.user.id) }),
    sessionsDe(session.user.id),
    jetonSessionActuelle(),
    db.query.users.findFirst({ where: eq(users.id, session.user.id) }),
  ]);

  const proposerPasskey = mesPasskeys.length === 0 && !moi?.passkeyPromptDismissedAt;

  return (
    <>
      <header className="pt-tete">
        <div className="pt-wrap">
          <span className="pt-cartouche" style={{ marginBottom: 0, paddingBottom: 0, border: 'none' }}>
            <span className="pt-notre-marque">
              pro<span className="bleu">translayte</span>
            </span>
            <span className="pt-croix" aria-hidden="true">×</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="pt-logo-org" src={org.logo} alt={org.nom} width={org.logoLargeur} height={org.logoHauteur} />
          </span>
          <span className="pt-role">{acces.role}</span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--pt-soft)' }}>{session.user.email}</span>
            <form
              action={async () => {
                'use server';
                await signOut({ redirectTo: `/agence/${slug}/sign-in` });
              }}
            >
              <button type="submit" className="pt-bouton">Sign out</button>
            </form>
          </div>
        </div>
      </header>

      <main className="pt-wrap">
        <div className="pt-titre">
          <h1>{org.nom}</h1>
          <p>Signed in as {session.user.name ?? session.user.email}.</p>
        </div>

        {proposerPasskey && (
          <PropositionPasskey onReporter={reporterPasskey.bind(null, slug)} />
        )}

        <section className="pt-sessions">
          <h2>Signed-in devices</h2>
          {mesSessions.map((s) => (
            <div className="pt-session-ligne" key={s.sessionToken}>
              <span>{s.userAgent ?? 'Unknown device'}</span>
              <span className="pt-mono">since {s.creeeLe.toISOString().slice(0, 10)}</span>
              {s.sessionToken === jetonActuel && <span className="pt-session-actuelle">This device</span>}
              {s.sessionToken !== jetonActuel && (
                <form action={deconnecterAppareil.bind(null, slug, s.sessionToken)}>
                  <button type="submit" className="pt-bouton">Sign out this device</button>
                </form>
              )}
            </div>
          ))}
        </section>

        <p style={{ fontSize: '0.85rem', color: 'var(--pt-faint)' }}>
          <Link href="/agence" style={{ color: 'inherit' }}>← protranslayte</Link>
        </p>
      </main>
    </>
  );
}

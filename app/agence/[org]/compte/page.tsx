import { eq } from 'drizzle-orm';
import { garde } from '@/lib/agence/garde';
import { db } from '@/lib/agence/db/client';
import { authenticators, users } from '@/lib/agence/db/schema';
import { jetonSessionActuelle, sessionsDe } from '@/lib/agence/sessions-liste';
import EnTete from '../EnTete';
import PropositionPasskey from '../PropositionPasskey';
import { deconnecterAppareil, reporterPasskey } from '../dashboard-actions';

export const dynamic = 'force-dynamic';

/* Le compte : la passkey, et les appareils connectés.

   Séparé de l'accueil depuis que celui-ci porte le vivier. Ce sont deux
   gestes distincts — travailler sur des dossiers, et régler sa propre
   connexion — et les empiler sur un même écran faisait passer le second pour
   le produit. */

export default async function Compte({ params }: { params: Promise<{ org: string }> }) {
  const { org: slug } = await params;
  const ctx = await garde(slug);

  const [mesPasskeys, mesSessions, jetonActuel, moi] = await Promise.all([
    db.query.authenticators.findMany({ where: eq(authenticators.userId, ctx.utilisateurId) }),
    sessionsDe(ctx.utilisateurId),
    jetonSessionActuelle(),
    db.query.users.findFirst({ where: eq(users.id, ctx.utilisateurId) }),
  ]);

  const proposerPasskey = mesPasskeys.length === 0 && !moi?.passkeyPromptDismissedAt;

  return (
    <>
      <EnTete ctx={ctx} actuel="compte" />

      <main className="pt-wrap">
        <div className="pt-titre">
          <h1>Your account</h1>
          <p>
            Signed in as {ctx.nom ?? ctx.email} · {ctx.role} of {ctx.org.nom}.
          </p>
        </div>

        {proposerPasskey && <PropositionPasskey onReporter={reporterPasskey.bind(null, slug)} />}

        <section className="pt-sessions">
          <h2>Signed-in devices</h2>
          {mesSessions.map((s) => (
            <div className="pt-session-ligne" key={s.sessionToken}>
              <span>{s.userAgent ?? 'Unknown device'}</span>
              <span className="pt-mono">since {s.creeeLe.toISOString().slice(0, 10)}</span>
              {s.sessionToken === jetonActuel && (
                <span className="pt-session-actuelle">This device</span>
              )}
              {s.sessionToken !== jetonActuel && (
                <form action={deconnecterAppareil.bind(null, slug, s.sessionToken)}>
                  <button type="submit" className="pt-bouton">Sign out this device</button>
                </form>
              )}
            </div>
          ))}
        </section>

        <section className="pt-sortie">
          <h2>Staying signed in</h2>
          <p style={{ marginBottom: 0 }}>
            This portal keeps you signed in for 30 days on each browser you use. If you opened
            your sign-in link inside a mail app&apos;s built-in browser, that session only lives
            there — open{' '}
            <span className="pt-mono">{ctx.org.slug}.protranslayte.com</span> in Safari or Chrome
            and sign in once more to keep it for good.
          </p>
        </section>
      </main>
    </>
  );
}

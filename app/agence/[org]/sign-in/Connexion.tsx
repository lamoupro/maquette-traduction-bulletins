'use client';

import { useActionState, useEffect, useState } from 'react';
import { browserSupportsWebAuthn, startAuthentication } from '@simplewebauthn/browser';

/* L'écran d'entrée réel — quatre portes, une seule décision derrière :
   qui es-tu. Ce que chacune autorise ensuite se décide ailleurs, une fois
   revenu sur notre domaine (voir /agence/[org]/entree et lib/agence/acces.ts).

   Google et Microsoft sont de simples formulaires vers une action serveur :
   Auth.js gère la redirection vers le fournisseur lui-même, il n'y a rien à
   faire ici qu'un bouton qui soumet.

   La passkey est la seule des quatre qui ne redirige nulle part — c'est un
   échange direct avec l'appareil (navigator.credentials), donc pilotée en
   JavaScript, contre les deux routes sous app/api/agence-auth/passkey/.

   Le lien magique passe par une Server Action classique (`useActionState`),
   comme documenté pour les formulaires de l'App Router. */

type EtatEmail = { erreur?: string; envoye?: true; adresse?: string } | undefined;

export default function Connexion({
  orgSlug,
  orgNom,
  logo,
  logoLargeur,
  logoHauteur,
  domaines,
  refuse,
  actionGoogle,
  actionMicrosoft,
  actionEmail,
}: {
  orgSlug: string;
  orgNom: string;
  logo: string;
  logoLargeur: number;
  logoHauteur: number;
  domaines: string[];
  /** Une identité a bien été prouvée, mais /entree n'y a trouvé aucun accès. */
  refuse: boolean;
  actionGoogle: () => Promise<void>;
  actionMicrosoft: () => Promise<void>;
  actionEmail: (formData: FormData) => Promise<EtatEmail>;
}) {
  const [passkeyDispo, setPasskeyDispo] = useState(false);
  const [passkeyEtat, setPasskeyEtat] = useState<'repos' | 'en_cours' | 'erreur'>('repos');
  const [passkeyErreur, setPasskeyErreur] = useState('');
  const [etatEmail, envoyer, enCours] = useActionState<EtatEmail, FormData>(
    async (_prec, fd) => actionEmail(fd),
    undefined,
  );

  useEffect(() => {
    setPasskeyDispo(browserSupportsWebAuthn());
  }, []);

  async function connexionParPasskey() {
    setPasskeyEtat('en_cours');
    setPasskeyErreur('');
    try {
      const options = await fetch('/api/agence-auth/passkey/authenticate-options', {
        method: 'POST',
      }).then((r) => r.json());

      const reponse = await startAuthentication({ optionsJSON: options });

      const verif = await fetch('/api/agence-auth/passkey/authenticate-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reponse }),
      }).then((r) => r.json());

      if (!verif.ok) throw new Error(verif.erreur || 'Verification failed.');
      window.location.href = `/agence/${orgSlug}/entree`;
    } catch (e) {
      // Un utilisateur qui annule la boîte de dialogue système n'a pas
      // échoué : il a changé d'avis. On revient au repos, sans l'alarmer.
      if (e instanceof Error && e.name === 'NotAllowedError') {
        setPasskeyEtat('repos');
        return;
      }
      setPasskeyEtat('erreur');
      setPasskeyErreur(e instanceof Error ? e.message : 'Something went wrong.');
    }
  }

  const domainesTexte = domaines.length
    ? domaines.map((d) => `@${d}`).join(' or ')
    : null;

  if (etatEmail?.envoye) {
    return (
      <main className="pt-entree">
        <div className="pt-carte">
          <Marque orgNom={orgNom} logo={logo} logoLargeur={logoLargeur} logoHauteur={logoHauteur} />
          <span className="pt-carte-lab">Check your inbox</span>
          <h1>We sent you a link</h1>
          <p>
            Open the link we just sent to <strong>{etatEmail.adresse}</strong> to sign in. It
            expires in <strong>10 minutes</strong> and can be used once.
          </p>
          <p className="pt-carte-note">
            Tip: open it in Safari or Chrome, not your mail app&apos;s built-in browser — that
            keeps you signed in for 30 days instead of only until you close the mail app.
          </p>
          <p className="pt-carte-note">No password to create, and nothing to install.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-entree">
      <div className="pt-carte">
        <Marque orgNom={orgNom} logo={logo} logoLargeur={logoLargeur} logoHauteur={logoHauteur} />
        <h1>Sign in to the document portal</h1>

        {refuse && (
          <p className="pt-erreur">
            We confirmed your identity, but your account isn&apos;t linked to {orgNom} yet. Ask
            your organisation&apos;s admin to invite you.
          </p>
        )}

        <div className="pt-connexion-boutons">
          <form action={actionGoogle}>
            <button type="submit" className="pt-bouton-fournisseur">
              <IconeGoogle /> Continue with Google
            </button>
          </form>
          <form action={actionMicrosoft}>
            <button type="submit" className="pt-bouton-fournisseur">
              <IconeMicrosoft /> Continue with Microsoft
            </button>
          </form>
        </div>

        {passkeyDispo && (
          <>
            <div className="pt-separateur">or</div>
            <button
              type="button"
              className="pt-bouton-fournisseur pt-passkey"
              onClick={connexionParPasskey}
              disabled={passkeyEtat === 'en_cours'}
            >
              <IconePasskey /> {passkeyEtat === 'en_cours' ? 'Waiting for your device…' : 'Sign in with a passkey'}
            </button>
            {passkeyEtat === 'erreur' && <p className="pt-erreur">{passkeyErreur}</p>}
          </>
        )}

        <div className="pt-separateur">or</div>

        <form action={envoyer}>
          <label className="pt-champ">
            <span>Work email address</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder={domaines[0] ? `name@${domaines[0]}` : 'name@company.com'}
              aria-invalid={Boolean(etatEmail?.erreur)}
            />
          </label>
          {etatEmail?.erreur && <p className="pt-erreur">{etatEmail.erreur}</p>}
          <button
            type="submit"
            className="pt-bouton primaire pt-large"
            disabled={enCours}
            style={{ marginTop: 10 }}
          >
            {enCours ? 'Sending…' : 'Email me a sign-in link'}
          </button>
        </form>

        {domainesTexte && (
          <p className="pt-carte-pied">
            Access is limited to <strong>{domainesTexte}</strong> addresses.
          </p>
        )}
      </div>
    </main>
  );
}

function Marque({
  orgNom,
  logo,
  logoLargeur,
  logoHauteur,
}: {
  orgNom: string;
  logo: string;
  logoLargeur: number;
  logoHauteur: number;
}) {
  return (
    <span className="pt-cartouche">
      <span className="pt-notre-marque">
        pro<span className="bleu">translayte</span>
      </span>
      <span className="pt-croix" aria-hidden="true">×</span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="pt-logo-org" src={logo} alt={orgNom} width={logoLargeur} height={logoHauteur} />
    </span>
  );
}

function IconeGoogle() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.87 2.7-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.83.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.98v2.33A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.95 10.7a5.4 5.4 0 0 1 0-3.4V4.97H.98a9 9 0 0 0 0 8.06l2.97-2.33Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.42 0 9 0A9 9 0 0 0 .98 4.97L3.95 7.3C4.66 5.17 6.65 3.58 9 3.58Z" />
    </svg>
  );
}

function IconeMicrosoft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <rect width="7" height="7" x="0" y="0" fill="#F25022" />
      <rect width="7" height="7" x="9" y="0" fill="#7FBA00" />
      <rect width="7" height="7" x="0" y="9" fill="#00A4EF" />
      <rect width="7" height="7" x="9" y="9" fill="#FFB900" />
    </svg>
  );
}

function IconePasskey() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M15 11.5 21 5.5M21 5.5 19 3.5M21 5.5 23 7.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

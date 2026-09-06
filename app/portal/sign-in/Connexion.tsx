'use client';

import { useEffect, useRef, useState } from 'react';

/* Les trois états de l'entrée : saisie, lien envoyé, adresse refusée.

   Le refus ne dit jamais si un compte existe. « Cette adresse est inconnue »
   renseigne un inconnu sur qui travaille dans l'établissement ; on répond donc
   sur le DOMAINE, qui est une règle publique, et on renvoie vers admissions.

   Rien n'est envoyé : c'est une maquette. Les gestes, les délais et les
   messages sont ceux du produit, la mécanique arrivera avec la base. */

const RENVOI_S = 30;

export default function Connexion({
  etablissement,
  domaine,
}: {
  etablissement: string;
  domaine: string;
}) {
  const [email, setEmail] = useState('');
  const [etat, setEtat] = useState<'saisie' | 'envoye'>('saisie');
  const [refus, setRefus] = useState<string | null>(null);
  const [reste, setReste] = useState(0);
  const champ = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (reste <= 0) return;
    const t = setTimeout(() => setReste((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [reste]);

  function envoyer(e: React.FormEvent) {
    e.preventDefault();
    const a = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(a)) {
      setRefus('Enter a valid email address.');
      return;
    }
    /* La restriction de domaine EST le contrôle d'accès : elle garantit que le
       lien ne peut atterrir que dans une boîte de l'établissement. */
    if (!a.endsWith(`@${domaine}`)) {
      setRefus(
        `This portal is open to ${etablissement} staff. Ask International Admissions to invite you.`,
      );
      return;
    }
    setRefus(null);
    setEtat('envoye');
    setReste(RENVOI_S);
  }

  if (etat === 'envoye') {
    return (
      <main className="pt-entree">
        <div className="pt-carte">
          <span className="pt-carte-lab">Check your inbox</span>
          <h1>We sent you a link</h1>
          <p>
            Open the link we just sent to <strong>{email.trim().toLowerCase()}</strong> to reach the
            portal. It expires in <strong>10 minutes</strong> and can be used once.
          </p>
          <p className="pt-carte-note">
            No password to create, and nothing to install. The link only works from this browser.
          </p>
          {/* Raccourci de démonstration : il n'y a pas d'e-mail à recevoir,
              et une présentation ne peut pas s'arrêter là. Marqué comme tel
              pour que personne ne le prenne pour le produit. */}
          <a className="pt-bouton primaire pt-large" href="/portal">
            Open the link ↗ <span className="pt-demo-marque">demo</span>
          </a>

          <div className="pt-carte-actions" style={{ marginTop: 10 }}>
            <button
              type="button"
              className="pt-bouton"
              disabled={reste > 0}
              onClick={() => setReste(RENVOI_S)}
            >
              {reste > 0 ? `Resend in ${reste}s` : 'Resend the link'}
            </button>
            <button
              type="button"
              className="pt-bouton"
              onClick={() => {
                setEtat('saisie');
                setTimeout(() => champ.current?.focus(), 0);
              }}
            >
              Use a different address
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-entree">
      <form className="pt-carte" onSubmit={envoyer} noValidate>
        <span className="pt-carte-lab">{etablissement}</span>
        <h1>Sign in to the document portal</h1>
        <p>
          Enter your institutional address. We send you a link — there is no password to create.
        </p>

        <label className="pt-champ">
          <span>Email address</span>
          <input
            ref={champ}
            type="email"
            autoComplete="email"
            autoFocus
            placeholder={`name@${domaine}`}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (refus) setRefus(null);
            }}
            aria-invalid={Boolean(refus)}
            aria-describedby={refus ? 'pt-refus' : 'pt-domaine'}
          />
        </label>

        {refus ? (
          <p className="pt-refus" id="pt-refus" role="alert">
            {refus}
          </p>
        ) : (
          <p className="pt-carte-note" id="pt-domaine">
            Access is limited to <strong>@{domaine}</strong> addresses.
          </p>
        )}

        <button type="submit" className="pt-bouton primaire pt-large">
          Continue
        </button>

        <p className="pt-carte-pied">
          Your institution&apos;s own sign-in protects this mailbox, so it protects this portal.
          Student records are never sent by email.
        </p>
      </form>
    </main>
  );
}

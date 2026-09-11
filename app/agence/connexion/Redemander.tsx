'use client';

import { useActionState } from 'react';
import type { EtatLien } from './actions';

export default function Redemander({
  action,
}: {
  action: (precedent: EtatLien, formData: FormData) => Promise<EtatLien>;
}) {
  const [etat, envoyer, enCours] = useActionState<EtatLien, FormData>(action, undefined);

  if (etat?.envoye) {
    return (
      <p className="pt-carte-note">
        A new link is on its way to <strong>{etat.adresse}</strong>. It expires in 10 minutes.
      </p>
    );
  }

  return (
    <form action={envoyer}>
      <label className="pt-champ">
        <span>Work email address</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="name@company.com"
          aria-invalid={Boolean(etat?.erreur)}
        />
      </label>
      {etat?.erreur && <p className="pt-erreur" style={{ marginTop: 10 }}>{etat.erreur}</p>}
      <button
        type="submit"
        className="pt-bouton primaire pt-large"
        disabled={enCours}
        style={{ marginTop: 10 }}
      >
        {enCours ? 'Sending…' : 'Email me a new link'}
      </button>
    </form>
  );
}

'use client';

import { useState, useTransition } from 'react';

type Resultat = { ok?: string; erreur?: string } | undefined;

export default function Envoyer({
  action,
  desactive,
}: {
  action: () => Promise<Resultat>;
  desactive: boolean;
}) {
  const [etat, setEtat] = useState<Resultat>(undefined);
  const [enCours, demarrer] = useTransition();

  return (
    <div>
      <button
        type="button"
        className="bouton"
        disabled={enCours || desactive}
        onClick={() => {
          setEtat(undefined);
          demarrer(async () => setEtat(await action()));
        }}
        style={{ opacity: desactive ? 0.5 : 1 }}
      >
        {enCours ? 'Envoi…' : 'Envoyer le rappel'}
      </button>
      {desactive && (
        <span style={{ marginLeft: 10, fontSize: '0.8rem', color: '#A32020' }}>
          Pas d’adresse : impossible d’envoyer.
        </span>
      )}
      {etat?.ok && (
        <span style={{ marginLeft: 10, fontSize: '0.84rem', color: '#0E7A54' }}>✓ {etat.ok}</span>
      )}
      {etat?.erreur && (
        <span style={{ marginLeft: 10, fontSize: '0.84rem', color: '#A32020' }}>{etat.erreur}</span>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { startRegistration } from '@simplewebauthn/browser';

/* La proposition posée après une première connexion réussie — Google,
   Microsoft ou lien magique, peu importe. Elle ne s'affiche que si
   lib/agence/db/schema.ts ne trouve ni passkey existante ni réponse
   « Plus tard » déjà enregistrée pour ce compte (page.tsx en décide).

   « Plus tard » écrit une date en base et ne demande plus jamais : la règle
   du cahier des charges est explicite là-dessus. */

export default function PropositionPasskey({ onReporter }: { onReporter: () => Promise<void> }) {
  const [etat, setEtat] = useState<'repos' | 'en_cours' | 'erreur'>('repos');
  const [erreur, setErreur] = useState('');
  const router = useRouter();

  async function creer() {
    setEtat('en_cours');
    setErreur('');
    try {
      const options = await fetch('/api/agence-auth/passkey/register-options', {
        method: 'POST',
      }).then((r) => r.json());

      const reponse = await startRegistration({ optionsJSON: options });

      const verif = await fetch('/api/agence-auth/passkey/register-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reponse }),
      }).then((r) => r.json());

      if (!verif.ok) throw new Error(verif.erreur || 'Could not create the passkey.');
      router.refresh();
    } catch (e) {
      if (e instanceof Error && e.name === 'NotAllowedError') {
        setEtat('repos');
        return;
      }
      setEtat('erreur');
      setErreur(e instanceof Error ? e.message : 'Something went wrong.');
    }
  }

  return (
    <section className="pt-prompt-passkey">
      <div>
        <h2>Sign in faster next time</h2>
        <p>Create a passkey to sign in with Face ID, Touch ID, or your device.</p>
        {etat === 'erreur' && <p className="pt-erreur">{erreur}</p>}
      </div>
      <div className="pt-actions">
        <button type="button" className="pt-bouton primaire" onClick={creer} disabled={etat === 'en_cours'}>
          {etat === 'en_cours' ? 'Waiting for your device…' : 'Create a passkey'}
        </button>
        <form action={onReporter}>
          <button type="submit" className="pt-bouton">Later</button>
        </form>
      </div>
    </section>
  );
}

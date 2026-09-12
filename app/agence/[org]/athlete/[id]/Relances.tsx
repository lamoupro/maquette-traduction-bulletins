'use client';

import { useState, useTransition } from 'react';
import type { ResultatRelance } from './actions';

/* Les deux rappels. Ils ne préparent plus un message à envoyer soi-même :
   ils partent.

   L'e-mail s'envoie depuis contact@protranslayte.com, l'adresse d'où
   l'étudiant a déjà reçu ses traductions. Le SMS, lui, n'a pas de passerelle
   ni de numéro en base : le bouton annonce l'envoi et nous fait suivre le
   texte exact à expédier. Le libellé dit donc « will be sent », pas
   « sent » — on n'annonce pas un envoi qu'on n'a pas fait. */

export default function Relances({
  onEmail,
  onSms,
  dejaEnvoye,
}: {
  onEmail: () => Promise<ResultatRelance>;
  onSms: () => Promise<ResultatRelance>;
  dejaEnvoye: boolean;
}) {
  const [etat, setEtat] = useState<ResultatRelance>(undefined);
  const [enCours, demarrer] = useTransition();

  const lancer = (action: () => Promise<ResultatRelance>) => () => {
    setEtat(undefined);
    demarrer(async () => setEtat(await action()));
  };

  return (
    <>
      <div className="pt-relance">
        <button
          type="button"
          className="pt-bouton primaire"
          onClick={lancer(onEmail)}
          disabled={enCours}
        >
          {enCours ? 'Sending…' : dejaEnvoye ? 'Send another email reminder' : 'Send reminder by email'}
        </button>
        <button type="button" className="pt-bouton" onClick={lancer(onSms)} disabled={enCours}>
          Remind by text message
        </button>
      </div>

      {etat?.ok && <p className="pt-confirme" style={{ marginTop: 10 }}>✓ {etat.ok}</p>}
      {etat?.erreur && <p className="pt-erreur" style={{ marginTop: 10 }}>{etat.erreur}</p>}
    </>
  );
}

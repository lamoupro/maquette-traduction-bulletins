'use client';

import { useState, useTransition } from 'react';
import {
  ADRESSE_NCAA,
  messageAuLycee,
  objetPourLaNcaa,
  objetPourLeLycee,
} from '@/lib/ncaa';
import type { ResultatNcaa } from './actions';

/* L'étape NCAA, juste après le paiement.

   Elle est REPLIÉE par défaut, et c'est délibéré : la majorité des clients
   font traduire un diplôme pour un tout autre motif, et leur poser trois
   questions sur un organisme sportif américain les ferait douter d'avoir
   commandé au bon endroit.

   Une fois les informations données, on n'explique pas la démarche : on donne
   le message à transmettre. C'est toute la différence entre « voici comment
   ça marche » et « voici quoi faire ». */

export default function EtapeNcaa({
  sessionId,
  prenomInitial,
  nomInitial,
  onEnregistrer,
}: {
  sessionId: string;
  prenomInitial: string;
  nomInitial: string;
  onEnregistrer: (
    sessionId: string,
    donnees: { id: string; naissance: string; telephone: string },
  ) => Promise<ResultatNcaa>;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [prenom, setPrenom] = useState(prenomInitial);
  const [nom, setNom] = useState(nomInitial);
  const [id, setId] = useState('');
  const [naissance, setNaissance] = useState('');
  const [telephone, setTelephone] = useState('');
  const [etablissement, setEtablissement] = useState('');
  const [emailLycee, setEmailLycee] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [pret, setPret] = useState(false);
  const [copie, setCopie] = useState(false);
  const [enCours, demarrer] = useTransition();

  const eleve = { prenom, nom, ncaa: { id, naissance, telephone, enregistreLe: '' } };
  const corps = pret ? messageAuLycee(eleve, etablissement || undefined) : '';
  const objet = pret ? objetPourLeLycee(eleve) : '';

  function valider() {
    setErreur(null);
    demarrer(async () => {
      const r = await onEnregistrer(sessionId, { id, naissance, telephone });
      if (r?.erreur) setErreur(r.erreur);
      else setPret(true);
    });
  }

  if (!ouvert) {
    return (
      <div className="ncaa-invite">
        <p>
          <strong>Vous candidatez dans une université américaine&nbsp;?</strong> La NCAA exige que
          votre établissement lui envoie lui-même votre dossier. Nous vous préparons le message à
          lui transmettre — il ne vous restera qu’à l’envoyer.
        </p>
        <button type="button" className="ncaa-bouton" onClick={() => setOuvert(true)}>
          Préparer ma démarche NCAA
        </button>
      </div>
    );
  }

  if (pret) {
    return (
      <div className="ncaa-bloc">
        <h2>Ce qu’il vous reste à faire</h2>
        <ol className="ncaa-etapes">
          <li>
            <strong>Attendez nos traductions certifiées</strong> — elles arrivent sous 24 à 48&nbsp;h
            par e-mail.
          </li>
          <li>
            <strong>Transférez-les à votre établissement</strong> avec le message ci-dessous.
          </li>
          <li>
            <strong>Votre établissement envoie le tout à la NCAA.</strong> Vous n’avez rien d’autre
            à faire.
          </li>
        </ol>

        <div className="ncaa-message">
          <p className="ncaa-champ-lab">Objet</p>
          <p className="ncaa-objet">{objet}</p>
          <p className="ncaa-champ-lab">Message</p>
          <pre>{corps}</pre>
        </div>

        <div className="ncaa-actions">
          <button
            type="button"
            className="ncaa-bouton"
            onClick={() => {
              navigator.clipboard.writeText(corps).then(() => {
                setCopie(true);
                setTimeout(() => setCopie(false), 2500);
              });
            }}
          >
            {copie ? '✓ Message copié' : 'Copier le message'}
          </button>
          <a
            className="ncaa-bouton"
            href={`mailto:${encodeURIComponent(emailLycee)}?subject=${encodeURIComponent(objet)}&body=${encodeURIComponent(corps)}`}
          >
            Ouvrir dans ma messagerie
          </a>
          <button type="button" className="ncaa-bouton" onClick={() => window.print()}>
            Imprimer
          </button>
        </div>

        <p className="ncaa-note">
          Votre établissement doit écrire à <strong>{ADRESSE_NCAA}</strong> depuis une adresse
          officielle — la NCAA refuse les envois venant d’une adresse personnelle. L’objet de
          <em> son </em>message doit être&nbsp;: <strong>{objetPourLaNcaa(eleve)}</strong>
        </p>
      </div>
    );
  }

  return (
    <div className="ncaa-bloc">
      <h2>Préparer votre démarche NCAA</h2>
      <p className="ncaa-intro">
        Trois informations, et nous écrivons le message pour votre établissement.
      </p>

      <div className="ncaa-grille">
        <label>
          <span>Prénom</span>
          <input value={prenom} onChange={(e) => setPrenom(e.target.value)} />
        </label>
        <label>
          <span>Nom</span>
          <input value={nom} onChange={(e) => setNom(e.target.value)} />
        </label>
        <label>
          <span>NCAA ID</span>
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            inputMode="numeric"
            placeholder="1234567890"
          />
        </label>
        <label>
          <span>Date de naissance</span>
          <input type="date" value={naissance} onChange={(e) => setNaissance(e.target.value)} />
        </label>
        <label>
          <span>Téléphone</span>
          <input
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            inputMode="tel"
            placeholder="+33 6 12 34 56 78"
          />
        </label>
        <label>
          <span>Votre établissement</span>
          <input
            value={etablissement}
            onChange={(e) => setEtablissement(e.target.value)}
            placeholder="Lycée Frédéric Fays"
          />
        </label>
        <label className="ncaa-large">
          <span>E-mail de l’établissement (si vous l’avez)</span>
          <input
            value={emailLycee}
            onChange={(e) => setEmailLycee(e.target.value)}
            inputMode="email"
            placeholder="secretariat@..."
          />
        </label>
      </div>

      {erreur && <p className="ncaa-erreur">{erreur}</p>}

      <button
        type="button"
        className="ncaa-bouton ncaa-primaire"
        onClick={valider}
        disabled={enCours || !id || !prenom || !nom}
      >
        {enCours ? 'Enregistrement…' : 'Préparer mon message'}
      </button>
      <p className="ncaa-note">
        Le NCAA ID est l’identifiant reçu à votre inscription sur le site de l’Eligibility Center.
        Sans lui, la NCAA ne peut rattacher aucun document à votre dossier.
      </p>
    </div>
  );
}

'use client';

import { useState } from 'react';

/* Une pièce et sa traduction, chacune dépliable sur place.

   Cliquer sur un nom de fichier ne déclenche plus un téléchargement : le
   document s'ouvre DANS sa carte. On regarde d'abord, on enregistre ensuite —
   c'est l'ordre réel du geste, personne ne veut vingt PDF dans son dossier de
   téléchargements pour vérifier qu'un seul est le bon.

   Les deux volets vivant dans une grille à deux colonnes, ouvrir l'original
   et sa traduction les met naturellement côte à côte : la comparaison se fait
   sans rien déplacer. */

export type Volet = {
  nom: string;
  pages: number;
  date: string;
  /** Absente quand la pièce n'appelle pas de traduction, ou n'est pas prête. */
  adresse?: string;
};

function Panneau({
  libelle,
  volet,
  vide,
}: {
  libelle: string;
  volet?: Volet;
  vide?: string;
}) {
  const [ouvert, setOuvert] = useState(false);

  if (!volet?.adresse) {
    return (
      <div className="pt-volet vide">
        <span className="pt-volet-lab">{libelle}</span>
        {vide ?? '—'}
      </div>
    );
  }

  return (
    <div className="pt-volet">
      <span className="pt-volet-lab">{libelle}</span>

      <button type="button" className="pt-fichier" onClick={() => setOuvert((o) => !o)}>
        <span className="pt-chevron" data-ouvert={ouvert} aria-hidden="true">
          ▸
        </span>
        {volet.nom}
      </button>
      <span className="pt-detail">
        {volet.pages} page{volet.pages > 1 ? 's' : ''} · {volet.date}
      </span>

      {ouvert && (
        <div className="pt-visionneuse">
          <div className="pt-visionneuse-barre">
            {/* On CONSULTE une pièce, on ne la prélève pas : la seule sortie du
                portail est le dossier certifié complet. Le fragment d'adresse
                masque aussi la barre du lecteur du navigateur, qui offrait son
                propre bouton d'enregistrement. */}
            <span className="pt-note">Preview only — the full file downloads as one document.</span>
            <button type="button" className="pt-mini" onClick={() => setOuvert(false)}>
              ✕ Close
            </button>
          </div>
          <iframe
            className="pt-cadre"
            src={`${volet.adresse}#toolbar=0&navpanes=0&statusbar=0`}
            title={volet.nom}
          />
        </div>
      )}
    </div>
  );
}

export default function DocumentPaire({
  original,
  traduction,
  videTraduction,
}: {
  original?: Volet;
  traduction?: Volet;
  videTraduction: string;
}) {
  return (
    <div className="pt-paire">
      <Panneau libelle="Original" volet={original} />
      <Panneau libelle="Certified English translation" volet={traduction} vide={videTraduction} />
    </div>
  );
}

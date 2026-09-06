'use client';

import { useState } from 'react';

/* Le téléchargement du dossier certifié, et l'avertissement qui le précède.

   Un dossier complet part directement — rien à demander.

   Un dossier incomplet ouvre d'abord une boîte qui NOMME ce qui manque. Sans
   elle, l'établissement repart avec un document qui ressemble à un dossier
   fini, et l'erreur ne se voit qu'au moment où elle coûte cher. La page de
   garde du PDF le répète, mais on ne compte pas sur le fait qu'elle sera lue.

   « Notify me » n'attend pas encore : il faudra la base de données pour
   enregistrer la demande et l'e-mail. Le bouton montre l'intention. */

export default function Recuperer({
  id,
  manquantes,
  certifiees,
}: {
  id: string;
  manquantes: string[];
  /** Nombre de pièces réellement traduites : sans elles, rien à certifier. */
  certifiees: number;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [prevenu, setPrevenu] = useState(false);
  const adresse = `/portal/dossier?c=${encodeURIComponent(id)}`;
  const incomplet = manquantes.length > 0;

  return (
    <>
      <div className="pt-recuperer-boutons">
        {certifiees === 0 ? (
          <span className="pt-attente">
            No certified records yet — the file becomes available as soon as the first translation
            is delivered.
          </span>
        ) : incomplet ? (
          <button type="button" className="pt-bouton primaire" onClick={() => setOuvert(true)}>
            ↓ Download certified file
          </button>
        ) : (
          <a className="pt-bouton primaire" href={adresse}>
            ↓ Download certified file
          </a>
        )}
      </div>

      {ouvert && (
        <div
          className="pt-voile"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pt-avert"
          onClick={(e) => e.target === e.currentTarget && setOuvert(false)}
        >
          <div className="pt-boite">
            <h3 id="pt-avert">This file is not complete</h3>
            <p>
              {manquantes.length} record{manquantes.length > 1 ? 's have' : ' has'} not been
              received yet. You can still download what is available — the cover page of the
              document will state what is missing.
            </p>
            <ul className="pt-manque-liste">
              {manquantes.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>

            {prevenu ? (
              <p className="pt-confirme">
                ✓ We will email you as soon as the file is complete.
              </p>
            ) : null}

            <div className="pt-boite-actions">
              <a className="pt-bouton primaire" href={adresse} onClick={() => setOuvert(false)}>
                Download now
              </a>
              <button
                type="button"
                className="pt-bouton"
                onClick={() => setPrevenu(true)}
                disabled={prevenu}
              >
                Notify me when complete
              </button>
              <button type="button" className="pt-bouton" onClick={() => setOuvert(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

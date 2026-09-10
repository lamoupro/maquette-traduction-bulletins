'use client';

import { useState } from 'react';

/* Le téléchargement des dossiers certifiés, et l'avertissement qui le précède.

   UN BOUTON PAR LIVRAISON. Un étudiant qui a commandé en deux fois a reçu deux
   envois certifiés, chacun avec son certificat et sa date, et le portail les
   présente tels quels. Les refondre en un seul PDF sous un certificat neuf
   daterait l'attestation d'un jour où le travail n'a pas eu lieu.

   Un dossier complet part directement — rien à demander.

   Un dossier incomplet ouvre d'abord une boîte qui NOMME ce qui manque. Sans
   elle, le destinataire repart avec un document qui ressemble à un dossier
   fini, et l'erreur ne se voit qu'au moment où elle coûte cher.

   C'est le SEUL endroit où le manque est dit. Le PDF ne le répète pas, et ne
   doit pas le répéter : un certificat atteste l'exactitude d'une traduction,
   il n'a pas à porter de jugement sur l'état du dossier de l'étudiant.

   « Notify me » n'attend pas encore : il faudra la base de données pour
   enregistrer la demande et l'e-mail. Le bouton montre l'intention. */

export type Envoi = {
  cle: string;
  couverture: string;
  livreLe: string;
  commandes: string[];
  /** Pièces réellement certifiées dans cette livraison. Zéro : rien à sortir. */
  certifiees: number;
};

export default function Recuperer({
  id,
  manquantes,
  livraisons,
  rienATraduire,
  vue,
  base = '/portal/dossier',
}: {
  id: string;
  manquantes: string[];
  livraisons: Envoi[];
  /* Vrai quand AUCUNE pièce n'appelle de traduction — un dossier kényan, par
     exemple, dont les relevés sont délivrés en anglais. Sans cette
     distinction, l'écran promettait un document « dès la première traduction
     livrée » alors qu'il n'y en aura jamais. */
  rienATraduire: boolean;
  /** Suffixe de rôle transmis à la route : elle revérifie le périmètre. */
  vue: string;
  /* La route qui sert le dossier. Deux portails s'en servent — la
     démonstration sous /portal, le portail réel d'un client sous son propre
     sous-domaine — et ils ne gardent pas leur porte de la même façon. Le
     composant, lui, n'a pas à le savoir. */
  base?: string;
}) {
  /* La boîte d'avertissement retient la livraison demandée : on n'ouvre pas un
     dialogue générique pour se retrouver ensuite à télécharger le mauvais. */
  const [demande, setDemande] = useState<Envoi | null>(null);
  const [prevenu, setPrevenu] = useState(false);

  const adresse = (e: Envoi) =>
    `${base}?c=${encodeURIComponent(id)}&livraison=${encodeURIComponent(e.cle)}${vue}`;

  const sortables = livraisons.filter((e) => e.certifiees > 0);
  const incomplet = manquantes.length > 0;

  if (sortables.length === 0) {
    return (
      <div className="pt-recuperer-boutons">
        <span className="pt-attente">
          {rienATraduire
            ? 'Nothing to certify — every record here was issued in English. They are on file, and cost nothing to translate.'
            : 'No certified records yet — the file becomes available as soon as the first translation is delivered.'}
        </span>
      </div>
    );
  }

  /* Une seule livraison : un bouton, et rien à expliquer. C'est le cas
     ordinaire, et il ne doit pas payer la complexité de l'autre. */
  const seul = sortables.length === 1;

  return (
    <>
      <div className={seul ? 'pt-recuperer-boutons' : 'pt-envois'}>
        {sortables.map((e) => {
          const bouton = incomplet ? (
            <button type="button" className="pt-bouton primaire" onClick={() => setDemande(e)}>
              ↓ Download{seul ? ' certified file' : ''}
            </button>
          ) : (
            <a className="pt-bouton primaire" href={adresse(e)}>
              ↓ Download{seul ? ' certified file' : ''}
            </a>
          );

          if (seul) return <span key={e.cle}>{bouton}</span>;

          return (
            <div className="pt-envoi" key={e.cle}>
              <div>
                <span className="pt-envoi-titre">{e.couverture}</span>
                <span className="pt-envoi-meta">
                  {e.certifiees} record{e.certifiees > 1 ? 's' : ''} · certified{' '}
                  {e.livreLe} · <span className="pt-mono">{e.commandes.join(' · ')}</span>
                </span>
              </div>
              {bouton}
            </div>
          );
        })}
      </div>

      {demande && (
        <div
          className="pt-voile"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pt-avert"
          onClick={(ev) => ev.target === ev.currentTarget && setDemande(null)}
        >
          <div className="pt-boite">
            <h3 id="pt-avert">This file is not complete</h3>
            <p>
              {manquantes.length} record{manquantes.length > 1 ? 's have' : ' has'} not been
              received yet. You can still download what has been certified so far — but the
              document itself will not mention the gap, so check this list before you send it on.
            </p>
            <ul className="pt-manque-liste">
              {manquantes.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>

            {prevenu ? (
              <p className="pt-confirme">✓ We will email you as soon as the file is complete.</p>
            ) : null}

            <div className="pt-boite-actions">
              <a
                className="pt-bouton primaire"
                href={adresse(demande)}
                onClick={() => setDemande(null)}
              >
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
              <button type="button" className="pt-bouton" onClick={() => setDemande(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

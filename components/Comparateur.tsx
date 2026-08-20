'use client';

import { useRef, useState } from 'react';

/* Comparateur avant / après, à deux documents (diplôme et bulletin).

   Découpe par conteneur à largeur variable plutôt que par clip-path :
   Safari iOS ne repeint pas clip-path de façon fiable pendant le défilement,
   le document débordait alors sur la section suivante.

   Chaque étiquette vit DANS la couche du document qu'elle désigne, sans
   z-index, pour être recouverte progressivement au passage du curseur.

   Poids : seul le document actif est monté. Les images de l'autre onglet ne
   sont téléchargées qu'au survol ou au focus de son bouton, donc jamais au
   premier rendu. Le coût initial de la page est identique à la version à un
   seul document. */

type Document = {
  cle: 'diplome' | 'bulletin';
  onglet: string;
  titre: string;
  /* aspect-ratio du cadre : le diplôme est en A4 paysage, le bulletin en
     A4 portrait. Le cadre suit la forme réelle du document affiché. */
  ratio: string;
  fr: string;
  en: string;
  largeur: number;
  hauteur: number;
  altFr: string;
  altEn: string;
  legende: React.ReactNode;
};

const DOCUMENTS: Document[] = [
  {
    cle: 'diplome',
    onglet: 'Diplôme',
    titre: 'Voici à quoi ressemblera votre diplôme',
    ratio: '1400 / 991',
    fr: '/diplome_fr.webp',
    en: '/diplome_en.webp',
    largeur: 1400,
    hauteur: 991,
    altFr: 'Diplôme du baccalauréat original en français',
    altEn: 'Diplôme du baccalauréat traduit en anglais par un traducteur assermenté',
    legende: (
      <>
        Traduction réelle — <b>cadre, tampon et filigrane conservés</b>, mise en page fidèle à
        l&apos;original. Les données personnelles ont été masquées pour cet exemple.
      </>
    ),
  },
  {
    cle: 'bulletin',
    onglet: 'Bulletin de notes',
    titre: 'Voici à quoi ressemblera votre bulletin',
    ratio: '1000 / 1417',
    fr: '/slider_fr.jpg',
    en: '/slider_en.jpg',
    largeur: 536,
    hauteur: 760,
    altFr: 'Bulletin de notes original en français',
    altEn: 'Bulletin de notes traduit en anglais par un traducteur assermenté',
    legende: (
      <>
        Traduction réelle — <b>mêmes notes, mêmes appréciations</b>, mise en page fidèle à
        l&apos;original. Les données personnelles ont été masquées pour cet exemple.
      </>
    ),
  },
];

export default function Comparateur() {
  const refCadre = useRef<HTMLDivElement>(null);
  const refPoignee = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState(50);
  const [actif, setActif] = useState(0);
  const glisse = useRef(false);
  const prechargees = useRef(new Set<string>());

  const doc = DOCUMENTS[actif];

  const depuisX = (clientX: number) => {
    const cadre = refCadre.current;
    if (!cadre) return 50;
    const r = cadre.getBoundingClientRect();
    return Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100));
  };

  /* Téléchargement anticipé au premier signe d'intérêt : le basculement
     d'onglet est alors instantané, sans rien coûter à ceux qui ne cliquent pas. */
  const precharger = (i: number) => {
    const d = DOCUMENTS[i];
    if (prechargees.current.has(d.cle)) return;
    prechargees.current.add(d.cle);
    [d.fr, d.en].forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  };

  return (
    <div className="compare-card">
      <div className="compare-tabs" role="tablist" aria-label="Type de document">
        {DOCUMENTS.map((d, i) => (
          <button
            key={d.cle}
            type="button"
            role="tab"
            id={`onglet-${d.cle}`}
            aria-selected={i === actif}
            aria-controls={`panneau-${d.cle}`}
            tabIndex={i === actif ? 0 : -1}
            className={i === actif ? 'compare-tab actif' : 'compare-tab'}
            onPointerEnter={() => precharger(i)}
            onFocus={() => precharger(i)}
            onClick={() => setActif(i)}
            onKeyDown={(e) => {
              if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
              const suivant = (i + (e.key === 'ArrowRight' ? 1 : -1) + DOCUMENTS.length) % DOCUMENTS.length;
              setActif(suivant);
              document.getElementById(`onglet-${DOCUMENTS[suivant].cle}`)?.focus();
              e.preventDefault();
            }}
          >
            {d.onglet}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`panneau-${doc.cle}`}
        aria-labelledby={`onglet-${doc.cle}`}
        className="compare-panneau"
      >
        <div className="compare-head">
          <h3>{doc.titre}</h3>
          <span>GLISSER POUR COMPARER</span>
        </div>

        <div
          className="compare"
          ref={refCadre}
          style={{ ['--pos' as string]: `${pos}%`, ['--ratio' as string]: doc.ratio }}
          onPointerDown={(e) => {
            // Clic direct uniquement à la souris, pour ne jamais intercepter
            // le défilement tactile de la page.
            const poignee = refPoignee.current;
            if (
              e.pointerType === 'mouse' &&
              poignee &&
              e.target !== poignee &&
              !poignee.contains(e.target as Node)
            ) {
              setPos(depuisX(e.clientX));
            }
          }}
          onPointerMove={(e) => {
            if (glisse.current) setPos(depuisX(e.clientX));
          }}
          onPointerUp={() => {
            glisse.current = false;
          }}
        >
          <div className="doc-base-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="doc-base"
              key={`${doc.cle}-en`}
              src={doc.en}
              width={doc.largeur}
              height={doc.hauteur}
              alt={doc.altEn}
            />
            <span className="doc-tag en">Traduction assermentée</span>
          </div>

          <div className="doc-clip">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={`${doc.cle}-fr`}
              src={doc.fr}
              width={doc.largeur}
              height={doc.hauteur}
              alt={doc.altFr}
              fetchPriority={actif === 0 ? 'high' : 'auto'}
            />
            <span className="doc-tag fr">Original FR</span>
          </div>

          <div className="handle">
            <button
              className="grip"
              type="button"
              ref={refPoignee}
              role="slider"
              aria-label="Comparer l'original et la traduction"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(pos)}
              onPointerDown={(e) => {
                glisse.current = true;
                (e.target as HTMLElement).setPointerCapture(e.pointerId);
                e.preventDefault();
              }}
              onPointerMove={(e) => {
                if (glisse.current) setPos(depuisX(e.clientX));
              }}
              onPointerUp={() => {
                glisse.current = false;
              }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowLeft') {
                  setPos((p) => Math.max(0, p - 4));
                  e.preventDefault();
                }
                if (e.key === 'ArrowRight') {
                  setPos((p) => Math.min(100, p + 4));
                  e.preventDefault();
                }
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M8 7 4 12l4 5M16 7l4 5-4 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <p className="compare-caption">{doc.legende}</p>
      </div>
    </div>
  );
}

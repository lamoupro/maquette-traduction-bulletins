'use client';

import { useRef, useState } from 'react';

/* Comparateur avant / après.

   Découpe par conteneur à largeur variable plutôt que par clip-path :
   Safari iOS ne repeint pas clip-path de façon fiable pendant le défilement,
   le document débordait alors sur la section suivante.

   Chaque étiquette vit DANS la couche du document qu'elle désigne, sans
   z-index, pour être recouverte progressivement au passage du curseur. */
export default function Comparateur() {
  const refCadre = useRef<HTMLDivElement>(null);
  const refPoignee = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState(50);
  const glisse = useRef(false);

  const depuisX = (clientX: number) => {
    const cadre = refCadre.current;
    if (!cadre) return 50;
    const r = cadre.getBoundingClientRect();
    return Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100));
  };

  return (
    <div className="compare-card">
      <div className="compare-head">
        <h3>Voici à quoi ressemblera votre bulletin</h3>
        <span>GLISSER POUR COMPARER</span>
      </div>

      <div
        className="compare"
        ref={refCadre}
        style={{ ['--pos' as string]: `${pos}%` }}
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
            src="/slider_en.jpg"
            width={1000}
            height={1417}
            alt="Bulletin traduit en anglais par un traducteur assermenté"
          />
          <span className="doc-tag en">Traduction assermentée</span>
        </div>

        <div className="doc-clip">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/slider_fr.jpg"
            width={1000}
            height={1417}
            alt="Bulletin de notes original en français"
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

      <p className="compare-caption">
        Traduction réelle — <b>mêmes notes, mêmes appréciations</b>, mise en page fidèle à
        l&apos;original. Les données personnelles ont été masquées pour cet exemple.
      </p>
    </div>
  );
}

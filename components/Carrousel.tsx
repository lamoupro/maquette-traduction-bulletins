'use client';

import { useEffect, useRef } from 'react';

/* Bandeau défilant : avance lente automatique, contrôle manuel au doigt,
   au trackpad, à la souris et au clavier.

   Trois copies de la série sont posées côte à côte et la position est
   maintenue dans celle du milieu : il reste toujours une série entière de
   marge de chaque côté, donc on peut remonter en arrière indéfiniment. */
export default function Carrousel({
  parCopie,
  vitesse = 24,
  reprise = 5000,
  arretDefinitif = false,
  className = '',
  ariaLabel,
  children,
}: {
  parCopie: number;
  vitesse?: number;
  reprise?: number;
  /** Sur les avis : la première interaction coupe l'avance pour de bon. */
  arretDefinitif?: boolean;
  className?: string;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  const refScroller = useRef<HTMLDivElement>(null);
  const refPiste = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroller = refScroller.current;
    const piste = refPiste.current;
    if (!scroller || !piste) return;

    let periode = 0;
    let auto = true;
    let attendu = 0;
    let glisse = false;
    let departX = 0;
    let departScroll = 0;
    let minuteur: ReturnType<typeof setTimeout> | undefined;
    let finDeScroll: ReturnType<typeof setTimeout> | undefined;
    let image = 0;

    /* Position maintenue en décimal côté JavaScript. Indispensable : à 24 px/s
       une image n'avance que de 0,4 px, or Safari iOS arrondit scrollLeft à
       l'entier. Un « scrollLeft += 0,4 » relirait la valeur arrondie et
       l'incrément serait perdu à chaque image — le bandeau resterait figé. */
    let position = 0;

    const resynchroniser = () => {
      position = scroller.scrollLeft;
      attendu = scroller.scrollLeft;
    };

    /* La période se mesure entre le premier élément d'une copie et celui de la
       copie suivante. La déduire de scrollWidth / 3 serait faux : l'espacement
       qui sépare deux copies s'ajoute à la largeur des éléments, et l'écart
       produisait un sursaut visible à chaque tour. */
    const mesurer = () => {
      const enfants = piste.children;
      periode =
        enfants.length > parCopie
          ? (enfants[parCopie] as HTMLElement).offsetLeft -
            (enfants[0] as HTMLElement).offsetLeft
          : 0;
      if (periode > 0) {
        const p = scroller.scrollLeft;
        // On se replace dans la copie du milieu en conservant l'avancement
        // relatif. Les copies étant identiques, le déplacement est invisible.
        scroller.scrollLeft = periode + (((p % periode) + periode) % periode);
      }
      resynchroniser();
    };

    const reboucler = () => {
      if (periode <= 0) return;
      if (scroller.scrollLeft >= periode * 2) scroller.scrollLeft -= periode;
      else if (scroller.scrollLeft < periode * 0.5) scroller.scrollLeft += periode;
      else return;
      resynchroniser();
    };

    const suspendre = () => {
      auto = false;
      clearTimeout(minuteur);
      if (arretDefinitif) return;
      minuteur = setTimeout(() => {
        auto = true;
      }, reprise);
    };

    const surPointerDown = (e: PointerEvent) => {
      suspendre();
      if ((e.target as HTMLElement).closest('button')) return;
      if (e.pointerType !== 'mouse') return; // le tactile est géré nativement
      glisse = true;
      departX = e.clientX;
      departScroll = scroller.scrollLeft;
      scroller.setPointerCapture(e.pointerId);
      scroller.classList.add('is-dragging');
      e.preventDefault();
    };

    const surPointerMove = (e: PointerEvent) => {
      if (!glisse) return;
      scroller.scrollLeft = departScroll - (e.clientX - departX);
      resynchroniser();
      reboucler();
    };

    const surFinPointer = () => {
      if (glisse) {
        glisse = false;
        scroller.classList.remove('is-dragging');
      }
      suspendre();
    };

    /* Le rebouclage attend l'arrêt complet du défilement : le faire pendant
       l'inertie couperait l'élan sur iOS. */
    const surScroll = () => {
      if (Math.abs(scroller.scrollLeft - attendu) > 2) {
        suspendre();
        resynchroniser();
      } else {
        attendu = scroller.scrollLeft;
      }
      clearTimeout(finDeScroll);
      finDeScroll = setTimeout(() => {
        if (glisse) return;
        resynchroniser();
        reboucler();
      }, 140);
    };

    const surClavier = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      suspendre();
      scroller.scrollLeft += (e.key === 'ArrowRight' ? 1 : -1) * 340;
      resynchroniser();
      reboucler();
      e.preventDefault();
    };

    scroller.addEventListener('pointerdown', surPointerDown);
    scroller.addEventListener('pointermove', surPointerMove);
    scroller.addEventListener('pointerup', surFinPointer);
    scroller.addEventListener('pointercancel', surFinPointer);
    scroller.addEventListener('pointerleave', surFinPointer);
    scroller.addEventListener('wheel', suspendre, { passive: true });
    scroller.addEventListener('scroll', surScroll, { passive: true });
    scroller.addEventListener('keydown', surClavier);
    window.addEventListener('resize', mesurer);
    window.addEventListener('load', mesurer);

    const reduit = window.matchMedia('(prefers-reduced-motion: reduce)');
    let precedent = 0;
    const tick = (ts: number) => {
      if (!precedent) precedent = ts;
      // Écart borné à 50 ms : après un retour d'onglet, reprise en douceur.
      const ecoule = Math.min((ts - precedent) / 1000, 0.05);
      precedent = ts;
      if (auto && !glisse && !reduit.matches && periode > 0) {
        position += vitesse * ecoule;
        scroller.scrollLeft = position;
        attendu = scroller.scrollLeft;
        reboucler();
      }
      image = requestAnimationFrame(tick);
    };

    mesurer();
    image = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(image);
      clearTimeout(minuteur);
      clearTimeout(finDeScroll);
      scroller.removeEventListener('pointerdown', surPointerDown);
      scroller.removeEventListener('pointermove', surPointerMove);
      scroller.removeEventListener('pointerup', surFinPointer);
      scroller.removeEventListener('pointercancel', surFinPointer);
      scroller.removeEventListener('pointerleave', surFinPointer);
      scroller.removeEventListener('wheel', suspendre);
      scroller.removeEventListener('scroll', surScroll);
      scroller.removeEventListener('keydown', surClavier);
      window.removeEventListener('resize', mesurer);
      window.removeEventListener('load', mesurer);
    };
  }, [parCopie, vitesse, reprise, arretDefinitif]);

  return (
    <div className="hscroll" ref={refScroller} tabIndex={0} role="region" aria-label={ariaLabel}>
      <div className={`hscroll-track ${className}`} ref={refPiste}>
        {children}
      </div>
    </div>
  );
}

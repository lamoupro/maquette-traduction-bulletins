'use client';

import { useEffect, useRef, useState } from 'react';
import { ACHETEURS, COMMANDES, PAYS, TARIFS } from '@/lib/data';

/* NOTIFICATION D'ACHAT — CONTENU DE DÉMONSTRATION.
   Les acheteurs sont fictifs. À brancher sur les vraies commandes avant toute
   mise en ligne commerciale : annoncer des achats qui n'ont pas eu lieu est
   une pratique commerciale trompeuse. */

const CLE_REFUS = 'protranslayte:achats-refuses';
const PREMIER = 8000;
const INTERVALLE = 30000;
const DUREE = 6500;

const SYMBOLE: Record<string, string> = {
  EUR: '€', CHF: 'CHF', GBP: '£', CAD: '$ CA',
  MAD: 'MAD', DZD: 'DA', TND: 'DT', XOF: 'FCFA', AED: 'AED',
};

type Notif = { nom: string; initiale: string; ligne: string; quand: string };

function tirage(index: number): Notif {
  const [nomBrut, , pays] = ACHETEURS[index % ACHETEURS.length].split('|');
  // La casse est volontairement irrégulière : de vrais inscrits saisissent
  // leur nom en majuscules, en minuscules ou mélangé.
  const nom = index % 7 === 0 ? nomBrut.toUpperCase() : index % 11 === 0 ? nomBrut.toLowerCase() : nomBrut;

  const pond: [number, string, number][] = [];
  COMMANDES.forEach((c) => {
    for (let i = 0; i < c[2]; i++) pond.push(c);
  });
  const cmd = pond[Math.floor(Math.random() * pond.length)];

  const [devise, unite] = TARIFS[pays] ?? TARIFS.FR;
  const montant = `${(cmd[0] * unite).toLocaleString('fr-FR')} ${SYMBOLE[devise] ?? devise}`;

  const m = 2 + Math.floor(Math.random() * 180);
  const h = Math.round(m / 60);
  const quand = m < 60 ? `il y a ${m} min` : `il y a ${h} heure${h > 1 ? 's' : ''}`;

  return { nom, initiale: nomBrut.charAt(0).toUpperCase(), ligne: `${cmd[0]} documents · ${montant}`, quand };
}

export default function NotificationAchat() {
  const [notif, setNotif] = useState<Notif | null>(null);
  const [visible, setVisible] = useState(false);
  const refBoite = useRef<HTMLDivElement>(null);
  const refusRef = useRef(0);

  useEffect(() => {
    try {
      refusRef.current = parseInt(localStorage.getItem(CLE_REFUS) || '0', 10);
    } catch {
      refusRef.current = 0;
    }
    // Deux refus : le visiteur a clairement signifié qu'il n'en veut pas.
    if (refusRef.current >= 2) return;

    let curseur = Math.floor(Math.random() * ACHETEURS.length);
    let masque: ReturnType<typeof setTimeout>;
    let suivant: ReturnType<typeof setTimeout>;
    let arrete = false;

    // Suspendu pendant que le visiteur remplit sa commande : il est déjà en
    // train de convertir, une notification ne ferait que le distraire.
    const enCommande = () => {
      const carte = document.getElementById('dossier');
      return !!carte && carte.contains(document.activeElement);
    };

    const afficher = () => {
      if (arrete) return;
      if (enCommande()) {
        suivant = setTimeout(afficher, INTERVALLE);
        return;
      }
      setNotif(tirage(curseur++));
      setVisible(true);
      masque = setTimeout(() => setVisible(false), DUREE);
      suivant = setTimeout(afficher, INTERVALLE);
    };

    suivant = setTimeout(afficher, PREMIER);
    return () => {
      arrete = true;
      clearTimeout(masque);
      clearTimeout(suivant);
    };
  }, []);

  const refuser = () => {
    refusRef.current += 1;
    try {
      localStorage.setItem(CLE_REFUS, String(refusRef.current));
    } catch {
      /* sans stockage, le refus ne vaut que pour cette page */
    }
    setVisible(false);
  };

  // Les hooks doivent être appelés inconditionnellement : le geste de balayage
  // est donc initialisé avant tout retour anticipé.
  const depart = useBalayage(refBoite, refuser);

  if (!notif) return null;

  return (
    <div
      className={`buy-toast${visible ? ' is-visible' : ''}`}
      ref={refBoite}
      onPointerDown={depart.down}
      onPointerMove={depart.move}
      onPointerUp={depart.up}
      onPointerCancel={depart.up}
    >
      <span className="bt-av" aria-hidden="true">
        {notif.initiale}
      </span>
      <div className="bt-body">
        <div className="bt-l1">
          <span className="bt-nom">{notif.nom}</span>
          <span className="bt-quand">{notif.quand}</span>
        </div>
        <div className="bt-cmd">{notif.ligne}</div>
      </div>
      <button className="bt-x" type="button" aria-label="Masquer cette notification" onClick={refuser}>
        ×
      </button>
    </div>
  );
}

/* Balayage vers la gauche pour écarter. Le geste vertical reste libre pour
   que la page continue de défiler normalement. */
function useBalayage(ref: React.RefObject<HTMLDivElement | null>, refuser: () => void) {
  const etat = useRef({ x: 0, y: 0, actif: false, axe: '' as '' | 'x' | 'y' });

  return {
    down(e: React.PointerEvent) {
      if ((e.target as HTMLElement).closest('button')) return;
      etat.current = { x: e.clientX, y: e.clientY, actif: true, axe: '' };
      ref.current?.classList.add('is-dragging');
    },
    move(e: React.PointerEvent) {
      const s = etat.current;
      if (!s.actif || !ref.current) return;
      const dx = e.clientX - s.x;
      const dy = e.clientY - s.y;
      if (!s.axe && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
        s.axe = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      }
      if (s.axe !== 'x') return;
      ref.current.style.transform = `translateX(${Math.min(0, dx)}px)`;
      ref.current.style.opacity = String(Math.max(0, 1 + dx / 200));
    },
    up(e: React.PointerEvent) {
      const s = etat.current;
      if (!s.actif || !ref.current) return;
      s.actif = false;
      ref.current.classList.remove('is-dragging');
      ref.current.style.opacity = '';
      ref.current.style.transform = '';
      if (s.axe === 'x' && e.clientX - s.x < -60) refuser();
    },
  };
}

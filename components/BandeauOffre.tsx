'use client';

import { useEffect, useState } from 'react';
import { FIN_OFFRE } from '@/lib/data';

/* 35 € est le tarif réellement pratiqué auparavant : le prix barré est donc un
   prix de référence légitime au sens de la directive Omnibus. Le compte à
   rebours vise une fin réelle et ne se réinitialise pas. */
export default function BandeauOffre() {
  const [reste, setReste] = useState<string | null>(null);
  const [ferme, setFerme] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem('protranslayte:promo-fermee') === '1') {
        setFerme(true);
        return;
      }
    } catch {
      /* stockage indisponible : on affiche quand même */
    }

    const tic = () => {
      const ms = FIN_OFFRE.getTime() - Date.now();
      if (ms <= 0) {
        setReste(null);
        return;
      }
      const s = Math.floor(ms / 1000);
      const j = Math.floor(s / 86400);
      const d2 = (n: number) => String(n).padStart(2, '0');
      setReste(
        `${j > 0 ? `${j}j ` : ''}${d2(Math.floor((s % 86400) / 3600))}:${d2(
          Math.floor((s % 3600) / 60),
        )}:${d2(s % 60)}`,
      );
    };

    tic();
    const id = setInterval(tic, 1000);
    return () => clearInterval(id);
  }, []);

  if (ferme || reste === null) return null;

  return (
    <div className="promo-bar">
      <div className="wrap">
        <span>
          <strong>Offre d&apos;août</strong> — <s>35 €</s> <strong>25 €</strong> le document
        </span>
        <span className="pb-timer">{reste}</span>
      </div>
      <button
        className="pb-x"
        type="button"
        aria-label="Masquer cette annonce"
        onClick={() => {
          setFerme(true);
          try {
            sessionStorage.setItem('protranslayte:promo-fermee', '1');
          } catch {
            /* sans stockage, la fermeture ne vaut que pour cette page */
          }
        }}
      >
        ×
      </button>
    </div>
  );
}

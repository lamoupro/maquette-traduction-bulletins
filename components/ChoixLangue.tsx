'use client';

import { useRouter } from 'next/navigation';
import { COOKIE_LANGUE, LANGUE_JOURS, LANGUES, NOMS, chemin, type Langue } from '@/lib/langues';

/* Le sélecteur de langue.

   Il existe parce que la détection se trompe : réseaux d'entreprise, VPN,
   téléphone acheté à l'étranger, navigateur réglé en anglais par quelqu'un qui
   lit le portugais. Sans échappatoire visible, ces gens-là sont bloqués sur
   une page qu'ils n'ont pas demandée.

   Le choix est écrit dans un cookie d'un an et l'emporte ensuite sur toute
   détection : c'est une préférence, pas une session. */

export default function ChoixLangue({
  actuelle,
  libelle,
}: {
  actuelle: Langue;
  libelle: string;
}) {
  const router = useRouter();

  return (
    <label className="choix-langue">
      <span className="visuellement-cache">{libelle}</span>
      <select
        value={actuelle}
        onChange={(e) => {
          const langue = e.target.value as Langue;
          document.cookie = `${COOKIE_LANGUE}=${langue}; path=/; max-age=${LANGUE_JOURS * 86400}; samesite=lax`;
          router.push(chemin(langue));
        }}
      >
        {LANGUES.map((l) => (
          <option key={l} value={l}>
            {NOMS[l]}
          </option>
        ))}
      </select>
    </label>
  );
}

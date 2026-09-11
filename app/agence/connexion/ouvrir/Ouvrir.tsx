'use client';

import { useState } from 'react';

/* Le bouton qui échange enfin le jeton.

   La navigation se fait en JavaScript, sur un clic, PAS par une balise <a> :
   un aspirateur de liens suit les ancres d'une page qu'il vient de charger, il
   ne déclenche pas de gestionnaire de clic. C'est cette différence-là qui
   protège le jeton — voir la note dans la page parente.

   Le repli <noscript> reste un lien ordinaire : sans JavaScript, il n'y a pas
   d'autre moyen d'avancer, et une page sans issue serait pire que le risque
   qu'il fait courir. */

export default function Ouvrir({ cible }: { cible: string }) {
  const [parti, setParti] = useState(false);

  return (
    <>
      <button
        type="button"
        className="pt-bouton primaire pt-large"
        disabled={parti}
        onClick={() => {
          setParti(true);
          window.location.href = cible;
        }}
      >
        {parti ? 'Signing you in…' : 'Sign in'}
      </button>
      <noscript>
        <p style={{ marginTop: 12 }}>
          <a href={cible}>Continue to sign in</a>
        </p>
      </noscript>
    </>
  );
}

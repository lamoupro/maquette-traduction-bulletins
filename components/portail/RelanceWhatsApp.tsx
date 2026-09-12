'use client';

import { useRef } from 'react';

/* Relance WhatsApp, sans passer par la page d'accueil de WhatsApp.

   `wa.me` est une page web : elle propose de TÉLÉCHARGER l'application avant
   de proposer de l'ouvrir, même quand elle est déjà installée. On s'adresse
   donc directement à l'application, par son schéma `whatsapp://`.

   Le navigateur demandera quand même « Ouvrir WhatsApp ? ». C'est sa sécurité,
   aucune page ne peut lancer une application sans accord — et c'est très bien
   ainsi.

   Le NUMÉRO ouvre la conversation directement. Sans lui, WhatsApp affiche son
   sélecteur de contact : c'est sa règle, il n'existe aucun moyen de désigner
   un destinataire autrement. Le produit réel prendra le téléphone de
   l'étudiant, collecté au dépôt ; la démonstration prend celui de
   DEMO_TELEPHONE, défini dans .env.local — jamais écrit dans le dépôt, qui
   est public.

   Repli : si rien ne se passe au bout d'une seconde et demie — application
   absente, schéma refusé — on bascule sur WhatsApp Web, avec le même message
   et sans passer par la page de téléchargement.

   IMPORTANT : le repli s'annule sur `blur`, jamais sur `document.hidden`.
   Certains contextes se déclarent masqués tout en étant visibles (le panneau
   de prévisualisation intégré, notamment), et une garde sur `hidden` a déjà
   cassé trois fonctionnalités de ce projet. La perte du focus, elle, est
   fiable : elle survient exactement quand l'application prend la main. */

const REPLI_MS = 1500;

export default function RelanceWhatsApp({
  texte,
  telephone,
  enfants,
  avant,
}: {
  texte: string;
  /** Chiffres uniquement, indicatif compris, sans « + » ni espaces. */
  telephone?: string;
  enfants: React.ReactNode;
  /* Appelé juste avant d'ouvrir WhatsApp — le portail réel s'en sert pour
     noter qu'une relance est partie. On n'attend pas sa réponse : le clic
     doit ouvrir l'application tout de suite, sinon iOS le traite comme une
     fenêtre non sollicitée et la bloque. */
  avant?: () => void;
}) {
  const minuteur = useRef<ReturnType<typeof setTimeout> | null>(null);
  const encode = encodeURIComponent(texte);
  const numero = telephone ? `phone=${telephone}&` : '';

  function tenter() {
    avant?.();
    const annuler = () => {
      if (minuteur.current) clearTimeout(minuteur.current);
      minuteur.current = null;
    };
    window.addEventListener('blur', annuler, { once: true });
    window.addEventListener('pagehide', annuler, { once: true });

    minuteur.current = setTimeout(() => {
      /* Navigation dans l'onglet courant plutôt qu'une fenêtre : un
         `window.open` différé sort du geste de l'utilisateur et se fait
         bloquer comme une fenêtre surgissante. */
      window.location.href = `https://web.whatsapp.com/send?${numero}text=${encode}`;
    }, REPLI_MS);
  }

  return (
    <a className="pt-bouton" href={`whatsapp://send?${numero}text=${encode}`} onClick={tenter}>
      {enfants}
    </a>
  );
}

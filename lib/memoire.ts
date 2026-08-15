'use client';

/* Mémoire du formulaire, sur l'appareil du visiteur.

   Motif : un client qui quitte le navigateur pour aller chercher sa carte
   dans son application bancaire revient sur une page vierge et abandonne.
   C'est le scénario le plus courant du paiement sur mobile, et il coûte
   plus de ventes que n'importe quel défaut de mise en page.

   Rien ne part vers nos serveurs : tout reste en local, et tout expire. */

const PREFIXE = 'pt:';

type Enveloppe<T> = { v: T; exp: number };

function lire<T>(cle: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const brut = window.localStorage.getItem(PREFIXE + cle);
    if (!brut) return null;
    const e = JSON.parse(brut) as Enveloppe<T>;
    if (!e.exp || Date.now() > e.exp) {
      window.localStorage.removeItem(PREFIXE + cle);
      return null;
    }
    return e.v;
  } catch {
    // Navigation privée, quota plein, stockage désactivé : on continue sans.
    return null;
  }
}

function ecrire<T>(cle: string, valeur: T, heures: number) {
  if (typeof window === 'undefined') return;
  try {
    const e: Enveloppe<T> = { v: valeur, exp: Date.now() + heures * 3600 * 1000 };
    window.localStorage.setItem(PREFIXE + cle, JSON.stringify(e));
  } catch {
    /* stockage indisponible : le formulaire fonctionne, sans mémoire */
  }
}

function effacer(cle: string) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(PREFIXE + cle);
  } catch {
    /* rien à faire */
  }
}

/* ---------- Brouillon du formulaire ----------
   Sept jours : assez pour revenir le lendemain, assez court pour ne pas
   laisser traîner un nom et un e-mail sur un appareil partagé. */

export type Brouillon = {
  source: string;
  cible: string;
  email: string;
  prenom: string;
  nom: string;
  remarque: string;
  postal: boolean;
  adresse: string;
  codePostal: string;
  ville: string;
};

export const lireBrouillon = () => lire<Partial<Brouillon>>('brouillon');
export const ecrireBrouillon = (b: Brouillon) => ecrire('brouillon', b, 24 * 7);
export const effacerBrouillon = () => effacer('brouillon');

/* ---------- Commande en attente de paiement ----------
   Douze heures, en deçà des vingt-quatre heures de validité d'une session
   Stripe : mieux vaut proposer de recommencer que d'ouvrir un formulaire
   périmé. */

export type EnAttente = {
  reference: string;
  clientSecret: string;
  montant: number;
  pages: number;
  source: string;
  cible: string;
  postal: boolean;
};

export const lireEnAttente = () => lire<EnAttente>('paiement');
export const ecrireEnAttente = (p: EnAttente) => ecrire('paiement', p, 12);
export const effacerEnAttente = () => effacer('paiement');

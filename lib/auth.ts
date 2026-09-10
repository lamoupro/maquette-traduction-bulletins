import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

/* Accès à l'administration.

   Le mot de passe n'est jamais stocké dans le cookie : celui-ci contient une
   empreinte calculée à partir du mot de passe. Le serveur la recalcule à
   chaque requête. Changer le mot de passe invalide donc toutes les sessions. */

export const COOKIE = 'pt_admin';

const motDePasse = () => process.env.ADMIN_MOT_DE_PASSE ?? '';

export const authConfiguree = () => motDePasse().length >= 12;

export function empreinte() {
  return createHmac('sha256', motDePasse()).update('protranslayte-admin-v1').digest('hex');
}

/** Comparaison à durée constante : ne fuit pas d'information par le temps. */
export function egal(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export async function estConnecte() {
  if (!authConfiguree()) return false;
  const jeton = (await cookies()).get(COOKIE)?.value;
  return Boolean(jeton && egal(jeton, empreinte()));
}

/* ---------- Accès à la démonstration ----------

   Une clé qui ouvre le portail de démonstration, et RIEN D'AUTRE.

   Volontairement distincte de la session d'administration : celle-ci donne
   accès aux vrais documents de vrais clients. Une clé qu'on met dans un
   marque-page, qu'on ouvre sur un téléphone pendant un appel et qu'on montre
   à l'écran ne doit pas pouvoir ouvrir ça. Elle n'ouvre que des données
   fictives.

   Trente jours, comme la session que le portail proposera à ses utilisateurs. */

export const COOKIE_DEMO = 'pt_demo';
export const DEMO_JOURS = 30;

const cleDemo = () => process.env.DEMO_CLE ?? '';

export const demoConfiguree = () => cleDemo().length >= 8;

export function empreinteDemo() {
  return createHmac('sha256', cleDemo()).update('protranslayte-demo-v1').digest('hex');
}

export async function estDemo() {
  if (!demoConfiguree()) return false;
  const jeton = (await cookies()).get(COOKIE_DEMO)?.value;
  return Boolean(jeton && egal(jeton, empreinteDemo()));
}

/** Qui peut voir le portail : l'administrateur, ou un porteur de la clé. */
export async function peutVoirLaDemo() {
  return (await estConnecte()) || (await estDemo());
}

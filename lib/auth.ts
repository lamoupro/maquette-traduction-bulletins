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

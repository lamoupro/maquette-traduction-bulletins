import { handlers } from '@/lib/agence/auth';

/* Le point d'entrée générique d'Auth.js — signature Google/Microsoft, retour
   du lien magique, et rien d'autre : les routes de passkey sont à côté,
   gérées à la main (voir lib/agence/webauthn.ts). */
export const { GET, POST } = handlers;

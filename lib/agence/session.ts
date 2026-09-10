import { randomBytes } from 'crypto';
import { cookies } from 'next/headers';
import { eq } from 'drizzle-orm';
import { db } from './db/client';
import { sessions } from './db/schema';
import { domaineCookieAgence } from './host';

/* Poser une session en base, à la main — pour le SEUL cas où Auth.js ne peut
   pas le faire lui-même : l'authentification par passkey.

   Google, Microsoft et le lien magique passent tous par une redirection, et
   Auth.js gère lui-même la création de la session à l'arrivée. WebAuthn ne
   redirige nulle part : c'est un échange JavaScript direct avec
   navigator.credentials, terminé par un fetch() vers notre route. Une fois
   l'empreinte vérifiée (voir lib/agence/webauthn.ts), il faut donc ouvrir la
   session nous-mêmes.

   Le cookie posé ici a EXACTEMENT le nom et les réglages qu'Auth.js utilise
   pour ses propres sessions en base (voir @auth/core/lib/utils/cookie.js) :
   c'est ce qui permet à `auth()` de la reconnaître ensuite comme n'importe
   quelle autre, sans traitement particulier. */

const TRENTE_JOURS = 30 * 24 * 60 * 60;

export async function creerSession(userId: string, https: boolean, userAgent?: string | null) {
  const jeton = randomBytes(32).toString('hex');
  const expire = new Date(Date.now() + TRENTE_JOURS * 1000);

  await db.insert(sessions).values({ sessionToken: jeton, userId, expires: expire, userAgent });

  (await cookies()).set(`${https ? '__Secure-' : ''}authjs.session-token`, jeton, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: https,
    expires: expire,
    /* Même raisonnement que pour les sessions ouvertes par Auth.js — voir la
       note sur `cookies.sessionToken` dans lib/agence/auth.ts. Une passkey
       enregistrée sur un sous-domaine doit garder la personne connectée si
       elle rejoint, le même jour, une autre organisation sur un autre
       sous-domaine : c'est la même identité, une seule session. */
    domain: domaineCookieAgence(),
  });
}

/** Coupe une session précise — la brique de la future page « déconnecter cet appareil ». */
export const revoquerSession = (sessionToken: string) =>
  db.delete(sessions).where(eq(sessions.sessionToken, sessionToken));

/* Rien d'équivalent pour « révoquer toutes les sessions d'un utilisateur » :
   ça n'a pas de sens ICI. Une session ne porte pas d'organisation — c'est une
   identité, qui peut appartenir à plusieurs agences à la fois. Retirer
   quelqu'un d'une organisation ne doit pas déconnecter le compte d'une AUTRE
   organisation dont il resterait membre : c'est `verifierAcces` qui referme
   la porte, à chaque page, pour l'organisation qui l'a retiré — pas la
   session elle-même. */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE_REJEU } from '@/lib/portail-demo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* Revenir à l'écran d'entrée, pour refaire la prise.

   Une fois la clé posée, le cookie dure trente jours et l'écran d'entrée
   devient inatteignable : impossible de rejouer l'ouverture sans passer par
   une fenêtre privée. Or c'est précisément l'écran qu'on filme, et qu'on
   refilme.

   Ceci N'EST PAS une déconnexion, et c'est délibéré. Effacer la session
   rendrait bien l'écran d'entrée, mais le raccourci « Open the link » qui s'y
   trouve ne pourrait plus rentrer — il n'a pas la clé, et il n'a rien à faire
   de l'avoir. On pose donc un simple drapeau de présentation : la session
   reste entière, seul l'affichage repart du début. */

export async function GET(requete: Request) {
  (await cookies()).set(COOKIE_REJEU, '1', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/portal',
    maxAge: 60 * 60,
  });
  return NextResponse.redirect(new URL('/portal/sign-in', requete.url));
}

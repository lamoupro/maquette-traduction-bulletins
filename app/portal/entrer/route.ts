import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE_REJEU } from '@/lib/portail-demo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* Le bout du raccourci « Open the link » de l'écran d'entrée.

   Il n'y a pas d'e-mail à recevoir dans une maquette, et une présentation ne
   peut pas s'arrêter là. Ce passage lève le drapeau de rejeu posé par
   /portal/rejouer et rend la main au portail. Il n'accorde aucun accès : sans
   session valable, /portal renvoie de toute façon vers l'écran d'entrée. */

export async function GET(requete: Request) {
  (await cookies()).delete({ name: COOKIE_REJEU, path: '/portal' });
  return NextResponse.redirect(new URL('/portal', requete.url));
}

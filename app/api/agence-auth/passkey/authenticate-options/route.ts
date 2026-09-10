import { NextResponse } from 'next/server';
import { optionsAuthentification } from '@/lib/agence/webauthn';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* PUBLIQUE, volontairement : c'est le premier geste d'une connexion, avant
   qu'on sache qui appuie sur le bouton. `allowCredentials` reste vide côté
   lib/agence/webauthn.ts — c'est ce qui permet au navigateur de proposer
   lui-même l'identité, sans qu'on lui ait dit laquelle chercher. */
export async function POST(requete: Request) {
  const options = await optionsAuthentification(requete);
  return NextResponse.json(options);
}

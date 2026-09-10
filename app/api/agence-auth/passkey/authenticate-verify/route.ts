import { NextResponse } from 'next/server';
import { creerSession } from '@/lib/agence/session';
import { verifierAuthentification } from '@/lib/agence/webauthn';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* Seconde moitié de la connexion par passkey. Vérifiée, elle ouvre la
   session ELLE-MÊME — voir lib/agence/session.ts pour pourquoi ce cas précis
   ne peut pas passer par le mécanisme habituel d'Auth.js, pensé pour des
   redirections et pas pour un échange navigator.credentials. */
export async function POST(requete: Request) {
  const { reponse } = await requete.json();
  const resultat = await verifierAuthentification(requete, reponse);
  if (!resultat.verifie) {
    return NextResponse.json({ erreur: resultat.motif }, { status: 400 });
  }

  const https = new URL(requete.url).protocol === 'https:';
  await creerSession(resultat.userId, https, requete.headers.get('user-agent'));
  return NextResponse.json({ ok: true });
}

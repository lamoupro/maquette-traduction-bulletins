import { NextResponse } from 'next/server';
import { auth } from '@/lib/agence/auth';
import { verifierEnregistrement } from '@/lib/agence/webauthn';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(requete: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ erreur: 'Non connecté.' }, { status: 401 });
  }

  const { reponse, nomAppareil } = await requete.json();
  const resultat = await verifierEnregistrement(requete, session.user.id, reponse, nomAppareil);
  if (!resultat.verifie) {
    return NextResponse.json({ erreur: resultat.motif }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

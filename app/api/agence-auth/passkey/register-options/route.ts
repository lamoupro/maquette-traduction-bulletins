import { NextResponse } from 'next/server';
import { auth } from '@/lib/agence/auth';
import { optionsEnregistrement } from '@/lib/agence/webauthn';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* Première moitié de la création d'une passkey : réservée à quelqu'un déjà
   connecté par un autre moyen — Google, Microsoft ou le lien magique. On ne
   crée jamais de compte par ce chemin, seulement une seconde façon de
   prouver, pour un compte qui existe déjà, qui il est la prochaine fois. */
export async function POST(requete: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ erreur: 'Non connecté.' }, { status: 401 });
  }
  const options = await optionsEnregistrement(requete, session.user.id, session.user.email);
  return NextResponse.json(options);
}

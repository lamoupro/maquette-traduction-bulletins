import { NextResponse } from 'next/server';
import { auth } from '@/lib/agence/auth';
import { verifierAcces } from '@/lib/agence/acces';
import { adresseAgence } from '@/lib/agence/host';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* LE point de passage obligé après toute connexion réussie — Google,
   Microsoft ou lien magique la redirigent tous les trois ici.

   C'est ICI, et nulle part avant, que se décide si l'identité qu'Auth.js
   vient de confirmer a le droit de voir cette organisation. Voir la note en
   tête de lib/agence/auth.ts : prouver une adresse et être autorisé à
   consulter des dossiers sont deux questions différentes, posées à deux
   endroits différents. */

export async function GET(requete: Request, { params }: { params: Promise<{ org: string }> }) {
  const { org: slug } = await params;
  const url = new URL(requete.url);
  const hote = requete.headers.get('host');
  const session = await auth();

  if (!session?.user?.id || !session.user.email) {
    return NextResponse.redirect(adresseAgence(slug, hote, '/sign-in', url.toString()));
  }

  const acces = await verifierAcces(slug, session.user.id, session.user.email);
  if (acces.genre === 'refuse') {
    return NextResponse.redirect(adresseAgence(slug, hote, '/sign-in?refuse=1', url.toString()));
  }

  return NextResponse.redirect(adresseAgence(slug, hote, '', url.toString()));
}

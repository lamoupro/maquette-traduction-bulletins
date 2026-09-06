import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE_DEMO, DEMO_JOURS, demoConfiguree, egal, empreinteDemo } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* Ouverture de la démonstration par clé.

   Un marque-page à garder sur le téléphone : on l'ouvre, on est dans le
   portail, on montre. Aucun e-mail, aucun mot de passe.

   La clé n'ouvre QUE la démonstration — elle ne vaut rien sur /admin, où
   vivent les vrais dossiers. Le cookie est d'ailleurs limité au chemin
   /portal. La redirection retire la clé de la barre d'adresse, pour qu'elle
   ne reste pas lisible à l'écran pendant une présentation. */

export async function GET(requete: Request) {
  const fournie = new URL(requete.url).searchParams.get('cle') ?? '';

  if (!demoConfiguree()) {
    return NextResponse.json(
      { erreur: "Aucune clé de démonstration n'est définie (DEMO_CLE)." },
      { status: 503 },
    );
  }
  if (!egal(fournie, process.env.DEMO_CLE!)) {
    return NextResponse.json({ erreur: 'Clé invalide.' }, { status: 401 });
  }

  (await cookies()).set(COOKIE_DEMO, empreinteDemo(), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/portal',
    maxAge: DEMO_JOURS * 24 * 60 * 60,
  });

  return NextResponse.redirect(new URL('/portal', requete.url));
}

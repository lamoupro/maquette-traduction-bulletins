import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE_DEMO, DEMO_JOURS, demoConfiguree, egal, empreinteDemo } from '@/lib/auth';
import { COOKIE_ORG, estClePartenaire } from '@/lib/portail-demo';

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
  const params = new URL(requete.url).searchParams;
  const fournie = params.get('cle') ?? '';

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

  /* « &org=… » ouvre directement sur le bon partenaire.

     Sans ça, un lien envoyé à une agence tombe sur les couleurs de la
     précédente — celles d'un CONCURRENT, la plupart du temps. On pose donc
     aussi la préférence d'affichage, et le lien devient propre à la personne
     à qui on l'envoie. La bascule du bandeau reste là pour passer de l'une à
     l'autre pendant une présentation. */
  const org = params.get('org');
  if (estClePartenaire(org)) {
    /* MÊME CHEMIN que celui posé par le sélecteur du bandeau (BasculeOrg) :
       deux cookies de même nom sur des chemins différents coexistent, et
       c'est le plus précis qui gagne. Les poser ailleurs ferait que le lien
       et le sélecteur se contrediraient en silence. */
    (await cookies()).set(COOKIE_ORG, org, {
      httpOnly: false,
      sameSite: 'lax',
      path: '/portal',
      maxAge: DEMO_JOURS * 24 * 60 * 60,
    });
  }

  return NextResponse.redirect(new URL('/portal', requete.url));
}

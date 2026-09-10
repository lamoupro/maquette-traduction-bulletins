import { NextResponse } from 'next/server';
import { peutVoirLaDemo } from '@/lib/auth';
import { partenaireActif } from '@/lib/partenaire-actif';
import { dansLePerimetre, trouver } from '@/lib/portail-demo';
import { construireAnnee } from '@/lib/portail-sortie';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* Sert UNE ANNÉE du dossier, en un seul document.

   Les trimestres de l'année sont mis bout à bout, dans l'ordre du cursus. On
   suit le trimestre pour savoir ce qui manque, mais on le lit par année : un
   registrar ou un entraîneur veut voir une année, pas ouvrir trois fichiers
   pour la reconstituer.

   ET SANS LES PAGES DE CERTIFICAT — voir lib/portail-sortie.ts, où vit
   l'assemblage, partagé avec le portail réel d'un client. Ce fichier ne garde
   plus qu'une chose : la porte. */

export async function GET(requete: Request) {
  if (!(await peutVoirLaDemo())) {
    return NextResponse.json({ erreur: 'Accès refusé.' }, { status: 401 });
  }

  const p = new URL(requete.url).searchParams;
  const pa = await partenaireActif();
  const candidat = trouver(p.get('c') ?? '');
  /* Le périmètre est vérifié aux TROIS entrées — la fiche, cette route, celle
     du dossier. Une seule laissée ouverte suffirait à rendre le filtrage
     décoratif : il suffirait de connaître l'identifiant. */
  if (!candidat || !dansLePerimetre(candidat, pa, p.get('view') === 'coach')) {
    return NextResponse.json({ erreur: 'Candidat inconnu.' }, { status: 404 });
  }

  const traduction = p.get('t') === 'translation';
  const assemble = await construireAnnee(candidat, p.get('a') ?? '', traduction);
  if (!assemble) {
    return NextResponse.json(
      { erreur: traduction ? 'Traduction non disponible.' : 'Année inconnue.' },
      { status: 404 },
    );
  }

  return new NextResponse(new Uint8Array(assemble.pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Length': String(assemble.pdf.length),
      /* Par défaut « inline » : le document s'affiche dans la visionneuse de la
         page. « ?dl=1 » force l'enregistrement — regarder et télécharger sont
         deux gestes distincts, et l'un ne doit pas déclencher l'autre. */
      'Content-Disposition': `${p.get('dl') === '1' ? 'attachment' : 'inline'}; filename="${assemble.nom.replace(/[^\x20-\x7e]/g, '_')}"`,
      'Cache-Control': 'no-store',
    },
  });
}

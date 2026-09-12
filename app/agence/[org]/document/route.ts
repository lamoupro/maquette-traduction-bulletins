import { NextResponse } from 'next/server';
import { gardeRoute } from '@/lib/agence/garde';
import { sportifDe } from '@/lib/agence/sportifs';
import { ajoutsDe, fusionnerAjouts } from '@/lib/agence/suivi';
import { construireAnnee } from '@/lib/portail-sortie';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* Une année du dossier, en un seul document, pour la consultation à l'écran.

   La garde est ici ET sur la fiche : une liste filtrée dont les adresses de
   documents restent ouvertes ne restreint rien. On répond « inconnu » plutôt
   qu'« interdit » pour un sportif hors de l'organisation, afin de ne pas
   confirmer qu'il existe ailleurs. */

export async function GET(
  requete: Request,
  { params }: { params: Promise<{ org: string }> },
) {
  const { org: slug } = await params;
  const acces = await gardeRoute(slug);
  if (!acces) return NextResponse.json({ erreur: 'Accès refusé.' }, { status: 401 });

  const p = new URL(requete.url).searchParams;
  const brut = sportifDe(slug, p.get('c') ?? '');
  if (!brut) return NextResponse.json({ erreur: 'Sportif inconnu.' }, { status: 404 });

  /* Avec les pièces ajoutées à la main : sans ça, un document qu'on vient de
     déposer s'affiche dans le dossier mais refuse de s'ouvrir. */
  const candidat = fusionnerAjouts(brut, await ajoutsDe(acces.org.id, brut.id));

  const assemble = await construireAnnee(candidat, p.get('a') ?? '', p.get('t') === 'translation');
  if (!assemble) {
    return NextResponse.json({ erreur: 'Document non disponible.' }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(assemble.pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Length': String(assemble.pdf.length),
      /* Par défaut « inline » : le document s'affiche dans la visionneuse de
         la page. « ?dl=1 » force l'enregistrement — regarder et télécharger
         sont deux gestes distincts, et l'un ne doit pas déclencher l'autre. */
      'Content-Disposition': `${p.get('dl') === '1' ? 'attachment' : 'inline'}; filename="${assemble.nom.replace(/[^\x20-\x7e]/g, '_')}"`,
      'Cache-Control': 'no-store',
    },
  });
}

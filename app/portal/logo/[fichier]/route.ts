import { NextResponse } from 'next/server';
import { lireFichierDemo } from '@/lib/fichier-demo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* Les logos des partenaires — servis SANS garde de session, comme ils
   l'étaient sous public/demo-… jusqu'ici : l'écran d'entrée du portail les
   montre avant toute connexion, c'est le premier argument de la
   démonstration. Ce n'est donc pas eux que le store Blob privé protège —
   seulement le fait qu'ils ne vivent pas dans le dépôt Git, qui est public.

   Une liste FERMÉE plutôt qu'un chemin repris de l'URL : sans ça, cette route
   deviendrait un accès en lecture à n'importe quel fichier du store. */
const LOGOS: Record<string, { chemin: string; type: string }> = {
  'trackhouse.png': { chemin: 'logos/trackhouse-monogramme.png', type: 'image/png' },
  'towson.png': { chemin: 'logos/towson-university-logo-couleurs.png', type: 'image/png' },
};

export async function GET(_requete: Request, { params }: { params: Promise<{ fichier: string }> }) {
  const { fichier } = await params;
  const entree = LOGOS[fichier];
  if (!entree) return NextResponse.json({ erreur: 'Logo inconnu.' }, { status: 404 });

  const bytes = await lireFichierDemo(entree.chemin);
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      'Content-Type': entree.type,
      'Cache-Control': 'public, max-age=86400, immutable',
    },
  });
}

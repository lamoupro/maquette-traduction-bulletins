import { NextResponse } from 'next/server';
import { gardeRoute } from '@/lib/agence/garde';
import { sportifDe } from '@/lib/agence/sportifs';
import { construireLivraison } from '@/lib/portail-sortie';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* Le dossier certifié — la SEULE sortie du portail.

   Ni archive, ni pièce isolée, ni volume séparé par langue : un destinataire
   repart avec un document ou avec rien. C'est ce qui donne son sens à la
   mention d'altération portée par chaque page.

   UN DOCUMENT PAR LIVRAISON. Un étudiant qui a commandé en deux fois a reçu
   deux envois certifiés, chacun avec son certificat et sa date ; les refondre
   sous un certificat neuf daterait l'attestation d'un jour où le travail n'a
   pas eu lieu. */

export async function GET(
  requete: Request,
  { params }: { params: Promise<{ org: string }> },
) {
  const { org: slug } = await params;
  const acces = await gardeRoute(slug);
  if (!acces) return NextResponse.json({ erreur: 'Accès refusé.' }, { status: 401 });

  const p = new URL(requete.url).searchParams;
  const c = sportifDe(slug, p.get('c') ?? '');
  if (!c) return NextResponse.json({ erreur: 'Sportif inconnu.' }, { status: 404 });

  const demandee = p.get('livraison');
  const envoi = demandee
    ? c.livraisons.find((l) => l.cle === demandee)
    : c.livraisons[c.livraisons.length - 1];
  if (!envoi) return NextResponse.json({ erreur: 'Livraison inconnue.' }, { status: 404 });

  const assemble = await construireLivraison(c, envoi, acces.org.nom);
  if (!assemble) {
    return NextResponse.json(
      { erreur: "Aucune traduction n'est encore certifiée pour cette livraison." },
      { status: 409 },
    );
  }

  return new NextResponse(new Uint8Array(assemble.pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Length': String(assemble.pdf.length),
      'Content-Disposition': `attachment; filename="${assemble.nom}"`,
      'Cache-Control': 'no-store',
    },
  });
}

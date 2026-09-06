import { NextResponse } from 'next/server';
import { peutVoirLaDemo } from '@/lib/auth';
import { trouver } from '@/lib/portail-demo';
import { apercuPdf } from '@/lib/apercu-pdf';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* Sert un document d'exemple du portail.

   Rien n'est lu dans le stockage : la pièce est fabriquée à la demande à
   partir des données de démonstration. Le candidat et l'intitulé sont
   retrouvés dans ces données plutôt que repris de l'adresse — sans quoi
   n'importe qui pourrait faire produire un PDF portant le texte de son choix,
   sous notre en-tête. */

export async function GET(requete: Request) {
  if (!(await peutVoirLaDemo())) {
    return NextResponse.json({ erreur: 'Accès refusé.' }, { status: 401 });
  }

  const p = new URL(requete.url).searchParams;
  const candidat = trouver(p.get('c') ?? '');
  if (!candidat) {
    return NextResponse.json({ erreur: 'Candidat inconnu.' }, { status: 404 });
  }

  const piece = candidat.pieces.find((x) => x.requirement === p.get('r'));
  if (!piece || piece.etat === 'missing') {
    return NextResponse.json({ erreur: 'Document inconnu.' }, { status: 404 });
  }

  const traduction = p.get('t') === 'translation';
  if (traduction && !piece.traduction) {
    return NextResponse.json({ erreur: 'Traduction non disponible.' }, { status: 404 });
  }

  const pdf = await apercuPdf({
    langue: traduction ? 'English' : candidat.pays,
    intitule: piece.requirement,
    candidat: `${candidat.prenom} ${candidat.nom}`,
    reference: candidat.reference,
    pages: (traduction ? piece.traduction?.pages : piece.original?.pages) ?? 1,
    traduction,
  });

  const nom = (traduction ? piece.traduction?.nom : piece.original?.nom) ?? 'document.pdf';

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Length': String(pdf.length),
      /* Par défaut « inline » : le document s'affiche dans la visionneuse de la
         page. « ?dl=1 » force l'enregistrement — regarder et télécharger sont
         deux gestes distincts, et l'un ne doit pas déclencher l'autre. */
      'Content-Disposition': `${p.get('dl') === '1' ? 'attachment' : 'inline'}; filename="${nom.replace(/[^\x20-\x7e]/g, '_')}"`,
      'Cache-Control': 'no-store',
    },
  });
}

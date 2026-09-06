import { NextResponse } from 'next/server';
import { peutVoirLaDemo } from '@/lib/auth';
import { type Candidat, trouver } from '@/lib/portail-demo';
import { apercuPdf } from '@/lib/apercu-pdf';
import { construireDossier, type PieceReliee } from '@/lib/dossier-pdf';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* Le dossier certifié — la SEULE sortie du portail.

   Ni archive, ni pièce isolée, ni volume séparé par langue. Un établissement
   repart avec un document ou avec rien : c'est ce qui donne son sens à la
   mention d'altération portée par chaque page, et c'est ce qui empêche qu'un
   morceau circule détaché de sa certification.

   La consultation à l'écran reste ouverte : on regarde une pièce, on ne la
   prélève pas. */

const CERTIFICAT = {
  traducteur: 'Martin Lamou',
  adresse: "6 rue d'Armaillé, 75017 Paris, France",
  contact: 'contact@protranslayte.com — protranslayte.com',
};

const ETABLISSEMENT = 'Towson University';

/** Nom de fichier lisible, sans caractère qui gêne un système de fichiers. */
const nomSur = (t: string) => t.replace(/[^A-Za-z0-9 .()-]/g, ' ').replace(/\s+/g, ' ').trim();

/** Les pièces RÉELLEMENT CERTIFIÉES, chacune avec son original et sa traduction.

   Une pièce reçue mais pas encore traduite n'entre pas dans le dossier. Le
   certificat déclare que la documentation qui suit a été traduite : y joindre
   un original sans sa traduction ferait attester une chose fausse. Elle
   rejoindra le dossier à sa livraison. */
async function pieces(c: Candidat): Promise<PieceReliee[]> {
  const commun = { candidat: `${c.prenom} ${c.nom}`, reference: c.reference };
  const out: PieceReliee[] = [];

  for (const [i, p] of c.pieces.entries()) {
    if (!p.original || !p.traduction) continue;
    out.push({
      reference: `${c.reference}-${String(i + 1).padStart(2, '0')}`,
      intitule: p.requirement,
      original: p.original
        ? await apercuPdf({
            ...commun,
            langue: c.pays,
            intitule: p.requirement,
            pages: p.original.pages,
            traduction: false,
          })
        : undefined,
      traduction: p.traduction
        ? await apercuPdf({
            ...commun,
            langue: 'English',
            intitule: p.requirement,
            pages: p.traduction.pages,
            traduction: true,
          })
        : undefined,
    });
  }
  return out;
}

export async function GET(requete: Request) {
  if (!(await peutVoirLaDemo())) {
    return NextResponse.json({ erreur: 'Accès refusé.' }, { status: 401 });
  }

  const c = trouver(new URL(requete.url).searchParams.get('c') ?? '');
  if (!c) return NextResponse.json({ erreur: 'Candidat inconnu.' }, { status: 404 });

  const contenu = await pieces(c);
  if (contenu.length === 0) {
    return NextResponse.json(
      { erreur: "Aucune traduction n'est encore certifiée pour ce candidat." },
      { status: 409 },
    );
  }

  const pdf = await construireDossier({
    etablissement: ETABLISSEMENT,
    candidat: `${c.prenom} ${c.nom}`,
    pays: c.pays,
    detail: `${c.pays} · ${c.sport} · Entering ${c.entree}`,
    reference: c.reference,
    pieces: contenu,
    certificat: CERTIFICAT,
    demonstration: true,
  });

  const nom = nomSur(
    `${ETABLISSEMENT} - ${c.prenom} ${c.nom} - certified file - ${c.reference}.pdf`,
  );

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Length': String(pdf.length),
      'Content-Disposition': `attachment; filename="${nom}"`,
      'Cache-Control': 'no-store',
    },
  });
}

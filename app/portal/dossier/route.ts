import { NextResponse } from 'next/server';
import { peutVoirLaDemo } from '@/lib/auth';
import { partenaireActif } from '@/lib/partenaire-actif';
import { type Candidat, type Livraison, dansLePerimetre, trouver } from '@/lib/portail-demo';
import { apercuPdf } from '@/lib/apercu-pdf';
import { lireFichierDemo } from '@/lib/fichier-demo';
import { construireDossier, type PieceReliee } from '@/lib/dossier-pdf';
import { sansPageCertificat } from '@/lib/pdf-outils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* Le dossier certifié — la SEULE sortie du portail.

   Ni archive, ni pièce isolée, ni volume séparé par langue. Un destinataire
   repart avec un document ou avec rien : c'est ce qui donne son sens à la
   mention d'altération portée par chaque page, et c'est ce qui empêche qu'un
   morceau circule détaché de sa certification.

   UN DOCUMENT PAR LIVRAISON, et pas un seul pour tout le dossier. Un étudiant
   qui commande en deux fois reçoit deux envois certifiés, chacun avec son
   certificat et sa date. Les refondre en un seul PDF sous un certificat neuf
   reviendrait à dater l'attestation d'un jour où le travail n'a pas eu lieu —
   et à faire signer, aujourd'hui, une pièce établie il y a trois semaines.

   La consultation à l'écran reste ouverte : on regarde une pièce, on ne la
   prélève pas. */

const CERTIFICAT = {
  traducteur: 'Martin Lamou',
  adresse: "6 rue d'Armaillé, 75017 Paris, France",
  contact: 'contact@protranslayte.com — protranslayte.com',
};

/** Nom de fichier lisible, sans caractère qui gêne un système de fichiers. */
const nomSur = (t: string) => t.replace(/[^A-Za-z0-9 .()-]/g, ' ').replace(/\s+/g, ' ').trim();

/** Les pièces d'UNE livraison, chacune avec son original et sa traduction.

   Une pièce reçue mais pas encore traduite n'entre pas dans le dossier. Le
   certificat déclare que la documentation qui suit a été traduite : y joindre
   un original sans sa traduction ferait attester une chose fausse. Elle
   rejoindra le dossier à sa livraison. */
async function pieces(c: Candidat, envoi: Livraison): Promise<PieceReliee[]> {
  const commun = { candidat: `${c.prenom} ${c.nom}`, reference: envoi.cle };
  const out: PieceReliee[] = [];

  for (const [i, p] of c.pieces.entries()) {
    if (!p.original || !p.traduction || p.livraison !== envoi.cle) continue;

    const original = p.original.fichier
      ? await lireFichierDemo(p.original.fichier)
      : await apercuPdf({
          ...commun,
          langue: c.pays,
          intitule: p.requirement,
          pages: p.original.pages,
          traduction: false,
        });

    let traduction = p.traduction.fichier
      ? await lireFichierDemo(p.traduction.fichier)
      : await apercuPdf({
          ...commun,
          langue: 'English',
          intitule: p.requirement,
          pages: p.traduction.pages,
          traduction: true,
        });
    if (p.traduction.fichier && p.traduction.certificat) {
      traduction = await sansPageCertificat(traduction, p.traduction.certificat);
    }

    out.push({
      reference: `${envoi.cle}-${String(i + 1).padStart(2, '0')}`,
      intitule: p.requirement,
      original,
      traduction,
    });
  }
  return out;
}

export async function GET(requete: Request) {
  if (!(await peutVoirLaDemo())) {
    return NextResponse.json({ erreur: 'Accès refusé.' }, { status: 401 });
  }

  const url = new URL(requete.url);
  const pa = await partenaireActif();
  const c = trouver(url.searchParams.get('c') ?? '');
  /* Le périmètre se vérifie ici comme sur la fiche : une adresse de
     téléchargement laissée ouverte rendrait inutile le filtrage de l'écran. */
  if (!c || !dansLePerimetre(c, pa, url.searchParams.get('view') === 'coach')) {
    return NextResponse.json({ erreur: 'Candidat inconnu.' }, { status: 404 });
  }

  /* Quelle livraison. Par défaut la dernière — mais la maquette nomme toujours
     celle qu'elle demande, et un dossier fractionné en propose autant de
     boutons qu'il compte d'envois. */
  const demandee = url.searchParams.get('livraison');
  const envoi = demandee
    ? c.livraisons.find((l) => l.cle === demandee)
    : c.livraisons[c.livraisons.length - 1];
  if (!envoi) {
    return NextResponse.json({ erreur: 'Livraison inconnue.' }, { status: 404 });
  }

  const contenu = await pieces(c, envoi);
  if (contenu.length === 0) {
    return NextResponse.json(
      { erreur: "Aucune traduction n'est encore certifiée pour cette livraison." },
      { status: 409 },
    );
  }

  const pdf = await construireDossier({
    etablissement: pa.nom,
    candidat: `${c.prenom} ${c.nom}`,
    pays: c.pays,
    detail: `${c.pays} · ${c.sport} · Entering ${c.entree}`,
    reference: envoi.commandes.join(' · '),
    emisLe: envoi.livreLe,
    pieces: contenu,
    certificat: CERTIFICAT,
    /* Un dossier inventé se signale comme tel. Un dossier réel ne peut pas
       porter « not a student record » sans mentir : il en est un. On dit
       alors ce qui est vrai — ces pièces sont authentiques, et montrées avec
       l'accord de l'intéressé. */
    demonstration: c.reel
      ? "Genuine records, reassembled for demonstration with the student's permission."
      : 'SAMPLE FILE - DEMONSTRATION ONLY. Not a student record.',
  });

  const nom = nomSur(
    `${pa.nom} - ${c.prenom} ${c.nom} - ${envoi.couverture} - ${envoi.cle}.pdf`,
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

import { NextResponse } from 'next/server';
import { peutVoirLaDemo } from '@/lib/auth';
import { partenaireActif } from '@/lib/partenaire-actif';
import { dansLePerimetre, trouver } from '@/lib/portail-demo';
import { construireLivraison } from '@/lib/portail-sortie';

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
   prélève pas.

   L'assemblage lui-même vit dans lib/portail-sortie.ts, partagé avec le
   portail réel d'un client : les deux doivent produire le même document au
   bit près, seule la porte diffère. */

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

  /* La démonstration, elle, DOIT porter son bandeau : un prospect qui
     enregistre ce PDF ne doit jamais pouvoir le confondre avec une pièce
     réelle. Un dossier inventé se signale comme tel ; un dossier réel montré
     en démonstration dit ce qui est vrai — ces pièces sont authentiques, et
     montrées avec l'accord de l'intéressé. */
  const assemble = await construireLivraison(c, envoi, pa.nom,
    c.reel
      ? "Genuine records, reassembled for demonstration with the student's permission."
      : 'SAMPLE FILE - DEMONSTRATION ONLY. Not a student record.');
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

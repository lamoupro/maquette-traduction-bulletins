import { NextResponse } from 'next/server';
import { peutVoirLaDemo } from '@/lib/auth';
import { partenaireActif } from '@/lib/partenaire-actif';
import { dansLePerimetre, trouver } from '@/lib/portail-demo';
import { apercuPdf } from '@/lib/apercu-pdf';
import { lireFichierDemo } from '@/lib/fichier-demo';
import { fusionner, sansPageCertificat } from '@/lib/pdf-outils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* Sert UNE ANNÉE du dossier, en un seul document.

   Les trimestres de l'année sont mis bout à bout, dans l'ordre du cursus. On
   suit le trimestre pour savoir ce qui manque, mais on le lit par année : un
   registrar ou un entraîneur veut voir une année, pas ouvrir trois fichiers
   pour la reconstituer.

   ET SANS LES PAGES DE CERTIFICAT. Le certificat n'a de sens que sur le
   document qui circule — celui qu'on télécharge depuis la page du dossier, et
   qui porte le sien en tête. L'écran sert à regarder ; un extrait de
   consultation enregistré depuis le navigateur ne doit surtout pas ressembler
   à une pièce certifiée.

   Deux origines possibles pour chaque pièce, et la garde de session vaut pour
   les deux :

   — un VRAI document, lu dans donnees-demo/. Il n'est pas sous public/, donc
     il n'existe à aucune adresse statique : cette route est le seul chemin
     vers lui, et elle vérifie la session.
   — un exemple fabriqué à la demande, pour les dossiers inventés.

   Dans les deux cas le candidat et l'année sont retrouvés dans nos données
   plutôt que repris de l'adresse — sans quoi n'importe qui pourrait faire
   produire un PDF portant le texte de son choix sous notre en-tête, ou faire
   lire un fichier de son choix sur le serveur. */

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

  const annee = p.get('a') ?? '';
  const traduction = p.get('t') === 'translation';
  const pieces = candidat.pieces.filter(
    (x) => x.annee === annee && x.etat !== 'missing' && (traduction ? x.traduction : x.original),
  );
  if (pieces.length === 0) {
    return NextResponse.json(
      { erreur: traduction ? 'Traduction non disponible.' : 'Année inconnue.' },
      { status: 404 },
    );
  }

  const morceaux: Buffer[] = [];
  for (const piece of pieces) {
    const f = traduction ? piece.traduction! : piece.original!;
    if (f.fichier) {
      const brut = await lireFichierDemo(f.fichier);
      morceaux.push(f.certificat ? await sansPageCertificat(brut, f.certificat) : brut);
    } else {
      morceaux.push(
        await apercuPdf({
          langue: traduction ? 'English' : candidat.pays,
          intitule: piece.requirement,
          candidat: `${candidat.prenom} ${candidat.nom}`,
          reference: candidat.reference,
          pages: f.pages,
          traduction,
        }),
      );
    }
  }

  const titre = `${annee} — ${traduction ? 'English translation' : 'original records'}`;
  const pdf = await fusionner(morceaux, `${candidat.prenom} ${candidat.nom} — ${titre}`);
  const nom = `${annee} - ${traduction ? 'English translation' : 'original records'}.pdf`;

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

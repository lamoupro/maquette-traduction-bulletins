import { type Candidat, type Livraison } from './portail-demo';
import { apercuPdf } from './apercu-pdf';
import { lireFichierDemo } from './fichier-demo';
import { construireDossier, type PieceReliee } from './dossier-pdf';
import { fusionner, sansPageCertificat } from './pdf-outils';

/* Ce que le portail SORT — l'assemblage des PDF, sans une seule ligne de
   contrôle d'accès.

   Deux portails s'en servent : la démonstration sous /portal, et le portail
   réel d'un client sous son propre sous-domaine. Ils ne gardent pas leur
   porte de la même façon — clé de démonstration d'un côté, vraie session et
   appartenance à l'organisation de l'autre — mais ce qu'ils produisent doit
   être identique au bit près. D'où ce fichier : la garde reste dans chaque
   route, l'assemblage n'existe qu'ici.

   Rien de ce qui est écrit dans une requête n'entre dans un PDF : le candidat
   et l'année sont retrouvés dans nos données à partir de leurs clés. Sans
   cela, n'importe qui ferait produire un document portant le texte de son
   choix sous notre en-tête. */

const CERTIFICAT = {
  traducteur: 'Martin Lamou',
  adresse: "6 rue d'Armaillé, 75017 Paris, France",
  contact: 'contact@protranslayte.com — protranslayte.com',
};

/** Nom de fichier lisible, sans caractère qui gêne un système de fichiers. */
export const nomSur = (t: string) =>
  t.replace(/[^A-Za-z0-9 .()-]/g, ' ').replace(/\s+/g, ' ').trim();

/* ---------- Une année, pour la consultation à l'écran ----------

   SANS les pages de certificat : le certificat n'a de sens que sur le
   document qui circule, celui qui porte le sien en tête. Un extrait de
   consultation enregistré depuis le navigateur ne doit surtout pas
   ressembler à une pièce certifiée. */

export async function construireAnnee(
  candidat: Candidat,
  annee: string,
  traduction: boolean,
): Promise<{ pdf: Buffer; nom: string } | null> {
  const pieces = candidat.pieces.filter(
    (x) => x.annee === annee && x.etat !== 'missing' && (traduction ? x.traduction : x.original),
  );
  if (pieces.length === 0) return null;

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
  return { pdf, nom };
}

/* ---------- Une livraison certifiée, le document qui circule ----------

   Une pièce reçue mais pas encore traduite n'y entre pas : le certificat
   déclare que la documentation qui suit a été traduite, y joindre un original
   seul ferait attester une chose fausse. Elle rejoindra le dossier à sa
   livraison. */

async function piecesDe(c: Candidat, envoi: Livraison): Promise<PieceReliee[]> {
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

export async function construireLivraison(
  c: Candidat,
  envoi: Livraison,
  etablissement: string,
): Promise<{ pdf: Buffer; nom: string } | null> {
  const contenu = await piecesDe(c, envoi);
  if (contenu.length === 0) return null;

  const pdf = await construireDossier({
    etablissement,
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

  const nom = nomSur(`${etablissement} - ${c.prenom} ${c.nom} - ${envoi.couverture} - ${envoi.cle}.pdf`);
  return { pdf, nom };
}

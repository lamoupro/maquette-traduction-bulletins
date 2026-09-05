import { NextResponse } from 'next/server';
import { estConnecte } from '@/lib/auth';
import { lireFiche, lireOctets } from '@/lib/stockage';
import { referenceValide } from '@/lib/commande';
import { creerZip, type Piece } from '@/lib/zip';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* Toutes les pièces d'une commande, en une archive.

   Le geste remplacé : ouvrir la fiche, cliquer sur dix fichiers un par un,
   les retrouver dans le dossier des téléchargements, les renommer. Ici les
   noms d'origine sont rendus tels que le client les a déposés, préfixés du
   numéro d'ordre — l'archive s'ouvre déjà rangée. */

export async function GET(requete: Request) {
  if (!(await estConnecte())) {
    return NextResponse.json({ erreur: 'Accès refusé.' }, { status: 401 });
  }

  const ref = new URL(requete.url).searchParams.get('ref') ?? '';
  if (!referenceValide(ref)) {
    return NextResponse.json({ erreur: 'Référence invalide.' }, { status: 400 });
  }

  let fiche;
  try {
    fiche = await lireFiche(`commandes/${ref}/commande.json`);
  } catch {
    return NextResponse.json({ erreur: 'Commande introuvable.' }, { status: 404 });
  }

  const cles: string[] = fiche.cles ?? [];
  if (cles.length === 0) {
    return NextResponse.json({ erreur: 'Cette commande ne porte aucun fichier.' }, { status: 404 });
  }

  /* Les noms affichés viennent de la fiche, les octets du stockage. Les deux
     listes sont écrites ensemble au dépôt, donc alignées par indice ; si elles
     divergeaient, on retombe sur le nom interne plutôt que d'échouer. */
  const pieces: Piece[] = [];
  for (const [i, cle] of cles.entries()) {
    const numero = String(i + 1).padStart(2, '0');
    const nomClient = fiche.fichiers?.[i]?.nom as string | undefined;
    const nom = `${numero}-${nomClient ?? (cle.split('/').pop() || 'document')}`;
    try {
      pieces.push({ nom, donnees: await lireOctets(cle) });
    } catch (e) {
      // Une pièce absente du stockage ne doit pas priver des autres : on la
      // signale dans l'archive plutôt que de renvoyer une erreur.
      console.error(`[dossier] pièce illisible ${cle}`, e);
      pieces.push({
        nom: `${numero}-MANQUANT-${nomClient ?? 'document'}.txt`,
        donnees: Buffer.from(
          `Cette pièce est introuvable dans le stockage.\nClé : ${cle}\n`,
          'utf8',
        ),
      });
    }
  }

  const archive = creerZip(pieces, fiche.recuLe ? new Date(fiche.recuLe) : new Date());

  return new NextResponse(new Uint8Array(archive), {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Length': String(archive.length),
      'Content-Disposition': `attachment; filename="${ref}-originaux.zip"`,
      'Cache-Control': 'no-store',
    },
  });
}

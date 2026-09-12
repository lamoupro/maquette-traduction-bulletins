import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { gardeRoute } from '@/lib/agence/garde';
import { sportifDe } from '@/lib/agence/sportifs';
import { enregistrerAjout } from '@/lib/agence/suivi';
import { compterPages } from '@/lib/pages';
import { adresseAgence } from '@/lib/agence/host';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/* Le dépôt d'une pièce qui n'est pas passée par nous.

   Elle rejoint le dossier à l'écran et rien d'autre : elle n'entre jamais
   dans le document certifié, dont le certificat n'atteste que nos propres
   traductions. Voir la note sur la table piece_ajoutee.

   Le fichier va dans le magasin Blob PRIVÉ, sous un chemin qui porte
   l'organisation et le sportif — jamais à une adresse publique, comme les
   pièces réelles du reste du dossier. */

const TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/heic']);
const TAILLE_MAX = 25 * 1024 * 1024;

export async function POST(requete: Request, { params }: { params: Promise<{ org: string }> }) {
  const { org: slug } = await params;
  const acces = await gardeRoute(slug);
  if (!acces) return NextResponse.json({ erreur: 'Accès refusé.' }, { status: 401 });

  const form = await requete.formData();
  const sportifId = String(form.get('sportif') ?? '');
  const requirement = String(form.get('requirement') ?? '');
  const fichier = form.get('fichier');

  const sportif = sportifDe(slug, sportifId);
  if (!sportif) return NextResponse.json({ erreur: 'Sportif inconnu.' }, { status: 404 });

  /* L'intitulé vient d'une requête : on ne le prend que s'il correspond à une
     pièce RÉELLEMENT attendue par ce dossier. Sans ça, n'importe qui
     inventerait une ligne dans le dossier de quelqu'un. */
  if (!sportif.pieces.some((p) => p.requirement === requirement)) {
    return NextResponse.json({ erreur: 'Pièce inconnue pour ce dossier.' }, { status: 400 });
  }

  if (!(fichier instanceof File) || fichier.size === 0) {
    return NextResponse.json({ erreur: 'Aucun fichier.' }, { status: 400 });
  }
  if (fichier.size > TAILLE_MAX) {
    return NextResponse.json({ erreur: 'Fichier trop volumineux (25 Mo maximum).' }, { status: 413 });
  }
  if (!TYPES.has(fichier.type)) {
    return NextResponse.json({ erreur: 'Format accepté : PDF, JPEG, PNG.' }, { status: 415 });
  }

  const octets = Buffer.from(await fichier.arrayBuffer());
  const pages = await compterPages(octets, fichier.type).catch(() => null);

  const propre = fichier.name.replace(/[^A-Za-z0-9 ._-]/g, ' ').replace(/\s+/g, ' ').trim();
  const chemin = `ajouts/${acces.org.id}/${sportifId}/${crypto.randomUUID()}-${propre}`;
  await put(chemin, octets, {
    access: 'private',
    addRandomSuffix: false,
    contentType: fichier.type,
  });

  await enregistrerAjout({
    organisationId: acces.org.id,
    sportifId,
    requirement,
    chemin,
    nomFichier: propre,
    pages: typeof pages === 'number' ? pages : null,
    ajoutePar: acces.email,
  });

  const url = new URL(requete.url);
  const proto = url.hostname === 'localhost' ? 'http' : 'https';
  return NextResponse.redirect(
    adresseAgence(slug, requete.headers.get('host'), `/athlete/${sportifId}`, `${proto}://${url.host}`),
    { status: 303 },
  );
}

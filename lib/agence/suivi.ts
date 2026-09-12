import { and, desc, eq } from 'drizzle-orm';
import { db } from './db/client';
import { piecesAjoutees, rappels } from './db/schema';
import type { Candidat, Piece } from '@/lib/portail-demo';

/* Ce qui s'ajoute au dossier après sa livraison : les relances parties, et
   les pièces rangées à la main.

   Les deux vivent en base parce qu'elles changent — contrairement au dossier
   lui-même, qui est encore lu dans un fichier de code. C'est la couture entre
   les deux mondes, et elle est ici plutôt qu'éparpillée dans les écrans. */

export type Rappel = { canal: 'email' | 'whatsapp'; envoyeLe: Date; envoyePar: string };

/** Le dernier rappel envoyé pour ce sportif, s'il y en a eu un. */
export async function dernierRappel(
  organisationId: string,
  sportifId: string,
): Promise<Rappel | null> {
  const [r] = await db
    .select({ canal: rappels.canal, envoyeLe: rappels.envoyeLe, envoyePar: rappels.envoyePar })
    .from(rappels)
    .where(and(eq(rappels.organisationId, organisationId), eq(rappels.sportifId, sportifId)))
    .orderBy(desc(rappels.envoyeLe))
    .limit(1);
  return r ?? null;
}

export async function noterRappel(
  organisationId: string,
  sportifId: string,
  canal: 'email' | 'whatsapp',
  envoyePar: string,
) {
  await db.insert(rappels).values({ organisationId, sportifId, canal, envoyePar });
}

/* ---------- Les pièces ajoutées à la main ---------- */

export type PieceAjoutee = {
  id: string;
  requirement: string;
  chemin: string;
  nomFichier: string;
  pages: number | null;
  ajouteLe: Date;
  ajoutePar: string;
};

export async function ajoutsDe(
  organisationId: string,
  sportifId: string,
): Promise<PieceAjoutee[]> {
  return db
    .select({
      id: piecesAjoutees.id,
      requirement: piecesAjoutees.requirement,
      chemin: piecesAjoutees.chemin,
      nomFichier: piecesAjoutees.nomFichier,
      pages: piecesAjoutees.pages,
      ajouteLe: piecesAjoutees.ajouteLe,
      ajoutePar: piecesAjoutees.ajoutePar,
    })
    .from(piecesAjoutees)
    .where(
      and(
        eq(piecesAjoutees.organisationId, organisationId),
        eq(piecesAjoutees.sportifId, sportifId),
      ),
    );
}

export async function enregistrerAjout(v: {
  organisationId: string;
  sportifId: string;
  requirement: string;
  chemin: string;
  nomFichier: string;
  pages: number | null;
  ajoutePar: string;
}) {
  await db.insert(piecesAjoutees).values(v);
}

export const supprimerAjout = (organisationId: string, id: string) =>
  db
    .delete(piecesAjoutees)
    .where(and(eq(piecesAjoutees.organisationId, organisationId), eq(piecesAjoutees.id, id)));

/* ---------- La fusion ----------

   Une pièce ajoutée cesse d'être « manquante » : du point de vue de l'agence,
   le document est là et le dossier peut partir. Elle ne devient pas pour
   autant une pièce livrée par nous — `traductionRequise: false` la sort du
   décompte des traductions, et l'absence de `livraison` la tient hors du
   document certifié, où elle n'a rien à faire. */
export function fusionnerAjouts(c: Candidat, ajouts: PieceAjoutee[]): Candidat {
  if (ajouts.length === 0) return c;
  const parIntitule = new Map(ajouts.map((a) => [a.requirement, a]));

  return {
    ...c,
    pieces: c.pieces.map((p): Piece => {
      const a = parIntitule.get(p.requirement);
      if (!a || p.etat !== 'missing') return p;
      return {
        ...p,
        etat: 'received',
        traductionRequise: false,
        original: {
          nom: a.nomFichier,
          pages: a.pages ?? 1,
          recuLe: a.ajouteLe.toISOString().slice(0, 10),
          fichier: a.chemin,
        },
      };
    }),
  };
}

/** Toutes les pièces ajoutées d'une organisation, rangées par sportif. */
export async function ajoutsParSportif(organisationId: string) {
  const lignes = await db
    .select()
    .from(piecesAjoutees)
    .where(eq(piecesAjoutees.organisationId, organisationId));

  const parSportif = new Map<string, PieceAjoutee[]>();
  for (const l of lignes) {
    const liste = parSportif.get(l.sportifId) ?? [];
    liste.push(l);
    parSportif.set(l.sportifId, liste);
  }
  return parSportif;
}

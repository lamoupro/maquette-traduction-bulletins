import { and, desc, eq } from 'drizzle-orm';
import { db } from './db/client';
import { piecesReglees, rappels } from './db/schema';
import type { Candidat, Piece } from '@/lib/portail-demo';

/* Ce qui s'ajoute au dossier après sa livraison : les relances parties, et
   les pièces rangées à la main.

   Les deux vivent en base parce qu'elles changent — contrairement au dossier
   lui-même, qui est encore lu dans un fichier de code. C'est la couture entre
   les deux mondes, et elle est ici plutôt qu'éparpillée dans les écrans. */

export type Canal = 'email' | 'whatsapp' | 'sms';
export type Rappel = { canal: Canal; envoyeLe: Date; envoyePar: string };

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
  canal: Canal,
  envoyePar: string,
) {
  await db.insert(rappels).values({ organisationId, sportifId, canal, envoyePar });
}

/* ---------- Les pièces réglées ailleurs ---------- */

export type PieceReglee = { requirement: string; regleeLe: Date; regleePar: string };

export async function regleesDe(organisationId: string, sportifId: string): Promise<PieceReglee[]> {
  return db
    .select({
      requirement: piecesReglees.requirement,
      regleeLe: piecesReglees.regleeLe,
      regleePar: piecesReglees.regleePar,
    })
    .from(piecesReglees)
    .where(
      and(eq(piecesReglees.organisationId, organisationId), eq(piecesReglees.sportifId, sportifId)),
    );
}

export async function marquerReglee(
  organisationId: string,
  sportifId: string,
  requirement: string,
  regleePar: string,
) {
  await db
    .insert(piecesReglees)
    .values({ organisationId, sportifId, requirement, regleePar })
    .onConflictDoNothing();
}

export const annulerReglee = (organisationId: string, sportifId: string, requirement: string) =>
  db
    .delete(piecesReglees)
    .where(
      and(
        eq(piecesReglees.organisationId, organisationId),
        eq(piecesReglees.sportifId, sportifId),
        eq(piecesReglees.requirement, requirement),
      ),
    );

/* ---------- La fusion ----------

   Une pièce cochée cesse de manquer : du point de vue de l'agence, l'étudiant
   a fait ce qu'il devait et le dossier peut partir. Elle ne devient pas pour
   autant une pièce livrée par nous — sans fichier et sans livraison, elle ne
   peut entrer ni dans une consultation ni dans le document certifié, où elle
   n'aurait rien à faire. */
export function fusionnerReglees(c: Candidat, reglees: PieceReglee[]): Candidat {
  if (reglees.length === 0) return c;
  const cochees = new Set(reglees.map((r) => r.requirement));

  return {
    ...c,
    pieces: c.pieces.map((p): Piece =>
      cochees.has(p.requirement) && p.etat === 'missing'
        ? { ...p, etat: 'received', traductionRequise: false }
        : p,
    ),
  };
}

/** Toutes les pièces réglées d'une organisation, rangées par sportif. */
export async function regleesParSportif(organisationId: string) {
  const lignes = await db
    .select()
    .from(piecesReglees)
    .where(eq(piecesReglees.organisationId, organisationId));

  const parSportif = new Map<string, PieceReglee[]>();
  for (const l of lignes) {
    const liste = parSportif.get(l.sportifId) ?? [];
    liste.push(l);
    parSportif.set(l.sportifId, liste);
  }
  return parSportif;
}

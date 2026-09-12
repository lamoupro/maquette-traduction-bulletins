'use server';

import { revalidatePath } from 'next/cache';
import { gardeRoute } from '@/lib/agence/garde';
import { sportifDe } from '@/lib/agence/sportifs';
import { envoyerRelanceEmail, signalerSmsAEnvoyer } from '@/lib/agence/relance';
import {
  annulerReglee,
  fusionnerReglees,
  marquerReglee,
  noterRappel,
  regleesDe,
} from '@/lib/agence/suivi';

/* Les gestes de la fiche. Chacun revérifie l'accès : une action serveur est
   une adresse comme une autre, atteignable sans jamais avoir affiché la page
   qui porte le bouton. */

export type ResultatRelance = { ok?: string; erreur?: string } | undefined;

async function contexte(orgSlug: string, sportifId: string) {
  const acces = await gardeRoute(orgSlug);
  if (!acces) return null;
  const brut = sportifDe(orgSlug, sportifId);
  // Le sportif doit appartenir à CETTE organisation, pas seulement exister.
  if (!brut) return null;
  const c = fusionnerReglees(brut, await regleesDe(acces.org.id, sportifId));
  return { acces, c };
}

export async function relancerParEmail(
  orgSlug: string,
  sportifId: string,
): Promise<ResultatRelance> {
  const ctx = await contexte(orgSlug, sportifId);
  if (!ctx) return { erreur: 'Accès refusé.' };

  const r = await envoyerRelanceEmail(ctx.c, ctx.acces.org.nom);
  if (!r.ok) return { erreur: r.motif };

  await noterRappel(ctx.acces.org.id, sportifId, 'email', ctx.acces.email);
  revalidatePath(`/agence/${orgSlug}/athlete/${sportifId}`);
  return { ok: `Reminder sent to ${r.adresse}.` };
}

export async function relancerParSms(
  orgSlug: string,
  sportifId: string,
): Promise<ResultatRelance> {
  const ctx = await contexte(orgSlug, sportifId);
  if (!ctx) return { erreur: 'Accès refusé.' };

  const r = await signalerSmsAEnvoyer(ctx.c, ctx.acces.org.nom, ctx.acces.email);
  if (!r.ok) return { erreur: r.motif };

  await noterRappel(ctx.acces.org.id, sportifId, 'sms', ctx.acces.email);
  revalidatePath(`/agence/${orgSlug}/athlete/${sportifId}`);
  return { ok: 'A text message will be sent shortly.' };
}

/* Cocher qu'une pièce est réglée ailleurs. Rien n'est déposé : on note que
   l'étudiant s'en est occupé, et la ligne cesse d'être rouge. */
export async function cocherReglee(orgSlug: string, sportifId: string, requirement: string) {
  const ctx = await contexte(orgSlug, sportifId);
  if (!ctx) return;
  if (!ctx.c.pieces.some((p) => p.requirement === requirement)) return;

  await marquerReglee(ctx.acces.org.id, sportifId, requirement, ctx.acces.email);
  revalidatePath(`/agence/${orgSlug}/athlete/${sportifId}`);
}

export async function decocherReglee(orgSlug: string, sportifId: string, requirement: string) {
  const ctx = await contexte(orgSlug, sportifId);
  if (!ctx) return;

  await annulerReglee(ctx.acces.org.id, sportifId, requirement);
  revalidatePath(`/agence/${orgSlug}/athlete/${sportifId}`);
}

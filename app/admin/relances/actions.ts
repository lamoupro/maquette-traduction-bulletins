'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { estConnecte } from '@/lib/auth';
import { db } from '@/lib/agence/db/client';
import { organisations } from '@/lib/agence/db/schema';
import { sportifDe } from '@/lib/agence/sportifs';
import { envoyerRelanceEmail } from '@/lib/agence/relance';
import { fusionnerReglees, noterRappel, regleesDe } from '@/lib/agence/suivi';

/* La relance envoyée depuis NOTRE administration.

   Même message, même expéditeur que depuis le portail du client : c'est la
   même fonction qui le construit. La seule différence est la porte — ici la
   session d'administration, là l'appartenance à l'organisation — et le nom
   qu'on inscrit dans le registre des rappels, pour qu'on sache plus tard qui
   a relancé, de l'agence ou de nous. */

export async function relancerDepuisAdmin(orgSlug: string, sportifId: string) {
  if (!(await estConnecte())) return { erreur: 'Non connecté.' };

  const org = await db.query.organisations.findFirst({
    where: eq(organisations.slug, orgSlug),
  });
  const brut = sportifDe(orgSlug, sportifId);
  if (!org || !brut) return { erreur: 'Dossier introuvable.' };

  const c = fusionnerReglees(brut, await regleesDe(org.id, sportifId));
  const r = await envoyerRelanceEmail(c, org.nom);
  if (!r.ok) return { erreur: r.motif };

  await noterRappel(org.id, sportifId, 'email', 'protranslayte (admin)');
  revalidatePath('/admin/relances');
  return { ok: `Envoyé à ${r.adresse}.` };
}

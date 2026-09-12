'use server';

import { revalidatePath } from 'next/cache';
import { gardeRoute } from '@/lib/agence/garde';
import { sportifDe } from '@/lib/agence/sportifs';
import { noterRappel, supprimerAjout } from '@/lib/agence/suivi';

/* Les gestes de la fiche. Chacun revérifie l'accès : une action serveur est
   une adresse comme une autre, atteignable sans jamais avoir affiché la page
   qui porte le bouton. */

export async function noterRappelEnvoye(
  orgSlug: string,
  sportifId: string,
  canal: 'email' | 'whatsapp',
) {
  const acces = await gardeRoute(orgSlug);
  if (!acces) return;
  // Le sportif doit appartenir à CETTE organisation, pas seulement exister.
  if (!sportifDe(orgSlug, sportifId)) return;

  await noterRappel(acces.org.id, sportifId, canal, acces.email);
  revalidatePath(`/agence/${orgSlug}/athlete/${sportifId}`);
}

export async function retirerAjout(orgSlug: string, sportifId: string, ajoutId: string) {
  const acces = await gardeRoute(orgSlug);
  if (!acces) return;

  /* On retire la ligne, pas le fichier : un document déposé par erreur se
     remplace, mais un document supprimé par erreur ne se retrouve pas. Le
     ménage du magasin est un geste à part, délibéré. */
  await supprimerAjout(acces.org.id, ajoutId);
  revalidatePath(`/agence/${orgSlug}/athlete/${sportifId}`);
}

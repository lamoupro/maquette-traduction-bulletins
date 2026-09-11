'use server';

import { headers } from 'next/headers';
import { AuthError } from 'next-auth';
import { signIn } from '@/lib/agence/auth';
import { organisation } from '@/lib/agence/organisations';
import { adresseAgence } from '@/lib/agence/host';

/* Redemander un lien depuis la page d'erreur.

   Ici l'organisation n'est pas connue : on arrive d'un lien mort, pas d'un
   sous-domaine. On la retrouve donc par le DOMAINE de l'adresse saisie — ce
   qui ne donne aucun droit au passage : envoyer un lien n'est pas accorder un
   accès, et l'appartenance reste vérifiée au retour, à /entree. */

export type EtatLien = { erreur?: string; envoye?: true; adresse?: string } | undefined;

export async function redemanderLien(_precedent: EtatLien, formData: FormData): Promise<EtatLien> {
  const adresse = String(formData.get('email') ?? '').trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(adresse)) {
    return { erreur: 'Enter a valid email address.' };
  }

  const org = await organisation({ parEmail: adresse });
  if (!org) {
    return {
      erreur: 'We don\'t recognise that domain. Use the work address your organisation gave you.',
    };
  }

  const hote = (await headers()).get('host');
  const proto = hote?.startsWith('localhost') ? 'http' : 'https';
  const retour = adresseAgence(org.slug, hote, '/entree', `${proto}://${hote}`);

  try {
    await signIn('resend', { email: adresse, redirectTo: retour });
  } catch (e) {
    if (e instanceof AuthError) return { erreur: 'Could not send the sign-in link. Try again.' };
    throw e;
  }
  return { envoye: true as const, adresse };
}

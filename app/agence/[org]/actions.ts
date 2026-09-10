'use server';

import { headers } from 'next/headers';
import { AuthError } from 'next-auth';
import { signIn } from '@/lib/agence/auth';
import { adresseAgence } from '@/lib/agence/host';
import { organisation } from '@/lib/agence/organisations';

/* Les trois portes d'entrée qui passent par une redirection : Google,
   Microsoft, et le lien magique. La passkey n'est pas ici — elle est un
   échange JavaScript direct, géré par Connexion.tsx et les routes sous
   app/api/agence-auth/passkey/, pas par une action serveur.

   Chacune renvoie vers /agence/[org]/entree, qui est le SEUL endroit qui
   décide si l'identité prouvée a le droit de voir cette organisation — voir
   lib/agence/acces.ts. Réussir la connexion Google ne veut encore rien dire
   ici, et « entree » est là pour ça.

   L'adresse de retour est ABSOLUE, et c'est nécessaire, pas décoratif : Google
   et Microsoft ne connaissent que protranslayte.com (voir la note dans
   lib/agence/auth.ts), donc un chemin relatif comme "/agence/trackhouse/entree"
   se résoudrait contre l'apex et laisserait l'utilisateur planté là après une
   connexion pourtant réussie, au lieu de le ramener sur
   trackhouse.protranslayte.com d'où il est parti. `adresseAgence` lit le vrai
   hôte de LA REQUÊTE EN COURS pour reconstruire la bonne adresse. */

async function retourApresEntree(orgSlug: string) {
  const hote = (await headers()).get('host');
  const proto = hote?.startsWith('localhost') ? 'http' : 'https';
  // "/entree" seulement : c'est adresseAgence() qui décide si l'adresse finale
  // reste courte (sous-domaine du client) ou longue (apex, local, tests).
  return adresseAgence(orgSlug, hote, '/entree', `${proto}://${hote}`);
}

export async function connexionGoogle(orgSlug: string) {
  await signIn('google', { redirectTo: await retourApresEntree(orgSlug) });
}

export async function connexionMicrosoft(orgSlug: string) {
  await signIn('microsoft-entra-id', { redirectTo: await retourApresEntree(orgSlug) });
}

export async function connexionEmail(orgSlug: string, formData: FormData) {
  const adresse = String(formData.get('email') ?? '').trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(adresse)) {
    return { erreur: 'Enter a valid email address.' };
  }

  /* Vérification de DOMAINE, ici seulement — c'est le point 4 du cahier des
     charges, spécifique au lien magique : « Vérifier que le domaine
     correspond à celui de l'agence » AVANT d'envoyer quoi que ce soit. Ça
     évite d'expédier un lien à une adresse qui échouera de toute façon à
     /entree, et ça donne un message plus utile que « lien envoyé » suivi
     d'un refus silencieux.

     Ce n'est qu'un filtre d'affichage : même une adresse du bon domaine
     repasse ensuite par la vérification d'appartenance ou d'invitation, qui
     seule décide de l'accès réel. */
  const org = await organisation({ slug: orgSlug });
  const domaines = org?.domaines?.map((d) => d.domaine) ?? [];
  if (domaines.length && !domaines.some((d) => adresse.endsWith(`@${d}`))) {
    return {
      erreur: `This portal is open to ${org?.nom ?? 'this organisation'} staff. Ask your organisation's admin to invite you.`,
    };
  }

  try {
    await signIn('resend', {
      email: adresse,
      redirectTo: await retourApresEntree(orgSlug),
    });
  } catch (e) {
    // Auth.js signale un envoi réussi en lançant une redirection : une
    // véritable erreur d'envoi arrive ici sous une autre forme.
    if (e instanceof AuthError) return { erreur: 'Could not send the sign-in link. Try again.' };
    throw e;
  }
  return { envoye: true as const, adresse };
}

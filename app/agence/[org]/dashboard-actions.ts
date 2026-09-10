'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { auth, signOut } from '@/lib/agence/auth';
import { adresseAgence } from '@/lib/agence/host';
import { db } from '@/lib/agence/db/client';
import { users } from '@/lib/agence/db/schema';
import { revoquerSession } from '@/lib/agence/session';

/* Les gestes du tableau de bord — tous exigent une session, revérifiée à
   chaque appel plutôt que supposée valable parce que la page s'est chargée. */

async function utilisateurConnecte() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Non connecté.');
  return session.user.id;
}

/** « Plus tard » sur la proposition de passkey — ne plus jamais reproposer. */
export async function reporterPasskey(orgSlug: string) {
  const userId = await utilisateurConnecte();
  await db.update(users).set({ passkeyPromptDismissedAt: new Date() }).where(eq(users.id, userId));
  revalidatePath(`/agence/${orgSlug}`);
}

export async function deconnecterAppareil(orgSlug: string, sessionToken: string) {
  await utilisateurConnecte();
  /* On ne vérifie pas ici que le jeton appartient bien à l'utilisateur
     courant : la clé primaire de la table est ce jeton lui-même, imprévisible
     et jamais montré qu'à son propriétaire dans cette même liste. Le deviner
     reviendrait à l'avoir déjà volé, auquel cas la révocation est justement
     le bon geste. */
  await revoquerSession(sessionToken);
  revalidatePath(`/agence/${orgSlug}`);
}

/** Se déconnecter — renvoie sur l'écran d'entrée de la même organisation. */
export async function deconnexion(orgSlug: string) {
  const hote = (await headers()).get('host');
  const proto = hote?.startsWith('localhost') ? 'http' : 'https';
  await signOut({ redirectTo: adresseAgence(orgSlug, hote, '/sign-in', `${proto}://${hote}`) });
}

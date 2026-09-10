import { and, desc, eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { db } from './db/client';
import { sessions } from './db/schema';

/* Les appareils connectés d'un utilisateur — la brique de la page « voir et
   déconnecter les autres sessions » demandée pour plus tard. La requête et
   l'action de révocation existent déjà ; seul un écran plus riche reste à
   construire quand ce sera son tour. */

export async function sessionsDe(userId: string) {
  return db.query.sessions.findMany({
    where: eq(sessions.userId, userId),
    orderBy: [desc(sessions.creeeLe)],
  });
}

/** Le jeton de CETTE requête, pour distinguer « cet appareil » des autres dans la liste. */
export async function jetonSessionActuelle() {
  const jar = await cookies();
  return jar.get('__Secure-authjs.session-token')?.value ?? jar.get('authjs.session-token')?.value;
}

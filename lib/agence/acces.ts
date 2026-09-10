import { and, eq } from 'drizzle-orm';
import { db } from './db/client';
import { invitations, membres, organisations } from './db/schema';
import type { Role } from './roles';

/* La décision d'accès elle-même — ce que lib/agence/auth.ts délègue ici
   délibérément, comme sa note d'en-tête l'explique.

   DEUX preuves valables, et deux seulement :

     1. une ligne `membre` ACTIVE pour (organisation, utilisateur) ;
     2. une `invitation` non expirée pour (organisation, cette adresse),
        auquel cas cette connexion la CONSOMME et crée le membre.

   Le domaine de l'adresse n'apparaît nulle part dans cette décision. Il sert
   ailleurs — lib/agence/organisations.ts — à deviner quelle marque afficher
   avant de savoir qui écrit, jamais à décider ce qu'on autorise. Un domaine
   dit qu'une adresse existe dans une entreprise ; il ne dit rien de qui, à
   l'intérieur, a le droit de voir des dossiers d'élèves. */

export type Acces =
  | { genre: 'accorde'; organisationId: string; role: Role }
  | { genre: 'refuse' };

export async function verifierAcces(organisationSlug: string, userId: string, email: string): Promise<Acces> {
  const org = await db.query.organisations.findFirst({
    where: eq(organisations.slug, organisationSlug),
  });
  if (!org) return { genre: 'refuse' };

  const membreActif = await db.query.membres.findFirst({
    where: and(
      eq(membres.organisationId, org.id),
      eq(membres.userId, userId),
      eq(membres.statut, 'actif'),
    ),
  });
  if (membreActif) return { genre: 'accorde', organisationId: org.id, role: membreActif.role };

  const emailBas = email.toLowerCase();
  const invitation = await db.query.invitations.findFirst({
    where: and(eq(invitations.organisationId, org.id), eq(invitations.email, emailBas)),
  });
  if (!invitation || invitation.accepteeLe || invitation.expireLe < new Date()) {
    return { genre: 'refuse' };
  }

  /* L'invitation se consomme ICI, à la première connexion réussie de
     l'adresse qu'elle visait — pas avant, puisqu'avant on ne sait pas encore
     que cette adresse a prouvé s'appartenir à quelqu'un. */
  const [membre] = await db
    .insert(membres)
    .values({ organisationId: org.id, userId, role: invitation.role })
    .onConflictDoUpdate({
      target: [membres.organisationId, membres.userId],
      set: { statut: 'actif', role: invitation.role, revoqueLe: null },
    })
    .returning();
  await db.update(invitations).set({ accepteeLe: new Date() }).where(eq(invitations.id, invitation.id));

  return { genre: 'accorde', organisationId: org.id, role: membre.role };
}

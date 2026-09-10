/* Invite une adresse à rejoindre une organisation. La seule façon d'accorder
   un accès aujourd'hui — il n'y a pas encore d'écran d'administration pour
   ça, seulement ce script.

   Exécution :
     npx tsx scripts/inviter.ts trackhouse jean@track-house.com owner

   Rôles valables : owner, admin, agent, viewer. */

import { db } from '../lib/agence/db/client';
import { invitations, organisations } from '../lib/agence/db/schema';
import { eq } from 'drizzle-orm';
import type { Role } from '../lib/agence/roles';

async function main() {
  const [slug, emailBrut, roleBrut] = process.argv.slice(2);
  const email = emailBrut?.trim().toLowerCase();
  const role = roleBrut as Role;

  if (!slug || !email || !['owner', 'admin', 'agent', 'viewer'].includes(role)) {
    console.error('Usage : npx tsx scripts/inviter.ts <slug> <email> <owner|admin|agent|viewer>');
    process.exit(1);
  }

  const org = await db.query.organisations.findFirst({ where: eq(organisations.slug, slug) });
  if (!org) {
    console.error('Organisation « %s » introuvable — lance scripts/seed-agence.ts d\'abord.', slug);
    process.exit(1);
  }

  const expireLe = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await db.insert(invitations).values({ organisationId: org.id, email, role, expireLe });

  console.log(
    'Invitation créée : %s pourra rejoindre %s en tant que %s dès sa première connexion sur /agence/%s/sign-in.',
    email, org.nom, role, org.slug,
  );
}

main().then(() => process.exit(0));

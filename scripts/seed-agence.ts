/* Crée l'organisation Trackhouse dans la base réelle — une fois, à la main.

   Exécution : npx tsx scripts/seed-agence.ts

   Ne crée AUCUN membre ni AUCUNE invitation : je n'ai pas d'adresse réelle
   chez Trackhouse à inviter. Une fois ce script passé, invite la première
   personne avec scripts/inviter.ts — voir SETUP-AGENCE-AUTH.md. */

import { db } from '../lib/agence/db/client';
import { organisationDomaines, organisations } from '../lib/agence/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const existante = await db.query.organisations.findFirst({
    where: eq(organisations.slug, 'trackhouse'),
  });
  if (existante) {
    console.log('« trackhouse » existe déjà (id %s) — rien à faire.', existante.id);
    return;
  }

  const [org] = await db
    .insert(organisations)
    .values({
      slug: 'trackhouse',
      nom: 'Trackhouse',
      /* Sous public/marques/, PAS public/demo-trackhouse/ : ce dernier est
         exclu du dépôt (voir .gitignore) et réservé à la maquette de
         démarchage — il n'existe pas sur un déploiement réel. Le vrai
         portail a besoin que ce fichier soit vraiment servi. */
      logo: '/marques/trackhouse-monogramme.png',
      logoLargeur: 263,
      logoHauteur: 240,
      // La même palette que la démonstration — voir app/portal/portal.css.
      couleurEncre: '#26221F',
      couleurSignature: '#E94A18',
      couleurVif: '#E94A18',
      couleurVifSombre: '#C63C11',
      couleurBoutonTexte: '#26221F',
    })
    .returning();

  await db.insert(organisationDomaines).values({ organisationId: org.id, domaine: 'track-house.com' });

  console.log('Organisation créée : %s (%s)', org.nom, org.id);
}

main().then(() => process.exit(0));

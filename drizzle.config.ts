import { defineConfig } from 'drizzle-kit';

/* Configuration de drizzle-kit — génère et applique les migrations SQL de la
   base réelle du portail agence. Rien à voir avec le reste du site : un seul
   schéma, celui de lib/agence/db/schema.ts.

   `POSTGRES_URL_NON_POOLING` plutôt que `POSTGRES_URL` : les migrations
   passent par des instructions DDL (CREATE TYPE, CREATE TABLE…) qui doivent
   s'exécuter sur une connexion directe, pas au travers du relais de connexions
   utilisé pour les requêtes de l'application. Les deux variables sont posées
   ensemble par l'intégration Vercel Postgres (Neon). */
export default defineConfig({
  schema: './lib/agence/db/schema.ts',
  out: './lib/agence/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.POSTGRES_URL_NON_POOLING ?? process.env.POSTGRES_URL ?? '',
  },
});

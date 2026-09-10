import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import * as schema from './schema';

/* Le client de la base réelle. ISOLÉ dans lib/agence/ : rien sous app/portal
   ni lib/portail-demo.ts ne l'importe, et rien ici n'importe la maquette de
   démarchage. Les deux systèmes ne se touchent jamais.

   `@vercel/postgres` lit `POSTGRES_URL` tout seul — c'est le nom de variable
   que pose l'intégration Vercel Postgres (Neon) dès qu'on l'active depuis le
   tableau de bord du projet. Rien à configurer d'autre côté code. */

export const db = drizzle(sql, { schema });

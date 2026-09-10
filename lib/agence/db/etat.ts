/* La base réelle est-elle configurée ? Un message clair plutôt que la
   première erreur Postgres venue, au même endroit que les autres gardes du
   projet (authConfiguree, demoConfiguree dans lib/auth.ts). */
export const dbConfiguree = () => Boolean(process.env.POSTGRES_URL);

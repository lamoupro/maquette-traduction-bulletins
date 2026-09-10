import { cache } from 'react';
import { eq } from 'drizzle-orm';
import { db } from './db/client';
import { organisationDomaines, organisations } from './db/schema';

/* Lecture d'une organisation. Deux entrées, pour deux usages qui ne doivent
   jamais se confondre :

   — par SLUG : pour afficher la bonne identité sur l'écran de connexion.
     C'est un usage d'AFFICHAGE, sans conséquence sur ce qu'on autorise.
   — par DOMAINE de l'adresse e-mail : pour deviner à quelle organisation
     s'adresse un lien de connexion envoyé par magie, avant même de savoir
     qui écrit. Là aussi, un usage d'affichage — le nom de l'organisation
     dans l'e-mail — jamais une preuve d'accès. */

/* `cache()` de React : mémoïse la lecture pour la durée d'UNE requête. Le
   gabarit et la page d'une même route lisent tous les deux l'organisation ;
   sans ce cache, chaque rendu referait la même requête. */
export const organisation = cache(async function organisation(
  critere: { slug: string } | { parEmail: string },
) {
  if ('slug' in critere) {
    return db.query.organisations.findFirst({
      where: eq(organisations.slug, critere.slug),
      with: { domaines: true },
    });
  }

  const domaine = critere.parEmail.split('@')[1]?.toLowerCase();
  if (!domaine) return undefined;

  const ligne = await db.query.organisationDomaines.findFirst({
    where: eq(organisationDomaines.domaine, domaine),
    with: { organisation: { with: { domaines: true } } },
  });
  return ligne?.organisation;
});

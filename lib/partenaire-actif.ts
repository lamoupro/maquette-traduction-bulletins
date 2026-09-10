import { cookies } from 'next/headers';
import { COOKIE_ORG, partenaire, type Partenaire } from './portail-demo';

/* Le partenaire dont on porte les couleurs, pour la requête en cours.

   Il vient d'un COOKIE, et non d'un paramètre d'adresse. La raison est
   pratique : sans cela, chaque lien du portail devrait transporter le
   partenaire, et il suffirait d'en oublier un pour que la démonstration
   reprenne les couleurs de quelqu'un d'autre au milieu d'une présentation.

   C'est une préférence d'affichage, pas un droit d'accès : elle ne décide de
   rien d'autre que du logo et de la palette. Ce qu'on a le droit de voir est
   décidé ailleurs, par la garde de session. */
export const partenaireActif = async (): Promise<Partenaire> =>
  partenaire((await cookies()).get(COOKIE_ORG)?.value);

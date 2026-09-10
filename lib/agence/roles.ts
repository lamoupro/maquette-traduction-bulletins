/* Les rôles d'une organisation, et ce que chacun peut faire.

   Quatre rôles, dans un ordre de pouvoir croissant :

     viewer   consulte les dossiers. Rien d'autre.
     agent    ce que fait un viewer, et gère les dossiers de ses sportifs —
              dépose, relance, télécharge.
     admin    ce que fait un agent, et gère les MEMBRES : invite, change un
              rôle, révoque un accès.
     owner    ce que fait un admin, et ne peut pas être révoqué par un autre
              admin — seul un autre owner le peut, ou lui-même. Il en faut
              toujours au moins un : la dernière fonction du fichier
              l'empêche de disparaître.

   Le pouvoir est strictement croissant : chaque rôle hérite de tout ce que
   peut le précédent. Pas de permission isolée qu'un rôle aurait sans avoir
   les autres — ça simplifie chaque vérification à une seule comparaison. */

import type { roleEnum } from './db/schema';

export type Role = (typeof roleEnum.enumValues)[number];

const RANG: Record<Role, number> = { viewer: 0, agent: 1, admin: 2, owner: 3 };

/** Le rôle `voulu` suffit-il, sachant que le rôle `donne` a été accordé ? */
export const suffit = (donne: Role, voulu: Role) => RANG[donne] >= RANG[voulu];

export const peutGererMembres = (r: Role) => suffit(r, 'admin');
export const peutGererDossiers = (r: Role) => suffit(r, 'agent');
export const peutRevoquer = (acteur: Role, cible: Role) =>
  suffit(acteur, 'admin') && (acteur === 'owner' || cible !== 'owner');

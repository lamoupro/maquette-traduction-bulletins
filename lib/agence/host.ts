/* Le sous-domaine porte l'organisation — trackhouse.protranslayte.com,
   demain un autre client sur un autre sous-domaine, sans repasser par Google
   ni Microsoft : leurs applications ne connaissent QUE protranslayte.com
   (voir la note dans lib/agence/auth.ts). Ce fichier concentre les quelques
   fonctions pures qui font le lien entre les deux mondes — assez neutre pour
   tourner aussi bien dans middleware.ts (exécuté en Edge) que côté serveur. */

const RACINE = 'protranslayte.com';

/** L'organisation portée par un sous-domaine, ou rien si ce n'en est pas un. */
export function orgDuSousDomaine(hoteBrut: string | null | undefined): string | null {
  if (!hoteBrut) return null;
  // Le port ("localhost:3000") n'a rien à faire dans cette comparaison.
  const hote = hoteBrut.split(':')[0].toLowerCase();
  if (hote === RACINE || hote === `www.${RACINE}`) return null;
  if (!hote.endsWith(`.${RACINE}`)) return null;

  const sous = hote.slice(0, -(RACINE.length + 1));
  // Un seul niveau : "trackhouse", jamais "a.trackhouse" — au-delà, ce n'est
  // plus une organisation qu'on reconnaît.
  return sous && !sous.includes('.') ? sous : null;
}

/* L'adresse d'une page du portail, écrite pour rester cohérente avec la façon
   dont on y est arrivé.

   Sur le sous-domaine d'un client, l'organisation est déjà dans l'hôte : le
   chemin reste court ("/entree", pas "/agence/trackhouse/entree"), et c'est
   ce que la barre d'adresse du visiteur affichera après une redirection. Sur
   l'apex, en local, ou dans les tests, le chemin long reste la seule façon de
   désigner l'organisation. */
export function adresseAgence(
  orgSlug: string,
  hoteBrut: string | null | undefined,
  suite: string,
  origineUrl: string,
): string {
  const proto = new URL(origineUrl).protocol;
  if (orgDuSousDomaine(hoteBrut) === orgSlug) {
    return `${proto}//${hoteBrut}${suite}`;
  }
  return new URL(`/agence/${orgSlug}${suite}`, origineUrl).toString();
}

/* Le domaine du cookie de session, en production seulement.

   `.protranslayte.com` (avec le point en tête) rend le cookie lisible sur
   TOUS les sous-domaines — c'est ce qui permet à une connexion Google, dont
   l'échange se termine forcément sur l'apex (voir plus haut), de rester valable
   une fois l'utilisateur renvoyé sur trackhouse.protranslayte.com.

   `undefined` ailleurs : en local, un cookie à domaine pointé ne s'applique
   pas à "localhost", et sur les déploiements de prévisualisation Vercel
   (des adresses *.vercel.app sans rapport avec protranslayte.com) le poser
   serait simplement ignoré par le navigateur — autant laisser le
   comportement par défaut, exact pour l'hôte de la requête. */
export const domaineCookieAgence = (): string | undefined =>
  process.env.VERCEL_ENV === 'production' ? `.${RACINE}` : undefined;

/* L'identifiant du "relying party" WebAuthn — voir lib/agence/webauthn.ts.

   Une passkey enregistrée en visitant TROIS points d'entrée différents doit
   fonctionner sur les trois : la norme WebAuthn permet justement de déclarer
   un identifiant qui est le domaine racine plutôt que l'hôte exact, du moment
   que l'hôte réel en est un sous-domaine — exactement notre cas. Sans ça, une
   passkey créée sur trackhouse.protranslayte.com serait inutilisable pour un
   autre client sur un autre sous-domaine. */
export const rpIDRacine = (hostname: string): string =>
  hostname === RACINE || hostname.endsWith(`.${RACINE}`) ? RACINE : hostname;

import { cookies } from 'next/headers';
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import { eq } from 'drizzle-orm';
import { db } from './db/client';
import { authenticators } from './db/schema';
import { rpIDRacine } from './host';

/* La cérémonie WebAuthn — Face ID, Touch ID, Windows Hello, et tout gestionnaire
   de passkeys compatible. Compatible signifie : n'importe lequel, WebAuthn ne
   distingue pas le matériel, seulement le protocole.

   Le fournisseur passkey livré avec Auth.js n'est PAS utilisé ici : il
   dépend d'une version de @simplewebauthn/server bien plus ancienne que
   celle posée dans ce projet, avec une forme de réponse différente. On
   pilote donc la cérémonie nous-mêmes, avec la bibliothèque à jour — ce
   fichier et les quatre routes sous app/api/agence-auth/passkey/.

   RP ID ET ORIGINE : calculés depuis la requête, jamais codés en dur. Ça
   marche sans rien configurer, aussi bien en local (rpID "localhost") qu'en
   production.

   Les deux valeurs ne se calculent PAS de la même façon, et c'est volontaire.
   `origin` reste l'hôte exact — WebAuthn l'exige au caractère près, c'est ce
   qui garantit qu'une passkey n'est utilisable que sur le site qui l'a créée.
   `rpID`, lui, remonte au domaine RACINE (protranslayte.com) dès que l'hôte
   en est un sous-domaine : la norme l'autorise explicitement — un « relying
   party » peut se déclarer sur un domaine dont l'hôte réel est un
   sous-domaine — et c'est ce qui permet à une passkey enregistrée sur
   trackhouse.protranslayte.com de fonctionner aussi pour un autre client sur
   un autre sous-domaine. Sans cet élargissement, chaque organisation aurait
   sa propre passkey isolée, sans rapport avec les autres. */
export function identiteRP(requete: Request) {
  const url = new URL(requete.url);
  return { rpID: rpIDRacine(url.hostname), origin: url.origin };
}

/* Le défi (« challenge ») doit survivre entre l'appel qui le génère et celui
   qui vérifie la réponse, sans pouvoir être rejoué ni deviné. Un cookie
   httpOnly de courte durée, plutôt qu'une table : il n'y a rien d'autre à en
   tirer, et une ligne de plus en base pour cinq minutes de vie ne se justifie
   pas. */
const COOKIE_DEFI = 'pt_agence_webauthn_defi';

export async function poserDefi(defi: string) {
  (await cookies()).set(COOKIE_DEFI, defi, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/api/agence-auth/passkey',
    secure: true,
    maxAge: 5 * 60,
  });
}

export async function lireEtEffacerDefi() {
  const jar = await cookies();
  const defi = jar.get(COOKIE_DEFI)?.value;
  jar.delete(COOKIE_DEFI);
  return defi;
}

/* ---------- Enregistrement d'une passkey ----------
   Toujours pour un compte DÉJÀ connecté : on ne crée jamais un utilisateur
   par ce chemin, seulement une seconde façon, pour lui, de prouver qui il
   est la prochaine fois. */

export async function optionsEnregistrement(requete: Request, userId: string, email: string) {
  const { rpID } = identiteRP(requete);
  const existantes = await db.query.authenticators.findMany({
    where: eq(authenticators.userId, userId),
  });

  const options = await generateRegistrationOptions({
    rpName: 'Protranslayte',
    rpID,
    userID: new Uint8Array(Buffer.from(userId, 'utf8')),
    userName: email,
    attestationType: 'none',
    /* Empêche de proposer d'enregistrer deux fois LE MÊME appareil pour la
       même personne — le navigateur le refusera de lui-même si on le lui dit. */
    excludeCredentials: existantes.map((a) => ({
      id: a.credentialID,
      transports: (a.transports?.split(',') as AuthenticatorTransport[]) || undefined,
    })),
    authenticatorSelection: {
      /* Clé RÉSIDENTE — c'est elle qui permet ensuite de se connecter sans
         taper d'adresse : l'appareil sait lui-même quelle identité proposer. */
      residentKey: 'required',
      userVerification: 'preferred',
    },
  });

  await poserDefi(options.challenge);
  return options;
}

export async function verifierEnregistrement(
  requete: Request,
  userId: string,
  reponse: Parameters<typeof verifyRegistrationResponse>[0]['response'],
  nomAppareil?: string,
) {
  const { rpID, origin } = identiteRP(requete);
  const challenge = await lireEtEffacerDefi();
  if (!challenge) return { verifie: false as const, motif: 'Défi expiré ou déjà utilisé.' };

  const resultat = await verifyRegistrationResponse({
    response: reponse,
    expectedChallenge: challenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
  });
  if (!resultat.verified || !resultat.registrationInfo) {
    return { verifie: false as const, motif: 'Vérification refusée.' };
  }

  const { credential, credentialDeviceType, credentialBackedUp } = resultat.registrationInfo;
  await db.insert(authenticators).values({
    credentialID: credential.id,
    userId,
    providerAccountId: userId,
    credentialPublicKey: Buffer.from(credential.publicKey).toString('base64url'),
    counter: credential.counter,
    credentialDeviceType,
    credentialBackedUp,
    transports: credential.transports?.join(','),
    nom: nomAppareil,
  });

  return { verifie: true as const };
}

/* ---------- Connexion par passkey ----------
   SANS adresse préalable : `allowCredentials` reste vide, ce qui laisse le
   navigateur proposer lui-même les identités qu'il connaît pour ce site —
   l'usage « sans nom d'utilisateur » que permet une clé résidente. */

export async function optionsAuthentification(requete: Request) {
  const { rpID } = identiteRP(requete);
  const options = await generateAuthenticationOptions({ rpID, userVerification: 'preferred' });
  await poserDefi(options.challenge);
  return options;
}

export async function verifierAuthentification(
  requete: Request,
  reponse: Parameters<typeof verifyAuthenticationResponse>[0]['response'],
) {
  const { rpID, origin } = identiteRP(requete);
  const challenge = await lireEtEffacerDefi();
  if (!challenge) return { verifie: false as const, motif: 'Défi expiré ou déjà utilisé.' };

  const stockee = await db.query.authenticators.findFirst({
    where: eq(authenticators.credentialID, reponse.id),
  });
  if (!stockee) return { verifie: false as const, motif: 'Passkey inconnue.' };

  const resultat = await verifyAuthenticationResponse({
    response: reponse,
    expectedChallenge: challenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    credential: {
      id: stockee.credentialID,
      publicKey: new Uint8Array(Buffer.from(stockee.credentialPublicKey, 'base64url')),
      counter: stockee.counter,
      transports: stockee.transports?.split(',') as AuthenticatorTransport[] | undefined,
    },
  });
  if (!resultat.verified) return { verifie: false as const, motif: 'Vérification refusée.' };

  // Le compteur d'usages protège contre le rejeu d'une empreinte clonée : on
  // le met à jour à CHAQUE connexion, jamais seulement à l'enregistrement.
  await db
    .update(authenticators)
    .set({ counter: resultat.authenticationInfo.newCounter })
    .where(eq(authenticators.credentialID, stockee.credentialID));

  return { verifie: true as const, userId: stockee.userId };
}

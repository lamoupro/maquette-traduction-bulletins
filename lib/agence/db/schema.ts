/* Le schéma de la base réelle du portail agence.

   « Réelle » par opposition à lib/portail-demo.ts : celui-là reste une
   maquette de démarchage, entièrement en mémoire, et ne doit pas être touché
   par ce fichier ni par rien de ce qui en dépend. Les deux systèmes vivent
   côte à côte sans jamais se croiser — voir la note en tête de
   lib/agence/auth.ts.

   ORGANISATION → UTILISATEURS → RÔLES → (sportifs, documents plus tard).

   Les tables user / account / session / verificationToken / authenticator
   suivent exactement la forme attendue par @auth/drizzle-adapter (voir
   node_modules/@auth/drizzle-adapter/lib/pg.js) : les noms de colonnes ne se
   changent pas, l'adaptateur les lit par leur nom. On les étend plutôt que de
   les redéfinir — `passkeyPromptDismissedAt` par exemple. */

import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import type { AdapterAccountType } from 'next-auth/adapters';

/* ---------- Comptes (adaptateur Auth.js) ---------- */

export const users = pgTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
  /* Horodatage de la réponse « Plus tard » à la proposition de passkey. Tant
     qu'il est vide, la proposition peut s'afficher ; une fois posé, jamais
     plus — c'est la règle demandée : « ne pas reproposer à chaque connexion ». */
  passkeyPromptDismissedAt: timestamp('passkeyPromptDismissedAt', { mode: 'date' }),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
});

export const accounts = pgTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    /** 'google' | 'microsoft-entra-id' */
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })],
);

/* Sessions en BASE, et pas en JETON signé : c'est la condition de la
   révocation. Un JWT auto-porteur reste valable jusqu'à expiration même si on
   « supprime » l'utilisateur ; une ligne qu'on efface ici coupe l'accès à la
   requête suivante. C'est ce que demande la fiche : « prévoir la révocation
   des sessions si un utilisateur est retiré de l'agence ». */
export const sessions = pgTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
  /* Hors du schéma standard de l'adaptateur, ajoutés pour la future page
     « voir et déconnecter les autres appareils » : de quoi distinguer une
     session d'une autre sans deviner. */
  userAgent: text('userAgent'),
  creeeLe: timestamp('creeeLe', { mode: 'date' }).notNull().defaultNow(),
});

export const verificationTokens = pgTable(
  'verificationToken',
  {
    /** L'adresse e-mail, pour le lien de connexion. */
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

/* Les passkeys. Le fournisseur passkey intégré d'Auth.js n'est pas utilisé —
   il dépend d'une version ancienne de @simplewebauthn/server, incompatible
   avec celle posée ici — mais la table garde la forme que cet adaptateur
   attend, au cas où on migre vers lui un jour. La cérémonie elle-même est
   dans lib/agence/webauthn.ts. */
export const authenticators = pgTable(
  'authenticator',
  {
    credentialID: text('credentialID').notNull().unique(),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    providerAccountId: text('providerAccountId').notNull(),
    credentialPublicKey: text('credentialPublicKey').notNull(),
    counter: integer('counter').notNull(),
    credentialDeviceType: text('credentialDeviceType').notNull(),
    credentialBackedUp: boolean('credentialBackedUp').notNull(),
    transports: text('transports'),
    /** Pour que l'utilisateur reconnaisse SA clé dans une future liste. */
    nom: text('nom'),
    creeeLe: timestamp('creeeLe', { mode: 'date' }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.credentialID] })],
);

/* ---------- Organisations ---------- */

export const roleEnum = pgEnum('role_membre', ['owner', 'admin', 'agent', 'viewer']);

export const organisations = pgTable('organisation', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  /** Identifiant d'URL : /agence/[slug]/sign-in. Stable, jamais réutilisé. */
  slug: text('slug').notNull().unique(),
  nom: text('nom').notNull(),
  /* Couleurs et logo repris de la même charte que la démonstration
     (lib/portail-demo.ts, public/demo-trackhouse/) pour que l'écran de
     connexion réel porte la même identité — mais lus ici depuis la base,
     jamais depuis un cookie modifiable par le visiteur. Un chemin sous
     /public, comme les organisations de la démo.

     Quatre teintes seulement : ce sont exactement les jetons que lit
     app/portal/portal.css (`--pt-p-encre`, `--pt-p-signature`, `--pt-vif`,
     `--pt-vif-sombre`) plus la couleur de texte que l'aplat vif supporte. Pas
     une palette entière en base — le reste (fond, filets, teintes d'état)
     vient du même calcul clair/sombre que la démonstration, pas d'un réglage
     par organisation qui finirait presque toujours identique d'une agence à
     l'autre. */
  logo: text('logo').notNull(),
  logoLargeur: integer('logoLargeur').notNull(),
  logoHauteur: integer('logoHauteur').notNull(),
  couleurEncre: text('couleurEncre').notNull(),
  couleurSignature: text('couleurSignature').notNull(),
  couleurVif: text('couleurVif').notNull(),
  couleurVifSombre: text('couleurVifSombre').notNull(),
  couleurBoutonTexte: text('couleurBoutonTexte').notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
});

/* Domaines d'une organisation — pluriel, une agence peut en tenir plusieurs.
   USAGE STRICTEMENT LIMITÉ À L'AFFICHAGE : reconnaître à quelle organisation
   correspond une adresse pour montrer la bonne marque avant la connexion, ou
   pré-remplir un domaine attendu. Ce n'est PAS un droit d'accès — voir la
   note dans lib/agence/auth.ts, qui explique pourquoi le domaine seul ne
   suffit jamais. */
export const organisationDomaines = pgTable(
  'organisation_domaine',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    organisationId: text('organisationId')
      .notNull()
      .references(() => organisations.id, { onDelete: 'cascade' }),
    domaine: text('domaine').notNull().unique(),
  },
  (t) => [index('organisation_domaine_org_idx').on(t.organisationId)],
);

/* L'appartenance à une organisation — LA seule chose qui autorise un accès.
   Un utilisateur peut appartenir à plusieurs organisations (un consultant qui
   travaille avec deux agences, par exemple) ; chaque ligne porte son propre
   rôle. `statut` reste séparé de « ligne supprimée » : révoquer doit se voir
   dans un journal, pas disparaître sans trace. */
export const statutMembreEnum = pgEnum('statut_membre', ['actif', 'revoque']);

export const membres = pgTable(
  'membre',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    organisationId: text('organisationId')
      .notNull()
      .references(() => organisations.id, { onDelete: 'cascade' }),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: roleEnum('role').notNull(),
    statut: statutMembreEnum('statut').notNull().default('actif'),
    creeeLe: timestamp('creeeLe', { mode: 'date' }).notNull().defaultNow(),
    revoqueLe: timestamp('revoqueLe', { mode: 'date' }),
  },
  (t) => [
    uniqueIndex('membre_org_user_idx').on(t.organisationId, t.userId),
    index('membre_user_idx').on(t.userId),
  ],
);

/* Invitation d'une adresse qui n'a pas encore de compte — ou qui en a un,
   mais pas encore rattaché à cette organisation. C'est l'AUTRE preuve
   d'autorisation valable, avec l'appartenance active : voir
   lib/agence/auth.ts. Elle se consomme à la première connexion réussie de
   cette adresse et devient un `membre`. */
export const invitations = pgTable(
  'invitation',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    organisationId: text('organisationId')
      .notNull()
      .references(() => organisations.id, { onDelete: 'cascade' }),
    /** Toujours en minuscules — c'est ce que compare la connexion. */
    email: text('email').notNull(),
    role: roleEnum('role').notNull(),
    invitePar: text('invitePar').references(() => users.id),
    creeeLe: timestamp('creeeLe', { mode: 'date' }).notNull().defaultNow(),
    expireLe: timestamp('expireLe', { mode: 'date' }).notNull(),
    accepteeLe: timestamp('accepteeLe', { mode: 'date' }),
  },
  (t) => [index('invitation_org_email_idx').on(t.organisationId, t.email)],
);

/* ---------- Relations ----------

   Nécessaires pour les lectures relationnelles (`db.query....findFirst({
   with: {...} })`) utilisées dans lib/agence/organisations.ts et
   lib/agence/acces.ts — sans elles, Drizzle ne sait pas comment joindre ces
   tables entre elles. */

export const organisationDomainesRelations = relations(organisationDomaines, ({ one }) => ({
  organisation: one(organisations, {
    fields: [organisationDomaines.organisationId],
    references: [organisations.id],
  }),
}));

export const membresRelations = relations(membres, ({ one }) => ({
  organisation: one(organisations, {
    fields: [membres.organisationId],
    references: [organisations.id],
  }),
  user: one(users, { fields: [membres.userId], references: [users.id] }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  organisation: one(organisations, {
    fields: [invitations.organisationId],
    references: [organisations.id],
  }),
}));

export const organisationsRelations = relations(organisations, ({ many }) => ({
  domaines: many(organisationDomaines),
  membres: many(membres),
  invitations: many(invitations),
}));

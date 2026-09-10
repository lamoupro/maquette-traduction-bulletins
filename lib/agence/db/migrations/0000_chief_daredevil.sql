CREATE TYPE "public"."role_membre" AS ENUM('owner', 'admin', 'agent', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."statut_membre" AS ENUM('actif', 'revoque');--> statement-breakpoint
CREATE TABLE "account" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "authenticator" (
	"credentialID" text NOT NULL,
	"userId" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"credentialPublicKey" text NOT NULL,
	"counter" integer NOT NULL,
	"credentialDeviceType" text NOT NULL,
	"credentialBackedUp" boolean NOT NULL,
	"transports" text,
	"nom" text,
	"creeeLe" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "authenticator_userId_credentialID_pk" PRIMARY KEY("userId","credentialID"),
	CONSTRAINT "authenticator_credentialID_unique" UNIQUE("credentialID")
);
--> statement-breakpoint
CREATE TABLE "invitation" (
	"id" text PRIMARY KEY NOT NULL,
	"organisationId" text NOT NULL,
	"email" text NOT NULL,
	"role" "role_membre" NOT NULL,
	"invitePar" text,
	"creeeLe" timestamp DEFAULT now() NOT NULL,
	"expireLe" timestamp NOT NULL,
	"accepteeLe" timestamp
);
--> statement-breakpoint
CREATE TABLE "membre" (
	"id" text PRIMARY KEY NOT NULL,
	"organisationId" text NOT NULL,
	"userId" text NOT NULL,
	"role" "role_membre" NOT NULL,
	"statut" "statut_membre" DEFAULT 'actif' NOT NULL,
	"creeeLe" timestamp DEFAULT now() NOT NULL,
	"revoqueLe" timestamp
);
--> statement-breakpoint
CREATE TABLE "organisation_domaine" (
	"id" text PRIMARY KEY NOT NULL,
	"organisationId" text NOT NULL,
	"domaine" text NOT NULL,
	CONSTRAINT "organisation_domaine_domaine_unique" UNIQUE("domaine")
);
--> statement-breakpoint
CREATE TABLE "organisation" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"nom" text NOT NULL,
	"logo" text NOT NULL,
	"logoLargeur" integer NOT NULL,
	"logoHauteur" integer NOT NULL,
	"couleurEncre" text NOT NULL,
	"couleurSignature" text NOT NULL,
	"couleurVif" text NOT NULL,
	"couleurVifSombre" text NOT NULL,
	"couleurBoutonTexte" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organisation_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL,
	"userAgent" text,
	"creeeLe" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"emailVerified" timestamp,
	"image" text,
	"passkeyPromptDismissedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "authenticator" ADD CONSTRAINT "authenticator_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organisationId_organisation_id_fk" FOREIGN KEY ("organisationId") REFERENCES "public"."organisation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_invitePar_user_id_fk" FOREIGN KEY ("invitePar") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membre" ADD CONSTRAINT "membre_organisationId_organisation_id_fk" FOREIGN KEY ("organisationId") REFERENCES "public"."organisation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membre" ADD CONSTRAINT "membre_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organisation_domaine" ADD CONSTRAINT "organisation_domaine_organisationId_organisation_id_fk" FOREIGN KEY ("organisationId") REFERENCES "public"."organisation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "invitation_org_email_idx" ON "invitation" USING btree ("organisationId","email");--> statement-breakpoint
CREATE UNIQUE INDEX "membre_org_user_idx" ON "membre" USING btree ("organisationId","userId");--> statement-breakpoint
CREATE INDEX "membre_user_idx" ON "membre" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "organisation_domaine_org_idx" ON "organisation_domaine" USING btree ("organisationId");
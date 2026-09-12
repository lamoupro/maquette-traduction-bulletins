CREATE TYPE "public"."canal_rappel" AS ENUM('email', 'whatsapp');--> statement-breakpoint
CREATE TABLE "piece_ajoutee" (
	"id" text PRIMARY KEY NOT NULL,
	"organisationId" text NOT NULL,
	"sportifId" text NOT NULL,
	"requirement" text NOT NULL,
	"chemin" text NOT NULL,
	"nomFichier" text NOT NULL,
	"pages" integer,
	"ajouteLe" timestamp DEFAULT now() NOT NULL,
	"ajoutePar" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rappel" (
	"id" text PRIMARY KEY NOT NULL,
	"organisationId" text NOT NULL,
	"sportifId" text NOT NULL,
	"canal" "canal_rappel" NOT NULL,
	"envoyeLe" timestamp DEFAULT now() NOT NULL,
	"envoyePar" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "piece_ajoutee" ADD CONSTRAINT "piece_ajoutee_organisationId_organisation_id_fk" FOREIGN KEY ("organisationId") REFERENCES "public"."organisation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rappel" ADD CONSTRAINT "rappel_organisationId_organisation_id_fk" FOREIGN KEY ("organisationId") REFERENCES "public"."organisation"("id") ON DELETE cascade ON UPDATE no action;
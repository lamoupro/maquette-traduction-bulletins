-- Écrit à la main : drizzle-kit demande, en mode interactif, si le passage de
-- « piece_ajoutee » à « piece_reglee » est un renommage ou une suppression.
-- C'est une suppression : on ne dépose plus de document, on coche seulement
-- qu'une pièce a été réglée ailleurs.
ALTER TYPE "public"."canal_rappel" ADD VALUE IF NOT EXISTS 'sms';--> statement-breakpoint
DROP TABLE IF EXISTS "piece_ajoutee";--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "piece_reglee" (
	"id" text PRIMARY KEY NOT NULL,
	"organisationId" text NOT NULL,
	"sportifId" text NOT NULL,
	"requirement" text NOT NULL,
	"regleeLe" timestamp DEFAULT now() NOT NULL,
	"regleePar" text NOT NULL
);--> statement-breakpoint
ALTER TABLE "piece_reglee" ADD CONSTRAINT "piece_reglee_organisationId_organisation_id_fk" FOREIGN KEY ("organisationId") REFERENCES "public"."organisation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "reglee_par_piece" ON "piece_reglee" ("organisationId","sportifId","requirement");

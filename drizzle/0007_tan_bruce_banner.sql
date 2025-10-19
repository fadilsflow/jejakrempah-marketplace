CREATE TABLE "payout" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"status" text,
	"transaction_id" text,
	"bank_name" text NOT NULL,
	"account_number" text NOT NULL,
	"account_holder_name" text NOT NULL,
	"notes" text,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "payout" ADD CONSTRAINT "payout_store_id_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."store"("id") ON DELETE cascade ON UPDATE no action;
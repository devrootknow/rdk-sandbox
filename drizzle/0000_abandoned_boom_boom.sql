CREATE TABLE "rdk_agents" (
	"id" serial PRIMARY KEY NOT NULL,
	"machine" varchar(50) NOT NULL,
	"port" integer NOT NULL,
	"role" varchar(50) NOT NULL,
	"status" varchar(20) DEFAULT 'offline' NOT NULL,
	"context_percent" integer,
	"active_task" text,
	"last_heartbeat" timestamp with time zone
);

CREATE TYPE "public"."message_type" AS ENUM('text', 'tool_call');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'assistant');
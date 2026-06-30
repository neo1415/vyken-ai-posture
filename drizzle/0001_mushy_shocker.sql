ALTER TABLE "ai_tool_profile_versions" ADD COLUMN "sources" jsonb;--> statement-breakpoint
ALTER TABLE "ai_tool_profile_versions" ADD COLUMN "review_notes" text;--> statement-breakpoint
ALTER TABLE "ai_tool_profile_versions" ADD COLUMN "source_confidence_notes" text;
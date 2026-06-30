CREATE TYPE "public"."admin_role" AS ENUM('viewer', 'editor', 'superadmin');--> statement-breakpoint
CREATE TYPE "public"."answer_type" AS ENUM('single_select', 'multi_select', 'card_select', 'chip_select', 'text_optional', 'email', 'boolean', 'range_select');--> statement-breakpoint
CREATE TYPE "public"."assessment_status" AS ENUM('started', 'completed', 'abandoned', 'report_requested', 'report_generated', 'report_failed');--> statement-breakpoint
CREATE TYPE "public"."audit_actor_type" AS ENUM('system', 'admin', 'anonymous_server_flow');--> statement-breakpoint
CREATE TYPE "public"."confidence_level" AS ENUM('high', 'medium', 'low', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."cta_destination_type" AS ENUM('book_call', 'vyken_guard', 'vyken_registration', 'ai_risk_index', 'request_review');--> statement-breakpoint
CREATE TYPE "public"."cta_event_type" AS ENUM('book_call_clicked', 'vyken_guard_clicked', 'vyken_registration_clicked', 'ai_risk_index_clicked', 'request_review_clicked');--> statement-breakpoint
CREATE TYPE "public"."email_status" AS ENUM('pending', 'sent', 'failed', 'bounced');--> statement-breakpoint
CREATE TYPE "public"."lead_event_type" AS ENUM('report_requested', 'report_sent', 'cta_clicked', 'booked_call_clicked', 'status_changed', 'note_added');--> statement-breakpoint
CREATE TYPE "public"."lead_status" AS ENUM('new', 'contacted', 'qualified', 'booked', 'not_ready', 'closed', 'ignore_spam');--> statement-breakpoint
CREATE TYPE "public"."published_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('pending', 'generated', 'failed', 'expired');--> statement-breakpoint
CREATE TYPE "public"."risk_level" AS ENUM('low', 'moderate', 'high', 'critical', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."tool_selection_type" AS ENUM('known_tool', 'unknown_tool', 'not_sure');--> statement-breakpoint
CREATE TYPE "public"."unknown_tool_request_status" AS ENUM('new', 'in_review', 'added', 'rejected', 'duplicate');--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"full_name" text,
	"role" "admin_role" DEFAULT 'viewer' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_tool_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_tool_profile_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tool_id" uuid NOT NULL,
	"profile_version" text NOT NULL,
	"common_use_cases" jsonb,
	"supports_file_uploads" boolean,
	"supports_meeting_transcripts" boolean,
	"coding_assistant_relevance" boolean,
	"agentic_or_connected_tool_relevance" boolean,
	"public_privacy_url" text,
	"public_security_url" text,
	"public_trust_url" text,
	"training_use_notes" text,
	"data_retention_notes" text,
	"deletion_control_notes" text,
	"enterprise_admin_controls_notes" text,
	"audit_logging_notes" text,
	"compliance_security_docs_notes" text,
	"subprocessor_notes" text,
	"sensitive_data_concerns" text,
	"recommended_usage_boundaries" text,
	"public_info_confidence_level" "confidence_level" DEFAULT 'unknown' NOT NULL,
	"last_reviewed_at" timestamp with time zone,
	"reviewed_by" text,
	"published_status" "published_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_tools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"website_url" text,
	"logo_key" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessment_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_session_id" uuid NOT NULL,
	"question_id" text NOT NULL,
	"section_id" text NOT NULL,
	"answer_type" "answer_type" NOT NULL,
	"answer_value" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessment_company_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_session_id" uuid NOT NULL,
	"company_name" text,
	"country_region" text,
	"industry" text NOT NULL,
	"company_size" text NOT NULL,
	"respondent_role" text,
	"department_function" text,
	"handles_sensitive_or_regulated_data" text,
	"main_ai_concerns" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessment_findings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_session_id" uuid NOT NULL,
	"finding_key" text NOT NULL,
	"title" text NOT NULL,
	"severity" "risk_level" NOT NULL,
	"summary" text NOT NULL,
	"framework_mapping" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessment_recommendations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_session_id" uuid NOT NULL,
	"recommendation_key" text NOT NULL,
	"title" text NOT NULL,
	"severity" "risk_level" NOT NULL,
	"recommended_actions" jsonb,
	"framework_mapping" jsonb,
	"cta_type" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessment_risk_signals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_session_id" uuid NOT NULL,
	"signal_key" text NOT NULL,
	"severity" "risk_level" NOT NULL,
	"source_answer_ids" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessment_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_session_id" uuid NOT NULL,
	"overall_risk_level" "risk_level" NOT NULL,
	"tool_stack_risk_level" "risk_level" NOT NULL,
	"data_exposure_risk_level" "risk_level" NOT NULL,
	"governance_maturity_gap_level" "risk_level" NOT NULL,
	"auditability_enforcement_gap_level" "risk_level" NOT NULL,
	"agentic_coding_risk_level" "risk_level",
	"lead_qualification_score" integer,
	"score_breakdown" jsonb,
	"calculated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessment_selected_tools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_session_id" uuid NOT NULL,
	"tool_id" uuid,
	"tool_profile_version_id" uuid,
	"unknown_tool_name" text,
	"unknown_tool_url" text,
	"selection_type" "tool_selection_type" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessment_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"public_token" text NOT NULL,
	"status" "assessment_status" DEFAULT 'started' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"report_requested_at" timestamp with time zone,
	"source" text,
	"user_agent" text,
	"ip_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_session_id" uuid NOT NULL,
	"report_token" text NOT NULL,
	"status" "report_status" DEFAULT 'pending' NOT NULL,
	"report_context" jsonb,
	"storage_path" text,
	"generated_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid,
	"assessment_session_id" uuid,
	"admin_user_id" uuid,
	"note" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lead_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"event_type" "lead_event_type" NOT NULL,
	"event_metadata" jsonb,
	"created_by_admin_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_session_id" uuid,
	"email" text NOT NULL,
	"name" text,
	"company_name" text,
	"country_region" text,
	"industry" text,
	"company_size" text,
	"role" text,
	"phone" text,
	"main_ai_concern" text,
	"consent_to_follow_up" boolean DEFAULT false NOT NULL,
	"status" "lead_status" DEFAULT 'new' NOT NULL,
	"lead_score" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cta_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_session_id" uuid,
	"lead_id" uuid,
	"event_type" "cta_event_type" NOT NULL,
	"destination_type" "cta_destination_type" NOT NULL,
	"destination_url" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid,
	"assessment_session_id" uuid,
	"report_id" uuid,
	"email_type" text NOT NULL,
	"status" "email_status" DEFAULT 'pending' NOT NULL,
	"provider" text,
	"provider_message_id" text,
	"error_message" text,
	"sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "unknown_tool_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_session_id" uuid,
	"tool_name" text NOT NULL,
	"tool_url" text,
	"requester_email" text,
	"organization" text,
	"use_case" text,
	"status" "unknown_tool_request_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_admin_user_id" uuid,
	"actor_type" "audit_actor_type" NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_tool_profile_versions" ADD CONSTRAINT "ai_tool_profile_versions_tool_id_ai_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."ai_tools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_tools" ADD CONSTRAINT "ai_tools_category_id_ai_tool_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."ai_tool_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_answers" ADD CONSTRAINT "assessment_answers_assessment_session_id_assessment_sessions_id_fk" FOREIGN KEY ("assessment_session_id") REFERENCES "public"."assessment_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_company_profiles" ADD CONSTRAINT "assessment_company_profiles_assessment_session_id_assessment_sessions_id_fk" FOREIGN KEY ("assessment_session_id") REFERENCES "public"."assessment_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_findings" ADD CONSTRAINT "assessment_findings_assessment_session_id_assessment_sessions_id_fk" FOREIGN KEY ("assessment_session_id") REFERENCES "public"."assessment_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_recommendations" ADD CONSTRAINT "assessment_recommendations_assessment_session_id_assessment_sessions_id_fk" FOREIGN KEY ("assessment_session_id") REFERENCES "public"."assessment_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_risk_signals" ADD CONSTRAINT "assessment_risk_signals_assessment_session_id_assessment_sessions_id_fk" FOREIGN KEY ("assessment_session_id") REFERENCES "public"."assessment_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_scores" ADD CONSTRAINT "assessment_scores_assessment_session_id_assessment_sessions_id_fk" FOREIGN KEY ("assessment_session_id") REFERENCES "public"."assessment_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_selected_tools" ADD CONSTRAINT "assessment_selected_tools_assessment_session_id_assessment_sessions_id_fk" FOREIGN KEY ("assessment_session_id") REFERENCES "public"."assessment_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_selected_tools" ADD CONSTRAINT "assessment_selected_tools_tool_id_ai_tools_id_fk" FOREIGN KEY ("tool_id") REFERENCES "public"."ai_tools"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_selected_tools" ADD CONSTRAINT "assessment_selected_tools_tool_profile_version_id_ai_tool_profile_versions_id_fk" FOREIGN KEY ("tool_profile_version_id") REFERENCES "public"."ai_tool_profile_versions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_assessment_session_id_assessment_sessions_id_fk" FOREIGN KEY ("assessment_session_id") REFERENCES "public"."assessment_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_notes" ADD CONSTRAINT "admin_notes_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_notes" ADD CONSTRAINT "admin_notes_assessment_session_id_assessment_sessions_id_fk" FOREIGN KEY ("assessment_session_id") REFERENCES "public"."assessment_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_notes" ADD CONSTRAINT "admin_notes_admin_user_id_admin_users_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_events" ADD CONSTRAINT "lead_events_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_events" ADD CONSTRAINT "lead_events_created_by_admin_user_id_admin_users_id_fk" FOREIGN KEY ("created_by_admin_user_id") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_assessment_session_id_assessment_sessions_id_fk" FOREIGN KEY ("assessment_session_id") REFERENCES "public"."assessment_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cta_events" ADD CONSTRAINT "cta_events_assessment_session_id_assessment_sessions_id_fk" FOREIGN KEY ("assessment_session_id") REFERENCES "public"."assessment_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cta_events" ADD CONSTRAINT "cta_events_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_events" ADD CONSTRAINT "email_events_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_events" ADD CONSTRAINT "email_events_assessment_session_id_assessment_sessions_id_fk" FOREIGN KEY ("assessment_session_id") REFERENCES "public"."assessment_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_events" ADD CONSTRAINT "email_events_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unknown_tool_requests" ADD CONSTRAINT "unknown_tool_requests_assessment_session_id_assessment_sessions_id_fk" FOREIGN KEY ("assessment_session_id") REFERENCES "public"."assessment_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_admin_user_id_admin_users_id_fk" FOREIGN KEY ("actor_admin_user_id") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "admin_users_email_idx" ON "admin_users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "admin_users_role_idx" ON "admin_users" USING btree ("role");--> statement-breakpoint
CREATE UNIQUE INDEX "ai_tool_categories_slug_idx" ON "ai_tool_categories" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "ai_tool_profile_versions_tool_version_idx" ON "ai_tool_profile_versions" USING btree ("tool_id","profile_version");--> statement-breakpoint
CREATE INDEX "ai_tool_profile_versions_tool_id_idx" ON "ai_tool_profile_versions" USING btree ("tool_id");--> statement-breakpoint
CREATE INDEX "ai_tool_profile_versions_published_status_idx" ON "ai_tool_profile_versions" USING btree ("published_status");--> statement-breakpoint
CREATE UNIQUE INDEX "ai_tools_slug_idx" ON "ai_tools" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "ai_tools_category_id_idx" ON "ai_tools" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "ai_tools_is_active_idx" ON "ai_tools" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "assessment_answers_session_id_idx" ON "assessment_answers" USING btree ("assessment_session_id");--> statement-breakpoint
CREATE INDEX "assessment_answers_question_id_idx" ON "assessment_answers" USING btree ("question_id");--> statement-breakpoint
CREATE UNIQUE INDEX "assessment_company_profiles_session_idx" ON "assessment_company_profiles" USING btree ("assessment_session_id");--> statement-breakpoint
CREATE INDEX "assessment_findings_session_id_idx" ON "assessment_findings" USING btree ("assessment_session_id");--> statement-breakpoint
CREATE INDEX "assessment_recommendations_session_id_idx" ON "assessment_recommendations" USING btree ("assessment_session_id");--> statement-breakpoint
CREATE INDEX "assessment_risk_signals_session_id_idx" ON "assessment_risk_signals" USING btree ("assessment_session_id");--> statement-breakpoint
CREATE INDEX "assessment_risk_signals_signal_key_idx" ON "assessment_risk_signals" USING btree ("signal_key");--> statement-breakpoint
CREATE UNIQUE INDEX "assessment_scores_session_idx" ON "assessment_scores" USING btree ("assessment_session_id");--> statement-breakpoint
CREATE INDEX "assessment_selected_tools_session_id_idx" ON "assessment_selected_tools" USING btree ("assessment_session_id");--> statement-breakpoint
CREATE INDEX "assessment_selected_tools_tool_id_idx" ON "assessment_selected_tools" USING btree ("tool_id");--> statement-breakpoint
CREATE UNIQUE INDEX "assessment_sessions_public_token_idx" ON "assessment_sessions" USING btree ("public_token");--> statement-breakpoint
CREATE INDEX "assessment_sessions_status_idx" ON "assessment_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "assessment_sessions_created_at_idx" ON "assessment_sessions" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "reports_assessment_session_id_idx" ON "reports" USING btree ("assessment_session_id");--> statement-breakpoint
CREATE UNIQUE INDEX "reports_report_token_idx" ON "reports" USING btree ("report_token");--> statement-breakpoint
CREATE INDEX "reports_status_idx" ON "reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "reports_created_at_idx" ON "reports" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "admin_notes_lead_id_idx" ON "admin_notes" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "admin_notes_assessment_session_id_idx" ON "admin_notes" USING btree ("assessment_session_id");--> statement-breakpoint
CREATE INDEX "admin_notes_admin_user_id_idx" ON "admin_notes" USING btree ("admin_user_id");--> statement-breakpoint
CREATE INDEX "lead_events_lead_id_idx" ON "lead_events" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "lead_events_event_type_idx" ON "lead_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "lead_events_created_at_idx" ON "lead_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "leads_email_idx" ON "leads" USING btree ("email");--> statement-breakpoint
CREATE INDEX "leads_status_idx" ON "leads" USING btree ("status");--> statement-breakpoint
CREATE INDEX "leads_created_at_idx" ON "leads" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "leads_assessment_session_id_idx" ON "leads" USING btree ("assessment_session_id");--> statement-breakpoint
CREATE INDEX "cta_events_assessment_session_id_idx" ON "cta_events" USING btree ("assessment_session_id");--> statement-breakpoint
CREATE INDEX "cta_events_lead_id_idx" ON "cta_events" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "cta_events_event_type_idx" ON "cta_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "cta_events_created_at_idx" ON "cta_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "email_events_lead_id_idx" ON "email_events" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "email_events_assessment_session_id_idx" ON "email_events" USING btree ("assessment_session_id");--> statement-breakpoint
CREATE INDEX "email_events_report_id_idx" ON "email_events" USING btree ("report_id");--> statement-breakpoint
CREATE INDEX "email_events_status_idx" ON "email_events" USING btree ("status");--> statement-breakpoint
CREATE INDEX "unknown_tool_requests_status_idx" ON "unknown_tool_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "unknown_tool_requests_created_at_idx" ON "unknown_tool_requests" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "unknown_tool_requests_session_id_idx" ON "unknown_tool_requests" USING btree ("assessment_session_id");--> statement-breakpoint
CREATE INDEX "audit_logs_actor_admin_user_id_idx" ON "audit_logs" USING btree ("actor_admin_user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");
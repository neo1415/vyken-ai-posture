import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { confidenceLevelEnum, publishedStatusEnum, timestamps } from "./enums";

export const aiToolCategories = pgTable(
  "ai_tool_categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (table) => [uniqueIndex("ai_tool_categories_slug_idx").on(table.slug)],
);

export const aiTools = pgTable(
  "ai_tools",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => aiToolCategories.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    websiteUrl: text("website_url"),
    logoKey: text("logo_key"),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("ai_tools_slug_idx").on(table.slug),
    index("ai_tools_category_id_idx").on(table.categoryId),
    index("ai_tools_is_active_idx").on(table.isActive),
  ],
);

export const aiToolProfileVersions = pgTable(
  "ai_tool_profile_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    toolId: uuid("tool_id")
      .notNull()
      .references(() => aiTools.id, { onDelete: "cascade" }),
    profileVersion: text("profile_version").notNull(),
    commonUseCases: jsonb("common_use_cases").$type<string[]>(),
    supportsFileUploads: boolean("supports_file_uploads"),
    supportsMeetingTranscripts: boolean("supports_meeting_transcripts"),
    codingAssistantRelevance: boolean("coding_assistant_relevance"),
    agenticOrConnectedToolRelevance: boolean(
      "agentic_or_connected_tool_relevance",
    ),
    publicPrivacyUrl: text("public_privacy_url"),
    publicSecurityUrl: text("public_security_url"),
    publicTrustUrl: text("public_trust_url"),
    trainingUseNotes: text("training_use_notes"),
    dataRetentionNotes: text("data_retention_notes"),
    deletionControlNotes: text("deletion_control_notes"),
    enterpriseAdminControlsNotes: text("enterprise_admin_controls_notes"),
    auditLoggingNotes: text("audit_logging_notes"),
    complianceSecurityDocsNotes: text("compliance_security_docs_notes"),
    subprocessorNotes: text("subprocessor_notes"),
    sensitiveDataConcerns: text("sensitive_data_concerns"),
    recommendedUsageBoundaries: text("recommended_usage_boundaries"),
    sources: jsonb("sources").$type<
      Array<{
        label: string;
        url: string;
        source_type:
          | "official_vendor"
          | "official_vendor_help"
          | "official_vendor_legal"
          | "official_vendor_trust"
          | "reputable_reporting";
        reviewed_at: string;
        notes: string;
      }>
    >(),
    reviewNotes: text("review_notes"),
    sourceConfidenceNotes: text("source_confidence_notes"),
    publicInfoConfidenceLevel: confidenceLevelEnum(
      "public_info_confidence_level",
    )
      .notNull()
      .default("unknown"),
    lastReviewedAt: timestamp("last_reviewed_at", { withTimezone: true }),
    reviewedBy: text("reviewed_by"),
    publishedStatus: publishedStatusEnum("published_status")
      .notNull()
      .default("draft"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("ai_tool_profile_versions_tool_version_idx").on(
      table.toolId,
      table.profileVersion,
    ),
    index("ai_tool_profile_versions_tool_id_idx").on(table.toolId),
    index("ai_tool_profile_versions_published_status_idx").on(
      table.publishedStatus,
    ),
  ],
);

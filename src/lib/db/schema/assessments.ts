import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { aiToolProfileVersions, aiTools } from "./ai-tools";
import {
  answerTypeEnum,
  assessmentStatusEnum,
  riskLevelEnum,
  timestamps,
  toolSelectionTypeEnum,
} from "./enums";

export const assessmentSessions = pgTable(
  "assessment_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    publicToken: text("public_token").notNull(),
    status: assessmentStatusEnum("status").notNull().default("started"),
    startedAt: timestamp("started_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    reportRequestedAt: timestamp("report_requested_at", { withTimezone: true }),
    source: text("source"),
    userAgent: text("user_agent"),
    ipHash: text("ip_hash"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("assessment_sessions_public_token_idx").on(table.publicToken),
    index("assessment_sessions_status_idx").on(table.status),
    index("assessment_sessions_created_at_idx").on(table.createdAt),
  ],
);

export const assessmentCompanyProfiles = pgTable(
  "assessment_company_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    assessmentSessionId: uuid("assessment_session_id")
      .notNull()
      .references(() => assessmentSessions.id, { onDelete: "cascade" }),
    companyName: text("company_name"),
    countryRegion: text("country_region"),
    industry: text("industry").notNull(),
    companySize: text("company_size").notNull(),
    respondentRole: text("respondent_role"),
    departmentFunction: text("department_function"),
    handlesSensitiveOrRegulatedData: text(
      "handles_sensitive_or_regulated_data",
    ),
    mainAiConcerns: jsonb("main_ai_concerns").$type<string[]>(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("assessment_company_profiles_session_idx").on(
      table.assessmentSessionId,
    ),
  ],
);

export const assessmentSelectedTools = pgTable(
  "assessment_selected_tools",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    assessmentSessionId: uuid("assessment_session_id")
      .notNull()
      .references(() => assessmentSessions.id, { onDelete: "cascade" }),
    toolId: uuid("tool_id").references(() => aiTools.id, {
      onDelete: "set null",
    }),
    toolProfileVersionId: uuid("tool_profile_version_id").references(
      () => aiToolProfileVersions.id,
      { onDelete: "set null" },
    ),
    unknownToolName: text("unknown_tool_name"),
    unknownToolUrl: text("unknown_tool_url"),
    selectionType: toolSelectionTypeEnum("selection_type").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("assessment_selected_tools_session_id_idx").on(
      table.assessmentSessionId,
    ),
    index("assessment_selected_tools_tool_id_idx").on(table.toolId),
  ],
);

export const assessmentAnswers = pgTable(
  "assessment_answers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    assessmentSessionId: uuid("assessment_session_id")
      .notNull()
      .references(() => assessmentSessions.id, { onDelete: "cascade" }),
    questionId: text("question_id").notNull(),
    sectionId: text("section_id").notNull(),
    answerType: answerTypeEnum("answer_type").notNull(),
    answerValue: jsonb("answer_value").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("assessment_answers_session_id_idx").on(table.assessmentSessionId),
    index("assessment_answers_question_id_idx").on(table.questionId),
  ],
);

export const assessmentScores = pgTable(
  "assessment_scores",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    assessmentSessionId: uuid("assessment_session_id")
      .notNull()
      .references(() => assessmentSessions.id, { onDelete: "cascade" }),
    overallRiskLevel: riskLevelEnum("overall_risk_level").notNull(),
    toolStackRiskLevel: riskLevelEnum("tool_stack_risk_level").notNull(),
    dataExposureRiskLevel: riskLevelEnum("data_exposure_risk_level").notNull(),
    governanceMaturityGapLevel: riskLevelEnum(
      "governance_maturity_gap_level",
    ).notNull(),
    auditabilityEnforcementGapLevel: riskLevelEnum(
      "auditability_enforcement_gap_level",
    ).notNull(),
    agenticCodingRiskLevel: riskLevelEnum("agentic_coding_risk_level"),
    leadQualificationScore: integer("lead_qualification_score"),
    scoreBreakdown: jsonb("score_breakdown"),
    calculatedAt: timestamp("calculated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("assessment_scores_session_idx").on(table.assessmentSessionId),
  ],
);

export const assessmentRiskSignals = pgTable(
  "assessment_risk_signals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    assessmentSessionId: uuid("assessment_session_id")
      .notNull()
      .references(() => assessmentSessions.id, { onDelete: "cascade" }),
    signalKey: text("signal_key").notNull(),
    severity: riskLevelEnum("severity").notNull(),
    sourceAnswerIds: jsonb("source_answer_ids").$type<string[]>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("assessment_risk_signals_session_id_idx").on(
      table.assessmentSessionId,
    ),
    index("assessment_risk_signals_signal_key_idx").on(table.signalKey),
  ],
);

export const assessmentFindings = pgTable(
  "assessment_findings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    assessmentSessionId: uuid("assessment_session_id")
      .notNull()
      .references(() => assessmentSessions.id, { onDelete: "cascade" }),
    findingKey: text("finding_key").notNull(),
    title: text("title").notNull(),
    severity: riskLevelEnum("severity").notNull(),
    summary: text("summary").notNull(),
    frameworkMapping: jsonb("framework_mapping").$type<string[]>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("assessment_findings_session_id_idx").on(table.assessmentSessionId),
  ],
);

export const assessmentRecommendations = pgTable(
  "assessment_recommendations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    assessmentSessionId: uuid("assessment_session_id")
      .notNull()
      .references(() => assessmentSessions.id, { onDelete: "cascade" }),
    recommendationKey: text("recommendation_key").notNull(),
    title: text("title").notNull(),
    severity: riskLevelEnum("severity").notNull(),
    recommendedActions: jsonb("recommended_actions").$type<string[]>(),
    frameworkMapping: jsonb("framework_mapping").$type<string[]>(),
    ctaType: text("cta_type"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("assessment_recommendations_session_id_idx").on(
      table.assessmentSessionId,
    ),
  ],
);

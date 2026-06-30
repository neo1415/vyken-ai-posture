import { pgEnum, timestamp } from "drizzle-orm/pg-core";

export const adminRoleEnum = pgEnum("admin_role", [
  "viewer",
  "editor",
  "superadmin",
]);

export const assessmentStatusEnum = pgEnum("assessment_status", [
  "started",
  "completed",
  "abandoned",
  "report_requested",
  "report_generated",
  "report_failed",
]);

export const leadStatusEnum = pgEnum("lead_status", [
  "new",
  "contacted",
  "qualified",
  "booked",
  "not_ready",
  "closed",
  "ignore_spam",
]);

export const riskLevelEnum = pgEnum("risk_level", [
  "low",
  "moderate",
  "high",
  "critical",
  "unknown",
]);

export const confidenceLevelEnum = pgEnum("confidence_level", [
  "high",
  "medium",
  "low",
  "unknown",
]);

export const publishedStatusEnum = pgEnum("published_status", [
  "draft",
  "published",
  "archived",
]);

export const reportStatusEnum = pgEnum("report_status", [
  "pending",
  "generated",
  "failed",
  "expired",
]);

export const emailStatusEnum = pgEnum("email_status", [
  "pending",
  "sent",
  "failed",
  "bounced",
]);

export const answerTypeEnum = pgEnum("answer_type", [
  "single_select",
  "multi_select",
  "card_select",
  "chip_select",
  "text_optional",
  "email",
  "boolean",
  "range_select",
]);

export const toolSelectionTypeEnum = pgEnum("tool_selection_type", [
  "known_tool",
  "unknown_tool",
  "not_sure",
]);

export const unknownToolRequestStatusEnum = pgEnum(
  "unknown_tool_request_status",
  ["new", "in_review", "added", "rejected", "duplicate"],
);

export const ctaEventTypeEnum = pgEnum("cta_event_type", [
  "book_call_clicked",
  "vyken_guard_clicked",
  "vyken_registration_clicked",
  "ai_risk_index_clicked",
  "request_review_clicked",
]);

export const ctaDestinationTypeEnum = pgEnum("cta_destination_type", [
  "book_call",
  "vyken_guard",
  "vyken_registration",
  "ai_risk_index",
  "request_review",
]);

export const leadEventTypeEnum = pgEnum("lead_event_type", [
  "report_requested",
  "report_sent",
  "cta_clicked",
  "booked_call_clicked",
  "status_changed",
  "note_added",
]);

export const auditActorTypeEnum = pgEnum("audit_actor_type", [
  "system",
  "admin",
  "anonymous_server_flow",
]);

export const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

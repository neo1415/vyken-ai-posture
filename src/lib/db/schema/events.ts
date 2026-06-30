import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { assessmentSessions } from "./assessments";
import { leads } from "./leads";
import { reports } from "./reports";
import {
  ctaDestinationTypeEnum,
  ctaEventTypeEnum,
  emailStatusEnum,
  timestamps,
  unknownToolRequestStatusEnum,
} from "./enums";

export const unknownToolRequests = pgTable(
  "unknown_tool_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    assessmentSessionId: uuid("assessment_session_id").references(
      () => assessmentSessions.id,
      { onDelete: "set null" },
    ),
    toolName: text("tool_name").notNull(),
    toolUrl: text("tool_url"),
    requesterEmail: text("requester_email"),
    organization: text("organization"),
    useCase: text("use_case"),
    status: unknownToolRequestStatusEnum("status").notNull().default("new"),
    ...timestamps,
  },
  (table) => [
    index("unknown_tool_requests_status_idx").on(table.status),
    index("unknown_tool_requests_created_at_idx").on(table.createdAt),
    index("unknown_tool_requests_session_id_idx").on(table.assessmentSessionId),
  ],
);

export const ctaEvents = pgTable(
  "cta_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    assessmentSessionId: uuid("assessment_session_id").references(
      () => assessmentSessions.id,
      { onDelete: "set null" },
    ),
    leadId: uuid("lead_id").references(() => leads.id, {
      onDelete: "set null",
    }),
    eventType: ctaEventTypeEnum("event_type").notNull(),
    destinationType: ctaDestinationTypeEnum("destination_type").notNull(),
    destinationUrl: text("destination_url"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("cta_events_assessment_session_id_idx").on(table.assessmentSessionId),
    index("cta_events_lead_id_idx").on(table.leadId),
    index("cta_events_event_type_idx").on(table.eventType),
    index("cta_events_created_at_idx").on(table.createdAt),
  ],
);

export const emailEvents = pgTable(
  "email_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    leadId: uuid("lead_id").references(() => leads.id, {
      onDelete: "set null",
    }),
    assessmentSessionId: uuid("assessment_session_id").references(
      () => assessmentSessions.id,
      { onDelete: "set null" },
    ),
    reportId: uuid("report_id").references(() => reports.id, {
      onDelete: "set null",
    }),
    emailType: text("email_type").notNull(),
    status: emailStatusEnum("status").notNull().default("pending"),
    provider: text("provider"),
    providerMessageId: text("provider_message_id"),
    errorMessage: text("error_message"),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("email_events_lead_id_idx").on(table.leadId),
    index("email_events_assessment_session_id_idx").on(
      table.assessmentSessionId,
    ),
    index("email_events_report_id_idx").on(table.reportId),
    index("email_events_status_idx").on(table.status),
  ],
);

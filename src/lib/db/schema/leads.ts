import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { adminUsers } from "./admin";
import { assessmentSessions } from "./assessments";
import { leadEventTypeEnum, leadStatusEnum, timestamps } from "./enums";

export const leads = pgTable(
  "leads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    assessmentSessionId: uuid("assessment_session_id").references(
      () => assessmentSessions.id,
      { onDelete: "set null" },
    ),
    email: text("email").notNull(),
    name: text("name"),
    companyName: text("company_name"),
    countryRegion: text("country_region"),
    industry: text("industry"),
    companySize: text("company_size"),
    role: text("role"),
    phone: text("phone"),
    mainAiConcern: text("main_ai_concern"),
    consentToFollowUp: boolean("consent_to_follow_up").notNull().default(false),
    status: leadStatusEnum("status").notNull().default("new"),
    leadScore: integer("lead_score"),
    ...timestamps,
  },
  (table) => [
    index("leads_email_idx").on(table.email),
    index("leads_status_idx").on(table.status),
    index("leads_created_at_idx").on(table.createdAt),
    index("leads_assessment_session_id_idx").on(table.assessmentSessionId),
  ],
);

export const leadEvents = pgTable(
  "lead_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    leadId: uuid("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    eventType: leadEventTypeEnum("event_type").notNull(),
    eventMetadata: jsonb("event_metadata"),
    createdByAdminUserId: uuid("created_by_admin_user_id").references(
      () => adminUsers.id,
      { onDelete: "set null" },
    ),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("lead_events_lead_id_idx").on(table.leadId),
    index("lead_events_event_type_idx").on(table.eventType),
    index("lead_events_created_at_idx").on(table.createdAt),
  ],
);

export const adminNotes = pgTable(
  "admin_notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    leadId: uuid("lead_id").references(() => leads.id, { onDelete: "cascade" }),
    assessmentSessionId: uuid("assessment_session_id").references(
      () => assessmentSessions.id,
      { onDelete: "set null" },
    ),
    adminUserId: uuid("admin_user_id").references(() => adminUsers.id, {
      onDelete: "set null",
    }),
    note: text("note").notNull(),
    ...timestamps,
  },
  (table) => [
    index("admin_notes_lead_id_idx").on(table.leadId),
    index("admin_notes_assessment_session_id_idx").on(
      table.assessmentSessionId,
    ),
    index("admin_notes_admin_user_id_idx").on(table.adminUserId),
  ],
);

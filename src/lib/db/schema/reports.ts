import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { assessmentSessions } from "./assessments";
import { reportStatusEnum, timestamps } from "./enums";

export const reports = pgTable(
  "reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    assessmentSessionId: uuid("assessment_session_id")
      .notNull()
      .references(() => assessmentSessions.id, { onDelete: "cascade" }),
    reportToken: text("report_token").notNull(),
    status: reportStatusEnum("status").notNull().default("pending"),
    reportContext: jsonb("report_context"),
    storagePath: text("storage_path"),
    generatedAt: timestamp("generated_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("reports_assessment_session_id_idx").on(
      table.assessmentSessionId,
    ),
    uniqueIndex("reports_report_token_idx").on(table.reportToken),
    index("reports_status_idx").on(table.status),
    index("reports_created_at_idx").on(table.createdAt),
  ],
);

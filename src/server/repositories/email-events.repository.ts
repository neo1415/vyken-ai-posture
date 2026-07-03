import "server-only";

import { and, desc, eq } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { emailEvents } from "@/lib/db/schema/events";
import {
  INTERNAL_NOTIFICATION_EMAIL_TYPE,
  USER_REPORT_EMAIL_TYPE,
} from "@/features/email-delivery/types";

export type EmailEventRow = typeof emailEvents.$inferSelect;

export type CreateEmailEventInput = {
  assessmentSessionId: string;
  leadId: string | null;
  reportId: string | null;
  emailType: string;
  status: "pending" | "sent" | "failed" | "bounced";
  provider: string | null;
  providerMessageId: string | null;
  errorMessage: string | null;
  sentAt: Date | null;
};

export async function createEmailEvent(
  input: CreateEmailEventInput,
): Promise<EmailEventRow> {
  const db = getDb();

  const [created] = await db
    .insert(emailEvents)
    .values({
      assessmentSessionId: input.assessmentSessionId,
      leadId: input.leadId,
      reportId: input.reportId,
      emailType: input.emailType,
      status: input.status,
      provider: input.provider,
      providerMessageId: input.providerMessageId,
      errorMessage: input.errorMessage,
      sentAt: input.sentAt,
    })
    .returning();

  if (!created) {
    throw new Error("Failed to create email event.");
  }

  return created;
}

export async function getEmailEventsForAssessment(
  assessmentSessionId: string,
): Promise<EmailEventRow[]> {
  const db = getDb();

  return db
    .select()
    .from(emailEvents)
    .where(eq(emailEvents.assessmentSessionId, assessmentSessionId))
    .orderBy(desc(emailEvents.createdAt));
}

export async function hasSuccessfulReportEmailForAssessment(
  assessmentSessionId: string,
): Promise<boolean> {
  const db = getDb();
  const rows = await db
    .select()
    .from(emailEvents)
    .where(
      and(
        eq(emailEvents.assessmentSessionId, assessmentSessionId),
        eq(emailEvents.emailType, USER_REPORT_EMAIL_TYPE),
        eq(emailEvents.status, "sent"),
      ),
    )
    .limit(1);

  return rows.length > 0;
}

export async function hasSuccessfulInternalNotificationForAssessment(
  assessmentSessionId: string,
): Promise<boolean> {
  const db = getDb();
  const rows = await db
    .select()
    .from(emailEvents)
    .where(
      and(
        eq(emailEvents.assessmentSessionId, assessmentSessionId),
        eq(emailEvents.emailType, INTERNAL_NOTIFICATION_EMAIL_TYPE),
        eq(emailEvents.status, "sent"),
      ),
    )
    .limit(1);

  return rows.length > 0;
}

export { INTERNAL_NOTIFICATION_EMAIL_TYPE, USER_REPORT_EMAIL_TYPE };

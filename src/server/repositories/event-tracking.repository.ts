import "server-only";

import { and, desc, eq, gte } from "drizzle-orm";

import type { SafeEventMetadata } from "@/features/event-tracking/types";
import { CTA_DEDUPE_WINDOW_MS } from "@/features/event-tracking/constants";
import { getDb } from "@/lib/db/client";
import { auditLogs } from "@/lib/db/schema/audit";
import { ctaEvents } from "@/lib/db/schema/events";
import { leadEvents } from "@/lib/db/schema/leads";

type CtaEventType =
  | "book_call_clicked"
  | "vyken_guard_clicked"
  | "vyken_registration_clicked"
  | "ai_risk_index_clicked"
  | "request_review_clicked";

type CtaDestinationType =
  | "book_call"
  | "vyken_guard"
  | "vyken_registration"
  | "ai_risk_index"
  | "request_review";

type LeadEventType =
  | "report_requested"
  | "report_sent"
  | "cta_clicked"
  | "booked_call_clicked"
  | "status_changed"
  | "note_added";

const DEDUPE_LEAD_EVENT_TYPES: LeadEventType[] = [
  "report_requested",
  "cta_clicked",
];

export type CreateCtaEventInput = {
  assessmentSessionId: string;
  leadId?: string | null;
  eventType: CtaEventType;
  destinationType: CtaDestinationType;
  destinationUrl?: string | null;
  metadata?: SafeEventMetadata | null;
};

export type CreateLeadEventInput = {
  leadId: string;
  eventType: LeadEventType;
  metadata?: SafeEventMetadata | null;
};

export type CreateAuditEventInput = {
  actorType: "system" | "admin" | "anonymous_server_flow";
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: SafeEventMetadata | null;
  actorAdminUserId?: string | null;
};

export async function createCtaEvent(
  input: CreateCtaEventInput,
): Promise<{ created: boolean }> {
  const db = getDb();
  const since = new Date(Date.now() - CTA_DEDUPE_WINDOW_MS);

  const [recent] = await db
    .select({ id: ctaEvents.id })
    .from(ctaEvents)
    .where(
      and(
        eq(ctaEvents.assessmentSessionId, input.assessmentSessionId),
        eq(ctaEvents.eventType, input.eventType),
        eq(ctaEvents.destinationType, input.destinationType),
        gte(ctaEvents.createdAt, since),
      ),
    )
    .limit(1);

  if (recent) {
    return { created: false };
  }

  await db.insert(ctaEvents).values({
    assessmentSessionId: input.assessmentSessionId,
    leadId: input.leadId ?? null,
    eventType: input.eventType,
    destinationType: input.destinationType,
    destinationUrl: input.destinationUrl ?? null,
    metadata: input.metadata ?? null,
  });

  return { created: true };
}

export async function createLeadEvent(
  input: CreateLeadEventInput,
): Promise<{ created: boolean }> {
  const db = getDb();

  if (DEDUPE_LEAD_EVENT_TYPES.includes(input.eventType)) {
    const [existing] = await db
      .select({ id: leadEvents.id })
      .from(leadEvents)
      .where(
        and(
          eq(leadEvents.leadId, input.leadId),
          eq(leadEvents.eventType, input.eventType),
        ),
      )
      .limit(1);

    if (existing) {
      return { created: false };
    }
  }

  await db.insert(leadEvents).values({
    leadId: input.leadId,
    eventType: input.eventType,
    eventMetadata: input.metadata ?? null,
  });

  return { created: true };
}

export async function createAuditEvent(
  input: CreateAuditEventInput,
): Promise<void> {
  const db = getDb();

  await db.insert(auditLogs).values({
    actorAdminUserId: input.actorAdminUserId ?? null,
    actorType: input.actorType,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId ?? null,
    metadata: input.metadata ?? null,
  });
}

export async function hasRecentAuditEvent(input: {
  action: string;
  entityType: string;
  entityId: string;
}): Promise<boolean> {
  const db = getDb();

  const [row] = await db
    .select({ id: auditLogs.id })
    .from(auditLogs)
    .where(
      and(
        eq(auditLogs.action, input.action),
        eq(auditLogs.entityType, input.entityType),
        eq(auditLogs.entityId, input.entityId),
      ),
    )
    .limit(1);

  return row != null;
}

export async function getRecentEventsForAssessment(input: {
  assessmentSessionId: string;
  limit?: number;
}): Promise<{
  ctaCount: number;
  auditCount: number;
}> {
  const db = getDb();
  const limit = input.limit ?? 10;

  const ctaRows = await db
    .select({ id: ctaEvents.id })
    .from(ctaEvents)
    .where(eq(ctaEvents.assessmentSessionId, input.assessmentSessionId))
    .orderBy(desc(ctaEvents.createdAt))
    .limit(limit);

  const auditRows = await db
    .select({ id: auditLogs.id })
    .from(auditLogs)
    .where(
      and(
        eq(auditLogs.entityType, "assessment_session"),
        eq(auditLogs.entityId, input.assessmentSessionId),
      ),
    )
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);

  return {
    ctaCount: ctaRows.length,
    auditCount: auditRows.length,
  };
}

export async function hasLeadEvent(
  leadId: string,
  eventType: LeadEventType,
): Promise<boolean> {
  const db = getDb();
  const [row] = await db
    .select({ id: leadEvents.id })
    .from(leadEvents)
    .where(
      and(eq(leadEvents.leadId, leadId), eq(leadEvents.eventType, eventType)),
    )
    .limit(1);
  return row != null;
}

import "server-only";

import type {
  TrackAdminAuditEventInput,
  TrackCtaClickInput,
  TrackLeadEventInput,
  TrackPublicAssessmentEventInput,
} from "@/features/event-tracking/types";
import {
  assertMetadataSize,
  mapClientDestinationToCtaEvent,
  sanitizeEventMetadata,
  validateAdminAuditAction,
  validateLeadEventType,
  validatePublicAssessmentAction,
} from "@/features/event-tracking/validation";
import { isValidPublicTokenFormat } from "@/lib/security/public-token";
import { getAssessmentSessionByPublicToken } from "@/server/repositories/assessment-sessions.repository";
import {
  createAuditEvent,
  createCtaEvent,
  createLeadEvent,
  hasRecentAuditEvent,
} from "@/server/repositories/event-tracking.repository";
import { getLatestLeadForAssessment } from "@/server/repositories/leads.repository";

async function resolveSession(publicToken: string) {
  const token = publicToken.trim();
  if (!isValidPublicTokenFormat(token)) {
    return null;
  }
  return getAssessmentSessionByPublicToken(token);
}

export async function trackPublicAssessmentEvent(
  input: TrackPublicAssessmentEventInput,
): Promise<void> {
  try {
    if (!validatePublicAssessmentAction(input.action)) {
      return;
    }

    const session = await resolveSession(input.publicToken);
    if (!session) {
      return;
    }

    const metadata = sanitizeEventMetadata(input.metadata);
    assertMetadataSize(metadata);

    if (
      input.action === "result_viewed" ||
      input.action === "lead_capture_viewed"
    ) {
      const exists = await hasRecentAuditEvent({
        action: input.action,
        entityType: "assessment_session",
        entityId: session.id,
      });
      if (exists) {
        return;
      }
    }

    await createAuditEvent({
      actorType: "anonymous_server_flow",
      action: input.action,
      entityType: "assessment_session",
      entityId: session.id,
      metadata,
    });
  } catch {
    // Fail soft for public flow.
  }
}

export async function trackCtaEvent(input: TrackCtaClickInput): Promise<void> {
  try {
    const session = await resolveSession(input.publicToken);
    if (!session) {
      return;
    }

    const mapped = mapClientDestinationToCtaEvent(input.destination);
    const lead = await getLatestLeadForAssessment(session.id);

    const metadata = sanitizeEventMetadata({
      sourcePage: input.sourcePage,
      ctaDestination: input.destination,
    });
    assertMetadataSize(metadata);

    await createCtaEvent({
      assessmentSessionId: session.id,
      leadId: lead?.id ?? null,
      eventType: mapped.eventType,
      destinationType: mapped.destinationType,
      metadata,
    });
  } catch {
    // Fail soft for public flow.
  }
}

export async function trackLeadEvent(
  input: TrackLeadEventInput,
): Promise<void> {
  try {
    if (!validateLeadEventType(input.eventType)) {
      return;
    }

    const metadata = sanitizeEventMetadata(input.metadata);
    assertMetadataSize(metadata);

    await createLeadEvent({
      leadId: input.leadId,
      eventType: input.eventType,
      metadata,
    });
  } catch {
    // Fail soft.
  }
}

export async function trackAdminAuditEvent(
  input: TrackAdminAuditEventInput,
): Promise<void> {
  try {
    if (!validateAdminAuditAction(input.action)) {
      return;
    }

    const metadata = sanitizeEventMetadata({
      ...input.metadata,
      ...(input.admin
        ? { adminEmail: input.admin.email, adminRole: input.admin.role }
        : {}),
    });
    assertMetadataSize(metadata);

    if (input.action === "admin_lead_viewed" && input.entityId) {
      const exists = await hasRecentAuditEvent({
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
      });
      if (exists) {
        return;
      }
    }

    await createAuditEvent({
      actorType: "admin",
      actorAdminUserId: input.admin?.id ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      metadata,
    });
  } catch {
    // Fail soft — admin action should not depend on audit success.
  }
}

export async function trackPublicAssessmentEventBySessionId(input: {
  assessmentSessionId: string;
  action: TrackPublicAssessmentEventInput["action"];
  metadata?: TrackPublicAssessmentEventInput["metadata"];
}): Promise<void> {
  try {
    if (!validatePublicAssessmentAction(input.action)) {
      return;
    }

    const metadata = sanitizeEventMetadata(input.metadata);
    assertMetadataSize(metadata);

    if (
      input.action === "result_viewed" ||
      input.action === "lead_capture_viewed"
    ) {
      const exists = await hasRecentAuditEvent({
        action: input.action,
        entityType: "assessment_session",
        entityId: input.assessmentSessionId,
      });
      if (exists) {
        return;
      }
    }

    await createAuditEvent({
      actorType: "anonymous_server_flow",
      action: input.action,
      entityType: "assessment_session",
      entityId: input.assessmentSessionId,
      metadata,
    });
  } catch {
    // Fail soft.
  }
}

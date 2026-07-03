import "server-only";

import type { LeadCaptureInput } from "@/features/leads/types";
import { isValidPublicTokenFormat } from "@/lib/security/public-token";
import { getAssessmentSessionByPublicToken } from "@/server/repositories/assessment-sessions.repository";
import {
  getLeadByAssessmentSessionAndEmail,
  getLeadCountForAssessment,
  upsertLeadForAssessment,
} from "@/server/repositories/leads.repository";
import { getAssessmentResult } from "@/server/services/assessment-result.service";
import { trackLeadEvent } from "@/server/services/event-tracking.service";

export class LeadCaptureError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LeadCaptureError";
  }
}

export type LeadCaptureServiceResult = {
  success: true;
};

export async function hasLeadForAssessmentSession(
  publicToken: string,
): Promise<boolean> {
  const token = publicToken.trim();
  if (!isValidPublicTokenFormat(token)) {
    return false;
  }

  const session = await getAssessmentSessionByPublicToken(token);
  if (!session) {
    return false;
  }

  const leadCount = await getLeadCountForAssessment(session.id);
  return leadCount > 0;
}

export async function captureAssessmentLead(
  input: LeadCaptureInput,
): Promise<LeadCaptureServiceResult> {
  if (!isValidPublicTokenFormat(input.publicToken)) {
    throw new LeadCaptureError(
      "This assessment session could not be verified. Please restart the assessment.",
    );
  }

  const session = await getAssessmentSessionByPublicToken(input.publicToken);
  if (!session) {
    throw new LeadCaptureError(
      "This assessment session could not be verified. Please restart the assessment.",
    );
  }

  const existing = await getLeadByAssessmentSessionAndEmail(
    session.id,
    input.workEmail,
  );

  const result = await getAssessmentResult(input.publicToken);
  if (!result) {
    throw new LeadCaptureError(
      "This assessment session could not be verified. Please restart the assessment.",
    );
  }

  const lead = await upsertLeadForAssessment({
    assessmentSessionId: session.id,
    email: input.workEmail,
    name: input.fullName,
    companyName: input.companyName,
    role: input.roleTitle,
    mainAiConcern: input.followUpInterest,
    consentToFollowUp: input.consent,
    leadScore: result.summary.overallScore,
  });

  if (!existing) {
    void trackLeadEvent({
      leadId: lead.id,
      eventType: "report_requested",
      metadata: {
        sourcePage: "lead_capture",
        followUpInterest: input.followUpInterest ?? undefined,
      },
    });
  }

  return { success: true };
}

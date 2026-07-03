"use server";

import { ZodError } from "zod";

import { RESULT_FOLLOW_UP_COPY } from "@/features/event-tracking/constants";
import type {
  EventTrackingActionState,
  RequestReportEmailActionState,
} from "@/features/event-tracking/types";
import {
  parseRequestReportEmailFormData,
  parseTrackCtaClickFormData,
} from "@/features/event-tracking/validation";
import { getAssessmentSessionByPublicToken } from "@/server/repositories/assessment-sessions.repository";
import { getLatestLeadForAssessment } from "@/server/repositories/leads.repository";
import {
  trackCtaEvent,
  trackLeadEvent,
} from "@/server/services/event-tracking.service";
import {
  EmailDeliveryServiceError,
  sendAssessmentReportEmail,
} from "@/server/services/email-delivery.service";

const trackingInitialState: EventTrackingActionState = { status: "idle" };

function trackingSuccess(): EventTrackingActionState {
  return { status: "success" };
}

function trackingError(message: string): EventTrackingActionState {
  return { status: "error", message };
}

export async function trackCtaClickAction(
  _previousState: EventTrackingActionState,
  formData: FormData,
): Promise<EventTrackingActionState> {
  try {
    const parsed = parseTrackCtaClickFormData(formData);
    await trackCtaEvent({
      publicToken: parsed.publicToken,
      destination: parsed.destination,
      sourcePage: parsed.sourcePage,
      ctaLabel: parsed.ctaLabel,
    });
    return trackingSuccess();
  } catch (error) {
    if (error instanceof ZodError) {
      return trackingError("Invalid tracking request.");
    }
    return trackingSuccess();
  }
}

export async function requestReportEmailAction(
  _previousState: RequestReportEmailActionState,
  formData: FormData,
): Promise<RequestReportEmailActionState> {
  try {
    const parsed = parseRequestReportEmailFormData(formData);
    const session = await getAssessmentSessionByPublicToken(parsed.publicToken);
    if (!session) {
      return trackingError("Assessment session could not be verified.");
    }

    const lead = await getLatestLeadForAssessment(session.id);
    if (!lead?.consentToFollowUp) {
      return trackingError(RESULT_FOLLOW_UP_COPY.emailReportNeedsLead);
    }

    const result = await sendAssessmentReportEmail(parsed.publicToken);

    if (result.outcome === "already_sent") {
      return {
        status: "success",
        message: RESULT_FOLLOW_UP_COPY.emailReportAlreadySent,
      };
    }

    if (result.outcome === "failed") {
      return trackingError("Report email could not be sent.");
    }

    await trackLeadEvent({
      leadId: lead.id,
      eventType: "report_requested",
      metadata: { sourcePage: "results_follow_up" },
    });

    return {
      status: "success",
      message: RESULT_FOLLOW_UP_COPY.emailReportSuccess,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return trackingError("Invalid request.");
    }
    if (error instanceof EmailDeliveryServiceError) {
      return trackingError(error.message);
    }
    return trackingError("Report email could not be sent.");
  }
}

export {
  trackingInitialState as eventTrackingActionInitialState,
  trackingInitialState as requestReportEmailInitialState,
};

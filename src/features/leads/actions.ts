"use server";

import { ZodError } from "zod";

import { LEAD_CAPTURE_COPY } from "@/features/leads/constants";
import type { LeadCaptureFormState } from "@/features/leads/types";
import {
  formatZodFieldErrors,
  parseLeadCaptureFormData,
  validateLeadCaptureInput,
} from "@/features/leads/validation";
import {
  captureAssessmentLead,
  LeadCaptureError,
} from "@/server/services/lead-capture.service";

export async function submitLeadCapture(
  _previousState: LeadCaptureFormState,
  formData: FormData,
): Promise<LeadCaptureFormState> {
  const raw = parseLeadCaptureFormData(formData);

  try {
    const validated = validateLeadCaptureInput(raw);
    await captureAssessmentLead(validated);

    return {
      status: "success",
      message: LEAD_CAPTURE_COPY.successMessage,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        status: "error",
        message: LEAD_CAPTURE_COPY.errorMessage,
        fieldErrors: formatZodFieldErrors(error),
        values: raw,
      };
    }

    if (error instanceof LeadCaptureError) {
      return {
        status: "error",
        message: error.message,
        values: raw,
      };
    }

    return {
      status: "error",
      message: LEAD_CAPTURE_COPY.errorMessage,
      values: raw,
    };
  }
}

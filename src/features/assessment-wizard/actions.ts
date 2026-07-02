"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";

import type { AssessmentWizardFormState } from "@/features/assessment-wizard/types";
import {
  AssessmentWizardValidationError,
  parseAssessmentWizardFormData,
} from "@/features/assessment-wizard/validation";
import {
  AssessmentWizardError,
  saveAssessmentWizardAnswers,
} from "@/server/services/assessment-wizard.service";

export async function submitAssessmentAnswers(
  _previousState: AssessmentWizardFormState,
  formData: FormData,
): Promise<AssessmentWizardFormState> {
  const raw = parseAssessmentWizardFormData(formData);

  try {
    const { publicToken } = await saveAssessmentWizardAnswers({
      sessionToken: raw.sessionToken,
      answers: raw.answers,
    });
    redirect(
      `/ai-risk-assessment/results?session=${encodeURIComponent(publicToken)}`,
    );
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    if (error instanceof AssessmentWizardValidationError) {
      return {
        status: "error",
        message: "Please fix the highlighted fields and try again.",
        fieldErrors: error.fieldErrors,
      };
    }

    if (error instanceof AssessmentWizardError) {
      return {
        status: "error",
        message: error.message,
      };
    }

    return {
      status: "error",
      message: "We could not save your answers. Please try again.",
    };
  }
}

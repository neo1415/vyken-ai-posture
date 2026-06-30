"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import { ZodError } from "zod";

import type {
  CompanyProfileFormState,
  CompanyProfileRawFormInput,
} from "@/features/company-profile/types";
import {
  formatZodFieldErrors,
  parseCompanyProfileFormData,
  validateCompanyProfileInput,
} from "@/features/company-profile/validation";
import { createCompanyProfileAssessment } from "@/server/services/company-profile.service";

function buildFormValuesFromRaw(
  raw: CompanyProfileRawFormInput,
): CompanyProfileRawFormInput {
  return {
    companyName: raw.companyName,
    countryRegion: raw.countryRegion,
    industry: raw.industry,
    companySize: raw.companySize,
    respondentRole: raw.respondentRole,
    departmentFunction: raw.departmentFunction,
    handlesSensitiveOrRegulatedData: raw.handlesSensitiveOrRegulatedData,
    mainAiConcerns: raw.mainAiConcerns,
  };
}

export async function submitCompanyProfile(
  _previousState: CompanyProfileFormState,
  formData: FormData,
): Promise<CompanyProfileFormState> {
  const raw = parseCompanyProfileFormData(formData);

  try {
    const validated = validateCompanyProfileInput(raw);
    const { publicToken } = await createCompanyProfileAssessment(validated);
    redirect(
      `/ai-risk-assessment/tools?session=${encodeURIComponent(publicToken)}`,
    );
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    if (error instanceof ZodError) {
      return {
        status: "error",
        message: "Please fix the highlighted fields and try again.",
        fieldErrors: formatZodFieldErrors(error),
        values: buildFormValuesFromRaw(raw),
      };
    }

    return {
      status: "error",
      message: "We could not save this step. Please try again.",
      values: buildFormValuesFromRaw(raw),
    };
  }
}

import { z } from "zod";

import {
  COMPANY_NAME_MAX_LENGTH,
  COMPANY_SIZE_VALUES,
  COUNTRY_REGION_VALUES,
  DEPARTMENT_FUNCTION_VALUES,
  INDUSTRY_VALUES,
  MAIN_AI_CONCERN_VALUES,
  RESPONDENT_ROLE_VALUES,
  SENSITIVE_DATA_VALUES,
} from "./constants";
import type { CompanyProfileInput, CompanyProfileRawFormInput } from "./types";

export const companyProfileSchema = z.object({
  companyName: z
    .string()
    .trim()
    .max(COMPANY_NAME_MAX_LENGTH)
    .transform((value) => (value.length === 0 ? null : value)),
  countryRegion: z.enum(COUNTRY_REGION_VALUES, {
    errorMap: () => ({ message: "Please choose a country or region." }),
  }),
  industry: z.enum(INDUSTRY_VALUES, {
    errorMap: () => ({ message: "Please choose an industry." }),
  }),
  companySize: z.enum(COMPANY_SIZE_VALUES, {
    errorMap: () => ({ message: "Please choose a company size." }),
  }),
  respondentRole: z.enum(RESPONDENT_ROLE_VALUES, {
    errorMap: () => ({ message: "Please choose your role." }),
  }),
  departmentFunction: z
    .string()
    .trim()
    .transform((value) => (value.length === 0 ? null : value))
    .pipe(z.enum(DEPARTMENT_FUNCTION_VALUES).nullable()),
  handlesSensitiveOrRegulatedData: z.enum(SENSITIVE_DATA_VALUES, {
    errorMap: () => ({
      message:
        "Please indicate whether you handle sensitive or regulated data.",
    }),
  }),
  mainAiConcerns: z
    .array(z.enum(MAIN_AI_CONCERN_VALUES))
    .min(1, "Select at least one main AI concern.")
    .max(5, "Select up to five main AI concerns.")
    .refine((values) => new Set(values).size === values.length, {
      message: "Remove duplicate AI concerns.",
    }),
});

export type CompanyProfileSchemaInput = z.input<typeof companyProfileSchema>;
export type CompanyProfileSchemaOutput = z.output<typeof companyProfileSchema>;

export function parseCompanyProfileFormData(
  formData: FormData,
): CompanyProfileRawFormInput {
  const rawConcerns = formData
    .getAll("mainAiConcerns")
    .map((value) => value.toString())
    .filter((value) => value.length > 0);

  const departmentRaw = formData.get("departmentFunction")?.toString() ?? "";

  return {
    companyName: formData.get("companyName")?.toString() ?? "",
    countryRegion: formData.get("countryRegion")?.toString() ?? "",
    industry: formData.get("industry")?.toString() ?? "",
    companySize: formData.get("companySize")?.toString() ?? "",
    respondentRole: formData.get("respondentRole")?.toString() ?? "",
    departmentFunction: departmentRaw,
    handlesSensitiveOrRegulatedData:
      formData.get("handlesSensitiveOrRegulatedData")?.toString() ?? "",
    mainAiConcerns: rawConcerns,
  };
}

export function validateCompanyProfileInput(
  input: CompanyProfileRawFormInput,
): CompanyProfileInput {
  return companyProfileSchema.parse(input);
}

export function formatZodFieldErrors(
  error: z.ZodError,
): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string") {
      const existing = fieldErrors[key] ?? [];
      fieldErrors[key] = [...existing, issue.message];
    } else {
      const existing = fieldErrors.form ?? [];
      fieldErrors.form = [...existing, issue.message];
    }
  }

  return fieldErrors;
}

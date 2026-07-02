import { z } from "zod";

import {
  COMPANY_NAME_MAX_LENGTH,
  FULL_NAME_MAX_LENGTH,
  PLACEHOLDER_EMAIL_PATTERNS,
  ROLE_TITLE_MAX_LENGTH,
  WORK_EMAIL_MAX_LENGTH,
} from "./constants";
import {
  FOLLOW_UP_INTEREST_VALUES,
  type LeadCaptureInput,
  type LeadCaptureRawFormInput,
} from "./types";

const HTML_TAG_PATTERN = /<[^>]*>/;
const URL_PATTERN = /https?:\/\/|www\./i;

function rejectHtmlAndUrls(value: string): boolean {
  return !HTML_TAG_PATTERN.test(value) && !URL_PATTERN.test(value);
}

function isPlaceholderEmail(email: string): boolean {
  return PLACEHOLDER_EMAIL_PATTERNS.some((pattern) => pattern.test(email));
}

const optionalTextField = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength)
    .transform((value) => (value.length === 0 ? null : value))
    .pipe(
      z
        .string()
        .nullable()
        .refine((value) => value === null || rejectHtmlAndUrls(value), {
          message: "Remove HTML, links, or script content.",
        }),
    );

export const leadCaptureSchema = z.object({
  publicToken: z
    .string()
    .trim()
    .min(1, "Session reference is required.")
    .regex(
      /^[A-Za-z0-9_-]{32,64}$/,
      "This assessment session could not be verified.",
    ),
  workEmail: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Work email is required.")
    .max(WORK_EMAIL_MAX_LENGTH, "Email is too long.")
    .email("Enter a valid work email address.")
    .refine((email) => !isPlaceholderEmail(email), {
      message: "Enter a real work email address.",
    }),
  fullName: optionalTextField(FULL_NAME_MAX_LENGTH),
  companyName: optionalTextField(COMPANY_NAME_MAX_LENGTH),
  roleTitle: optionalTextField(ROLE_TITLE_MAX_LENGTH),
  followUpInterest: z
    .string()
    .trim()
    .transform((value) => (value.length === 0 ? null : value))
    .pipe(z.enum(FOLLOW_UP_INTEREST_VALUES).nullable()),
  consent: z.literal(true, {
    errorMap: () => ({
      message: "Consent is required to request follow-up.",
    }),
  }),
});

export function parseLeadCaptureFormData(
  formData: FormData,
): LeadCaptureRawFormInput {
  return {
    publicToken: formData.get("publicToken")?.toString() ?? "",
    workEmail: formData.get("workEmail")?.toString() ?? "",
    fullName: formData.get("fullName")?.toString() ?? "",
    companyName: formData.get("companyName")?.toString() ?? "",
    roleTitle: formData.get("roleTitle")?.toString() ?? "",
    followUpInterest: formData.get("followUpInterest")?.toString() ?? "",
    consent: formData.get("consent") === "on",
  };
}

export function validateLeadCaptureInput(
  input: LeadCaptureRawFormInput,
): LeadCaptureInput {
  return leadCaptureSchema.parse(input);
}

export function formatZodFieldErrors(
  error: z.ZodError,
): Partial<Record<keyof LeadCaptureRawFormInput, string[]>> {
  const fieldErrors: Partial<Record<keyof LeadCaptureRawFormInput, string[]>> =
    {};

  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field !== "string") {
      continue;
    }
    const key = field as keyof LeadCaptureRawFormInput;
    if (!fieldErrors[key]) {
      fieldErrors[key] = [];
    }
    fieldErrors[key]?.push(issue.message);
  }

  return fieldErrors;
}

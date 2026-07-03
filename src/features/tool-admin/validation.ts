import { z } from "zod";

import { CONFIDENCE_LEVELS } from "@/features/tool-profiles/constants";

import {
  CONFIDENCE_FILTER_OPTIONS,
  INITIAL_PROFILE_VERSION,
  TOOL_NAME_MAX_LENGTH,
  TOOL_REVIEW_NOTES_MAX_LENGTH,
  TOOL_SLUG_MAX_LENGTH,
  TOOL_SLUG_PATTERN,
  TOOL_SOURCE_NOTES_MAX_LENGTH,
  TOOL_TEXT_FIELD_MAX_LENGTH,
  TOOL_URL_MAX_LENGTH,
  TOOL_ADMIN_DEFAULT_LIMIT,
  TOOL_ADMIN_DEFAULT_PAGE,
  TOOL_ADMIN_MAX_LIMIT,
  TOOL_ADMIN_MAX_SEARCH_LENGTH,
  TOOL_STATUS_FILTER_OPTIONS,
} from "./constants";

export class ToolAdminValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ToolAdminValidationError";
  }
}

const safeText = (max: number, minLength = 0) =>
  z
    .string()
    .trim()
    .min(minLength)
    .max(max)
    .refine((value) => !/<script|javascript:/i.test(value), {
      message: "Invalid characters in text field.",
    });

const optionalUrl = z
  .string()
  .trim()
  .max(TOOL_URL_MAX_LENGTH)
  .optional()
  .transform((value) => (value === "" ? undefined : value))
  .refine((value) => !value || /^https?:\/\//i.test(value), {
    message: "URL must start with http:// or https://",
  });

const requiredUrl = z
  .string()
  .trim()
  .min(1, "Website URL is required.")
  .max(TOOL_URL_MAX_LENGTH)
  .refine((value) => /^https?:\/\//i.test(value), {
    message: "URL must start with http:// or https://",
  });

export const toolSlugSchema = z
  .string()
  .trim()
  .min(1)
  .max(TOOL_SLUG_MAX_LENGTH)
  .regex(
    TOOL_SLUG_PATTERN,
    "Slug must be lowercase letters, numbers, and hyphens.",
  );

const toolProfileFieldsSchema = z.object({
  name: safeText(TOOL_NAME_MAX_LENGTH, 1),
  categorySlug: z.string().trim().min(1, "Category is required."),
  websiteUrl: requiredUrl,
  isActive: z.coerce.boolean(),
  publicInfoConfidenceLevel: z.enum(CONFIDENCE_LEVELS),
  reviewNotes: safeText(TOOL_REVIEW_NOTES_MAX_LENGTH),
  sourceConfidenceNotes: safeText(TOOL_SOURCE_NOTES_MAX_LENGTH),
  commonUseCases: z
    .string()
    .trim()
    .min(1, "At least one use case is required.")
    .max(TOOL_TEXT_FIELD_MAX_LENGTH),
  supportsFileUploads: z.coerce.boolean(),
  supportsMeetingTranscripts: z.coerce.boolean(),
  codingAssistantRelevance: z.coerce.boolean(),
  agenticOrConnectedToolRelevance: z.coerce.boolean(),
  publicPrivacyUrl: optionalUrl,
  publicSecurityUrl: optionalUrl,
  publicTrustUrl: optionalUrl,
  trainingUseNotes: safeText(TOOL_TEXT_FIELD_MAX_LENGTH, 1),
  dataRetentionNotes: safeText(TOOL_TEXT_FIELD_MAX_LENGTH, 1),
  deletionControlNotes: safeText(TOOL_TEXT_FIELD_MAX_LENGTH, 1),
  enterpriseAdminControlsNotes: safeText(TOOL_TEXT_FIELD_MAX_LENGTH, 1),
  auditLoggingNotes: safeText(TOOL_TEXT_FIELD_MAX_LENGTH, 1),
  complianceSecurityDocsNotes: safeText(TOOL_TEXT_FIELD_MAX_LENGTH, 1),
  subprocessorNotes: safeText(TOOL_TEXT_FIELD_MAX_LENGTH, 1),
  sensitiveDataConcerns: safeText(TOOL_TEXT_FIELD_MAX_LENGTH, 1),
  recommendedUsageBoundaries: safeText(TOOL_TEXT_FIELD_MAX_LENGTH, 1),
});

export const createToolProfileSchema = toolProfileFieldsSchema.extend({
  slug: toolSlugSchema,
});

export const updateToolProfileSchema = toolProfileFieldsSchema.extend({
  toolSlug: toolSlugSchema,
});

export const publishToolProfileSchema = z.object({
  toolSlug: toolSlugSchema,
  versionLabel: z.string().trim().min(1),
});

export const unpublishToolProfileSchema = z.object({
  toolSlug: toolSlugSchema,
});

export type CreateToolProfileInput = z.infer<typeof createToolProfileSchema>;
export type UpdateToolProfileInput = z.infer<typeof updateToolProfileSchema>;
export type PublishToolProfileInput = z.infer<typeof publishToolProfileSchema>;
export type UnpublishToolProfileInput = z.infer<
  typeof unpublishToolProfileSchema
>;

export const adminToolListFiltersSchema = z.object({
  search: z
    .string()
    .trim()
    .max(TOOL_ADMIN_MAX_SEARCH_LENGTH)
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
  categorySlug: z.string().trim().optional(),
  status: z.enum(TOOL_STATUS_FILTER_OPTIONS).optional(),
  confidenceLevel: z.enum(CONFIDENCE_FILTER_OPTIONS).optional(),
  page: z.coerce.number().int().min(1).default(TOOL_ADMIN_DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(TOOL_ADMIN_MAX_LIMIT)
    .default(TOOL_ADMIN_DEFAULT_LIMIT),
});

export function validateToolSlugForAdmin(slug: string): void {
  const result = toolSlugSchema.safeParse(slug);
  if (!result.success) {
    throw new ToolAdminValidationError("Tool slug is invalid.");
  }
}

export function parseToolAdminListSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
) {
  const first = (key: string) => {
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value;
  };

  return adminToolListFiltersSchema.parse({
    search: first("search"),
    categorySlug: first("categorySlug"),
    status: first("status"),
    confidenceLevel: first("confidenceLevel"),
    page: first("page"),
    limit: first("limit"),
  });
}

export function parseCreateToolProfileFormData(formData: FormData) {
  return createToolProfileSchema.parse({
    slug: formData.get("slug"),
    name: formData.get("name"),
    categorySlug: formData.get("categorySlug"),
    websiteUrl: formData.get("websiteUrl"),
    isActive: formData.get("isActive") === "on",
    publicInfoConfidenceLevel: formData.get("publicInfoConfidenceLevel"),
    reviewNotes: formData.get("reviewNotes") ?? "",
    sourceConfidenceNotes: formData.get("sourceConfidenceNotes") ?? "",
    commonUseCases: formData.get("commonUseCases"),
    supportsFileUploads: formData.get("supportsFileUploads") === "on",
    supportsMeetingTranscripts:
      formData.get("supportsMeetingTranscripts") === "on",
    codingAssistantRelevance: formData.get("codingAssistantRelevance") === "on",
    agenticOrConnectedToolRelevance:
      formData.get("agenticOrConnectedToolRelevance") === "on",
    publicPrivacyUrl: formData.get("publicPrivacyUrl") ?? "",
    publicSecurityUrl: formData.get("publicSecurityUrl") ?? "",
    publicTrustUrl: formData.get("publicTrustUrl") ?? "",
    trainingUseNotes: formData.get("trainingUseNotes"),
    dataRetentionNotes: formData.get("dataRetentionNotes"),
    deletionControlNotes: formData.get("deletionControlNotes"),
    enterpriseAdminControlsNotes: formData.get("enterpriseAdminControlsNotes"),
    auditLoggingNotes: formData.get("auditLoggingNotes"),
    complianceSecurityDocsNotes: formData.get("complianceSecurityDocsNotes"),
    subprocessorNotes: formData.get("subprocessorNotes"),
    sensitiveDataConcerns: formData.get("sensitiveDataConcerns"),
    recommendedUsageBoundaries: formData.get("recommendedUsageBoundaries"),
  });
}

export function parseUpdateToolProfileFormData(formData: FormData) {
  return updateToolProfileSchema.parse({
    toolSlug: formData.get("toolSlug"),
    name: formData.get("name"),
    categorySlug: formData.get("categorySlug"),
    websiteUrl: formData.get("websiteUrl"),
    isActive: formData.get("isActive") === "on",
    publicInfoConfidenceLevel: formData.get("publicInfoConfidenceLevel"),
    reviewNotes: formData.get("reviewNotes") ?? "",
    sourceConfidenceNotes: formData.get("sourceConfidenceNotes") ?? "",
    commonUseCases: formData.get("commonUseCases"),
    supportsFileUploads: formData.get("supportsFileUploads") === "on",
    supportsMeetingTranscripts:
      formData.get("supportsMeetingTranscripts") === "on",
    codingAssistantRelevance: formData.get("codingAssistantRelevance") === "on",
    agenticOrConnectedToolRelevance:
      formData.get("agenticOrConnectedToolRelevance") === "on",
    publicPrivacyUrl: formData.get("publicPrivacyUrl") ?? "",
    publicSecurityUrl: formData.get("publicSecurityUrl") ?? "",
    publicTrustUrl: formData.get("publicTrustUrl") ?? "",
    trainingUseNotes: formData.get("trainingUseNotes"),
    dataRetentionNotes: formData.get("dataRetentionNotes"),
    deletionControlNotes: formData.get("deletionControlNotes"),
    enterpriseAdminControlsNotes: formData.get("enterpriseAdminControlsNotes"),
    auditLoggingNotes: formData.get("auditLoggingNotes"),
    complianceSecurityDocsNotes: formData.get("complianceSecurityDocsNotes"),
    subprocessorNotes: formData.get("subprocessorNotes"),
    sensitiveDataConcerns: formData.get("sensitiveDataConcerns"),
    recommendedUsageBoundaries: formData.get("recommendedUsageBoundaries"),
  });
}

export function parsePublishToolProfileFormData(formData: FormData) {
  return publishToolProfileSchema.parse({
    toolSlug: formData.get("toolSlug"),
    versionLabel: formData.get("versionLabel"),
  });
}

export function parseUnpublishToolProfileFormData(formData: FormData) {
  return unpublishToolProfileSchema.parse({
    toolSlug: formData.get("toolSlug"),
  });
}

export { INITIAL_PROFILE_VERSION };

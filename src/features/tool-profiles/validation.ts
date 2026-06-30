import { z } from "zod";

import {
  CONFIDENCE_LEVELS,
  MVP_TOOL_SLUGS,
  PROFILE_SOURCE_TYPES,
  PUBLISHED_STATUSES,
  TOOL_CATEGORY_SLUGS,
} from "./constants";
import type { ToolProfileSeed } from "./types";

export const toolSlugSchema = z.enum(MVP_TOOL_SLUGS);

export const categorySlugSchema = z.enum(TOOL_CATEGORY_SLUGS);

export const confidenceLevelSchema = z.enum(CONFIDENCE_LEVELS);

export const publishedStatusSchema = z.enum(PUBLISHED_STATUSES);

export const profileSourceMetadataSchema = z.object({
  label: z.string().min(1),
  url: z.string().url(),
  source_type: z.enum(PROFILE_SOURCE_TYPES),
  reviewed_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().min(1),
});

export const toolProfileSeedSchema = z.object({
  toolSlug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  toolName: z.string().min(1),
  categorySlug: categorySlugSchema,
  websiteUrl: z.string().url(),
  profileVersion: z.string().min(1),
  publishedStatus: publishedStatusSchema,
  publicInfoConfidenceLevel: confidenceLevelSchema,
  lastReviewedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reviewedBy: z.string().min(1),
  commonUseCases: z.array(z.string().min(1)).min(1),
  supportsFileUploads: z.boolean(),
  supportsMeetingTranscripts: z.boolean(),
  codingAssistantRelevance: z.boolean(),
  agenticOrConnectedToolRelevance: z.boolean(),
  publicPrivacyUrl: z.string().url().nullable(),
  publicSecurityUrl: z.string().url().nullable(),
  publicTrustUrl: z.string().url().nullable(),
  trainingUseNotes: z.string().min(1),
  dataRetentionNotes: z.string().min(1),
  deletionControlNotes: z.string().min(1),
  enterpriseAdminControlsNotes: z.string().min(1),
  auditLoggingNotes: z.string().min(1),
  complianceSecurityDocsNotes: z.string().min(1),
  subprocessorNotes: z.string().min(1),
  sensitiveDataConcerns: z.string().min(1),
  recommendedUsageBoundaries: z.string().min(1),
  sources: z.array(profileSourceMetadataSchema).min(1),
  reviewNotes: z.string().optional(),
  sourceConfidenceNotes: z.string().optional(),
});

export function validateToolProfileSeed(
  profile: ToolProfileSeed,
): ToolProfileSeed {
  return toolProfileSeedSchema.parse(profile);
}

export function validateAllToolProfileSeeds(
  profiles: ToolProfileSeed[],
): ToolProfileSeed[] {
  const parsed = profiles.map((profile) => validateToolProfileSeed(profile));

  const slugs = parsed.map((p) => p.toolSlug);
  const uniqueSlugs = new Set(slugs);
  if (uniqueSlugs.size !== slugs.length) {
    throw new Error("Duplicate tool slugs found in seed data.");
  }

  return parsed;
}

export function validateToolSlug(slug: string): boolean {
  return toolSlugSchema.safeParse(slug).success;
}

import "server-only";

import type {
  AssessmentToolProfile,
  ToolSlugValidationResult,
} from "@/features/tool-profiles/types";
import {
  getPublishedToolProfileBySlug,
  getPublishedToolProfiles,
  getPublishedToolProfilesBySlugs,
  type PublishedToolProfileRow,
} from "@/server/repositories/tool-profiles.repository";

function toAssessmentToolProfile(
  row: PublishedToolProfileRow,
): AssessmentToolProfile {
  const { tool, category, profile } = row;

  return {
    slug: tool.slug,
    name: tool.name,
    categorySlug: category.slug,
    categoryName: category.name,
    websiteUrl: tool.websiteUrl,
    profileVersion: profile.profileVersion,
    commonUseCases: profile.commonUseCases ?? [],
    supportsFileUploads: profile.supportsFileUploads,
    supportsMeetingTranscripts: profile.supportsMeetingTranscripts,
    codingAssistantRelevance: profile.codingAssistantRelevance,
    agenticOrConnectedToolRelevance: profile.agenticOrConnectedToolRelevance,
    publicPrivacyUrl: profile.publicPrivacyUrl,
    publicSecurityUrl: profile.publicSecurityUrl,
    publicTrustUrl: profile.publicTrustUrl,
    trainingUseNotes: profile.trainingUseNotes,
    dataRetentionNotes: profile.dataRetentionNotes,
    deletionControlNotes: profile.deletionControlNotes,
    enterpriseAdminControlsNotes: profile.enterpriseAdminControlsNotes,
    auditLoggingNotes: profile.auditLoggingNotes,
    complianceSecurityDocsNotes: profile.complianceSecurityDocsNotes,
    subprocessorNotes: profile.subprocessorNotes,
    sensitiveDataConcerns: profile.sensitiveDataConcerns,
    recommendedUsageBoundaries: profile.recommendedUsageBoundaries,
    publicInfoConfidenceLevel: profile.publicInfoConfidenceLevel,
    lastReviewedAt: profile.lastReviewedAt
      ? profile.lastReviewedAt.toISOString()
      : null,
    sources: profile.sources ?? [],
    sourceConfidenceNotes: profile.sourceConfidenceNotes,
  };
}

export async function listAssessmentToolProfiles(): Promise<
  AssessmentToolProfile[]
> {
  const rows = await getPublishedToolProfiles();
  return rows.map(toAssessmentToolProfile);
}

export async function getAssessmentToolProfile(
  slug: string,
): Promise<AssessmentToolProfile | null> {
  const row = await getPublishedToolProfileBySlug(slug);
  if (!row) {
    return null;
  }
  return toAssessmentToolProfile(row);
}

export async function validateToolSlugs(
  slugs: string[],
): Promise<ToolSlugValidationResult> {
  if (slugs.length === 0) {
    return { valid: [], invalid: [] };
  }

  const uniqueSlugs = [...new Set(slugs)];
  const rows = await getPublishedToolProfilesBySlugs(uniqueSlugs);
  const validSet = new Set(rows.map((row) => row.tool.slug));

  const valid: string[] = [];
  const invalid: string[] = [];

  for (const slug of uniqueSlugs) {
    if (validSet.has(slug)) {
      valid.push(slug);
    } else {
      invalid.push(slug);
    }
  }

  return { valid, invalid };
}

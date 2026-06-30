/** Source metadata stored on profile versions (JSONB). */
export type ProfileSourceMetadata = {
  label: string;
  url: string;
  source_type:
    | "official_vendor"
    | "official_vendor_help"
    | "official_vendor_legal"
    | "official_vendor_trust"
    | "reputable_reporting";
  reviewed_at: string;
  notes: string;
};

export type ConfidenceLevel = "high" | "medium" | "low" | "unknown";

export type PublishedStatus = "draft" | "published" | "archived";

/** Public-facing profile shape for assessment UI (Module 6+). */
export type AssessmentToolProfile = {
  slug: string;
  name: string;
  categorySlug: string;
  categoryName: string;
  websiteUrl: string | null;
  profileVersion: string;
  commonUseCases: string[];
  supportsFileUploads: boolean | null;
  supportsMeetingTranscripts: boolean | null;
  codingAssistantRelevance: boolean | null;
  agenticOrConnectedToolRelevance: boolean | null;
  publicPrivacyUrl: string | null;
  publicSecurityUrl: string | null;
  publicTrustUrl: string | null;
  trainingUseNotes: string | null;
  dataRetentionNotes: string | null;
  deletionControlNotes: string | null;
  enterpriseAdminControlsNotes: string | null;
  auditLoggingNotes: string | null;
  complianceSecurityDocsNotes: string | null;
  subprocessorNotes: string | null;
  sensitiveDataConcerns: string | null;
  recommendedUsageBoundaries: string | null;
  publicInfoConfidenceLevel: ConfidenceLevel;
  lastReviewedAt: string | null;
  sources: ProfileSourceMetadata[];
  sourceConfidenceNotes: string | null;
};

/** Seed-time profile definition before DB insert. */
export type ToolProfileSeed = {
  toolSlug: string;
  toolName: string;
  categorySlug: string;
  websiteUrl: string;
  profileVersion: string;
  publishedStatus: PublishedStatus;
  publicInfoConfidenceLevel: ConfidenceLevel;
  lastReviewedAt: string;
  reviewedBy: string;
  commonUseCases: string[];
  supportsFileUploads: boolean;
  supportsMeetingTranscripts: boolean;
  codingAssistantRelevance: boolean;
  agenticOrConnectedToolRelevance: boolean;
  publicPrivacyUrl: string | null;
  publicSecurityUrl: string | null;
  publicTrustUrl: string | null;
  trainingUseNotes: string;
  dataRetentionNotes: string;
  deletionControlNotes: string;
  enterpriseAdminControlsNotes: string;
  auditLoggingNotes: string;
  complianceSecurityDocsNotes: string;
  subprocessorNotes: string;
  sensitiveDataConcerns: string;
  recommendedUsageBoundaries: string;
  sources: ProfileSourceMetadata[];
  reviewNotes?: string;
  sourceConfidenceNotes?: string;
};

export type ToolSlugValidationResult = {
  valid: string[];
  invalid: string[];
};

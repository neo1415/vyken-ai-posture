export type AdminToolListItem = {
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  status: string;
  publishedProfileStatus: string | null;
  confidenceLevel: string | null;
  publishedVersionLabel: string | null;
  lastUpdatedAt: string | null;
  hasSourceNotes: boolean;
};

export type AdminToolListFilters = {
  search?: string;
  categorySlug?: string;
  status?: "active" | "inactive";
  confidenceLevel?: string;
  page?: number;
  limit?: number;
};

export type AdminToolListResult = {
  items: AdminToolListItem[];
  total: number;
  page: number;
  limit: number;
};

export type AdminToolProfileData = {
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
};

export type AdminToolProfileVersion = {
  versionLabel: string;
  status: string;
  confidenceLevel: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  lastReviewedAt: string | null;
};

export type AdminToolDetail = {
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  status: string;
  websiteUrl: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  publishedProfile: {
    versionLabel: string;
    status: string;
    confidenceLevel: string | null;
    summary: string | null;
    sourceNotes: string | null;
    reviewNotes: string | null;
    profileData: AdminToolProfileData;
  } | null;
  draftProfile: {
    versionLabel: string;
    status: string;
    confidenceLevel: string | null;
    profileData: AdminToolProfileData;
    reviewNotes: string | null;
    sourceNotes: string | null;
  } | null;
  versions: AdminToolProfileVersion[];
};

export type AdminToolCategoryOption = {
  slug: string;
  name: string;
};

export type ToolAdminActionFormState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export type ToolProfileFormInput = {
  slug?: string;
  name: string;
  categorySlug: string;
  websiteUrl: string;
  isActive: boolean;
  publicInfoConfidenceLevel: string;
  reviewNotes: string;
  sourceConfidenceNotes: string;
  commonUseCases: string;
  supportsFileUploads: boolean;
  supportsMeetingTranscripts: boolean;
  codingAssistantRelevance: boolean;
  agenticOrConnectedToolRelevance: boolean;
  publicPrivacyUrl: string;
  publicSecurityUrl: string;
  publicTrustUrl: string;
  trainingUseNotes: string;
  dataRetentionNotes: string;
  deletionControlNotes: string;
  enterpriseAdminControlsNotes: string;
  auditLoggingNotes: string;
  complianceSecurityDocsNotes: string;
  subprocessorNotes: string;
  sensitiveDataConcerns: string;
  recommendedUsageBoundaries: string;
};

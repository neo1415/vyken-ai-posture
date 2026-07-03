export type AdminLeadListItem = {
  publicToken: string;
  submittedAt: string;
  email: string;
  name: string | null;
  companyName: string | null;
  role: string | null;
  followUpInterest: string | null;
  leadStatus: string;
  overallScore: number | null;
  riskLevel: string | null;
  confidenceLevel: string | null;
  reportStatus: string | null;
  emailDeliveryStatus: string;
};

export type AdminCategoryScore = {
  label: string;
  score: number;
  riskLevel: string;
};

export type AdminLeadDetail = {
  publicToken: string;
  lead: {
    email: string;
    name: string | null;
    companyName: string | null;
    role: string | null;
    followUpInterest: string | null;
    consentToFollowUp: boolean;
    status: string;
    createdAt: string;
  };
  assessment: {
    companyName: string | null;
    industry: string;
    companySize: string;
    countryRegion: string;
    respondentRole: string;
    mainAiConcerns: string[];
    overallScore: number | null;
    riskLevel: string | null;
    confidenceLevel: string | null;
    categoryScores: AdminCategoryScore[];
  };
  tools: {
    knownTools: string[];
    unknownTools: string[];
    hasNotSureSelection: boolean;
  };
  findings: {
    title: string;
    severity: string;
    summary: string;
  }[];
  recommendations: {
    title: string;
    priority: string;
    effort: string;
    summary: string;
  }[];
  report: {
    status: string | null;
    generatedAt: string | null;
    hasPdf: boolean;
    hasReportContext: boolean;
  };
  emailEvents: {
    type: string;
    recipient: string;
    status: string;
    provider: string | null;
    sentAt: string | null;
    errorMessage: string | null;
  }[];
  emailDeliveryStatus: string;
};

export type AdminLeadListFilters = {
  search?: string;
  riskLevel?: string;
  emailStatus?: string;
  leadStatus?: string;
  page?: number;
  limit?: number;
};

export type AdminLeadListResult = {
  items: AdminLeadListItem[];
  total: number;
  page: number;
  limit: number;
};

export type AdminLeadStatusUpdateResult = {
  publicToken: string;
  status: string;
};

export type AdminEmailActionResult = {
  outcome: string;
  message: string;
};

export type AdminAccessFormState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export type AdminActionFormState = {
  status: "idle" | "success" | "error";
  message?: string;
};

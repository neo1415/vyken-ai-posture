export type ReportContextVersion = "report-context-v1";

export type ReportRiskLevel = "low" | "moderate" | "high" | "critical";

export type ReportConfidenceLevel = "low" | "medium" | "high";

export type FindingSeverity = "low" | "medium" | "high" | "critical";

export type FindingConfidence = "low" | "medium" | "high";

export type RecommendationPriority = "low" | "medium" | "high" | "urgent";

export type RecommendationEffort = "low" | "medium" | "high";

export type ReportContext = {
  reportContextVersion: ReportContextVersion;
  generatedAt: string;

  assessment: {
    publicToken: string;
    completedAt: string | null;
    status: string;
  };

  company: {
    companyName: string | null;
    industry: string;
    companySize: string;
    countryRegion: string;
    respondentRole: string;
    departmentFunction: string | null;
    handlesSensitiveOrRegulatedData: string;
    mainAiConcerns: string[];
  };

  lead: {
    hasLead: boolean;
    email: string | null;
    name: string | null;
    companyName: string | null;
    role: string | null;
    followUpInterest: string | null;
    consentToFollowUp: boolean | null;
  };

  tools: {
    knownTools: {
      name: string;
      slug: string;
      category: string;
      profileConfidence: string;
    }[];
    unknownTools: {
      name: string;
      url: string | null;
    }[];
    hasNotSureSelection: boolean;
    toolCount: number;
  };

  riskSummary: {
    overallScore: number;
    overallRiskLevel: ReportRiskLevel;
    confidenceLevel: ReportConfidenceLevel;
    headline: string;
    explanation: string;
    caveats: string[];
  };

  categoryScores: {
    categoryId: string;
    label: string;
    score: number;
    riskLevel: ReportRiskLevel;
    explanation: string;
  }[];

  findings: {
    findingId: string;
    categoryId: string;
    severity: FindingSeverity;
    title: string;
    summary: string;
    confidence: FindingConfidence;
  }[];

  recommendations: {
    recommendationId: string;
    title: string;
    summary: string;
    priority: RecommendationPriority;
    effort: RecommendationEffort;
    categoryId: string;
    implementationSteps: string[];
    whyThisMatters: string;
    caveats: string[];
  }[];

  appendix: {
    methodology: string[];
    frameworksReferenced: string[];
    limitations: string[];
    dataSources: string[];
  };
};

export type ReportSection = {
  sectionId: string;
  title: string;
  description: string;
  included: boolean;
  order: number;
};

export type ReportContextBuilderInput = {
  generatedAt: string;
  publicToken: string;
  sessionStatus: string;
  completedAt: string | null;
  companyProfile: {
    companyName: string | null;
    industry: string;
    companySize: string;
    countryRegion: string | null;
    respondentRole: string | null;
    departmentFunction: string | null;
    handlesSensitiveOrRegulatedData: string | null;
    mainAiConcerns: string[];
  };
  lead: {
    hasLead: boolean;
    email: string | null;
    name: string | null;
    companyName: string | null;
    role: string | null;
    followUpInterest: string | null;
    consentToFollowUp: boolean | null;
  };
  tools: {
    knownTools: {
      name: string;
      slug: string;
      category: string;
      profileConfidence: string;
    }[];
    unknownTools: {
      name: string;
      url: string | null;
    }[];
    hasNotSureSelection: boolean;
  };
  scoringResult: {
    overallScore: number;
    overallRiskLevel: ReportRiskLevel;
    confidenceLevel: ReportConfidenceLevel;
    headline: string;
    explanation: string;
    caveats: string[];
    categoryScores: ReportContext["categoryScores"];
  };
  findings: ReportContext["findings"];
  recommendations: ReportContext["recommendations"];
};

export type ReportContextResult = {
  context: ReportContext;
  sections: ReportSection[];
};

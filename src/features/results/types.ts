export type ResultRiskLevel = "low" | "moderate" | "high" | "critical";

export type ResultConfidenceLevel = "low" | "medium" | "high";

export type FindingSeverity = "low" | "medium" | "high" | "critical";

export type FindingConfidence = "low" | "medium" | "high";

export type RecommendationPriority = "low" | "medium" | "high" | "urgent";

export type RecommendationEffort = "low" | "medium" | "high";

export type AssessmentResultViewModel = {
  publicToken: string;
  companyContext: {
    companyName: string | null;
    industry: string;
    companySize: string;
    countryRegion: string;
    handlesSensitiveOrRegulatedData: string;
  };
  summary: {
    overallScore: number;
    overallRiskLevel: ResultRiskLevel;
    confidenceLevel: ResultConfidenceLevel;
    headline: string;
    explanation: string;
    caveats: string[];
    signalCount: number;
    findingCount: number;
    recommendationCount: number;
  };
  categoryScores: {
    categoryId: string;
    label: string;
    score: number;
    riskLevel: ResultRiskLevel;
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
};

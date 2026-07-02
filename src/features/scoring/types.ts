export type RiskLevel = "low" | "moderate" | "high" | "critical";

export type SignalSeverity = "low" | "medium" | "high" | "critical";

export type ScoringConfidence = "low" | "medium" | "high";

export type ScoringCategoryId =
  | "visibility_and_inventory"
  | "data_exposure"
  | "governance_controls"
  | "vendor_and_tool_risk"
  | "agentic_and_coding_risk"
  | "decision_impact_risk";

export type CategoryScore = {
  categoryId: ScoringCategoryId;
  label: string;
  score: number; // 0–100 (rounded integer)
  riskLevel: RiskLevel;
  contributingSignals: string[];
  explanation: string;
};

export type RiskSignal = {
  signalId: string;
  categoryId: ScoringCategoryId;
  severity: SignalSeverity;
  title: string;
  description: string;
  evidence: string[];
  scoreImpact: number; // positive increases risk score
  confidence: ScoringConfidence;
  sourceAnswerIds: string[];
};

export type SelectedToolScoringContext = {
  toolSlug: string;
  toolName: string;
  categorySlug: string;
  supportsFileUploads: boolean | null;
  supportsMeetingTranscripts: boolean | null;
  codingAssistantRelevance: boolean | null;
  agenticOrConnectedToolRelevance: boolean | null;
  publicInfoConfidenceLevel: "high" | "medium" | "low" | "unknown";
};

export type UnknownToolScoringContext = {
  name: string;
  url: string | null;
};

export type CompanyProfileScoringContext = {
  industry: string;
  companySize: string;
  countryRegion: string | null;
  handlesSensitiveOrRegulatedData: string | null;
};

export type NormalizedAssessmentAnswer = {
  questionId: string;
  value: string | string[];
};

export type AssessmentScoringInput = {
  companyProfile: CompanyProfileScoringContext;
  selectedTools: SelectedToolScoringContext[];
  unknownTools: UnknownToolScoringContext[];
  hasNotSureToolSelection: boolean;
  answers: NormalizedAssessmentAnswer[];
};

export type AssessmentScoringSummary = {
  headline: string;
  explanation: string;
  caveats: string[];
  strongestFactors: string[];
};

export type AssessmentScoringResult = {
  overallScore: number; // 0–100
  overallRiskLevel: RiskLevel;
  confidenceLevel: ScoringConfidence;
  categoryScores: CategoryScore[];
  signals: RiskSignal[];
  scoringSummary: AssessmentScoringSummary;
  scoringModelVersion: string;
};

import type {
  AssessmentScoringResult,
  ScoringCategoryId,
  ScoringConfidence,
} from "@/features/scoring/types";

export type FindingSeverity = "low" | "medium" | "high" | "critical";

export type FindingConfidence = "low" | "medium" | "high";

export type FindingCategoryId = ScoringCategoryId;

export type AssessmentFinding = {
  findingId: string;
  categoryId: FindingCategoryId;
  severity: FindingSeverity;
  title: string;
  summary: string;
  sourceSignalIds: string[];
  evidence: string[];
  confidence: FindingConfidence;
};

export type RecommendationCategoryId =
  | "policy_and_governance"
  | "tool_inventory_and_approval"
  | "data_protection"
  | "logging_and_auditability"
  | "vendor_risk_review"
  | "human_review_and_decision_controls"
  | "developer_ai_controls"
  | "agentic_ai_controls"
  | "training_and_awareness";

export type RecommendationPriority = "low" | "medium" | "high" | "urgent";

export type RecommendationEffort = "low" | "medium" | "high";

export type VykenGuardRelevance = "none" | "low" | "medium" | "high";

export type AssessmentRecommendation = {
  recommendationId: string;
  title: string;
  summary: string;
  priority: RecommendationPriority;
  effort: RecommendationEffort;
  categoryId: RecommendationCategoryId;
  sourceFindingIds: string[];
  sourceSignalIds: string[];
  relatedRiskCategories: ScoringCategoryId[];
  implementationSteps: string[];
  whyThisMatters: string;
  vykenGuardRelevance: VykenGuardRelevance;
  caveats: string[];
};

export type RecommendationEngineInput = {
  scoringResult: AssessmentScoringResult;
  findings: AssessmentFinding[];
};

export type AssessmentRecommendationResult = {
  findings: AssessmentFinding[];
  recommendations: AssessmentRecommendation[];
  recommendationModelVersion: string;
  generatedAt: string;
  scoringConfidenceLevel: ScoringConfidence;
};

export type RecommendationTemplate = {
  recommendationId: string;
  title: string;
  summary: string;
  categoryId: RecommendationCategoryId;
  defaultEffort: RecommendationEffort;
  defaultPriority: RecommendationPriority;
  triggerSignalIds: string[];
  triggerCategoryIds?: ScoringCategoryId[];
  minCategoryRiskLevel?: "moderate" | "high" | "critical";
  implementationSteps: string[];
  whyThisMatters: string;
  vykenGuardRelevance: VykenGuardRelevance;
  defaultCaveats: string[];
  relatedRiskCategories: ScoringCategoryId[];
  priorityBoostSignalIds?: string[];
  urgentSignalIds?: string[];
};

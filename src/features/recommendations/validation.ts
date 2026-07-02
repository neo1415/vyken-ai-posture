import { BANNED_TERMS, MAX_RECOMMENDATIONS } from "./constants";
import type {
  AssessmentFinding,
  AssessmentRecommendation,
  AssessmentRecommendationResult,
  FindingCategoryId,
  FindingSeverity,
  RecommendationCategoryId,
  RecommendationEffort,
  RecommendationPriority,
} from "./types";

export class RecommendationValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RecommendationValidationError";
  }
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new RecommendationValidationError(message);
  }
}

const FINDING_CATEGORIES = new Set<FindingCategoryId>([
  "visibility_and_inventory",
  "data_exposure",
  "governance_controls",
  "vendor_and_tool_risk",
  "agentic_and_coding_risk",
  "decision_impact_risk",
]);

const FINDING_SEVERITIES = new Set<FindingSeverity>([
  "low",
  "medium",
  "high",
  "critical",
]);

const RECOMMENDATION_CATEGORIES = new Set<RecommendationCategoryId>([
  "policy_and_governance",
  "tool_inventory_and_approval",
  "data_protection",
  "logging_and_auditability",
  "vendor_risk_review",
  "human_review_and_decision_controls",
  "developer_ai_controls",
  "agentic_ai_controls",
  "training_and_awareness",
]);

const PRIORITIES = new Set<RecommendationPriority>([
  "low",
  "medium",
  "high",
  "urgent",
]);

const EFFORTS = new Set<RecommendationEffort>(["low", "medium", "high"]);

export function containsBannedTerm(text: string): string | null {
  const normalized = text.toLowerCase();
  for (const term of BANNED_TERMS) {
    if (normalized.includes(term)) {
      return term;
    }
  }
  return null;
}

function validateBannedLanguageInText(fieldPath: string, text: string): void {
  const match = containsBannedTerm(text);
  assert(match === null, `Banned term "${match}" found in ${fieldPath}.`);
}

function validateFinding(finding: AssessmentFinding): void {
  assert(
    FINDING_CATEGORIES.has(finding.categoryId),
    `Invalid finding category: ${finding.categoryId}`,
  );
  assert(
    FINDING_SEVERITIES.has(finding.severity),
    `Invalid finding severity: ${finding.severity}`,
  );
  assert(finding.title.trim().length > 0, "Finding title must not be empty.");
  assert(
    finding.summary.trim().length > 0,
    "Finding summary must not be empty.",
  );
  assert(
    finding.sourceSignalIds.length > 0,
    `Finding ${finding.findingId} must reference at least one signal.`,
  );

  validateBannedLanguageInText(
    `finding ${finding.findingId} title`,
    finding.title,
  );
  validateBannedLanguageInText(
    `finding ${finding.findingId} summary`,
    finding.summary,
  );
  for (const item of finding.evidence) {
    validateBannedLanguageInText(`finding ${finding.findingId} evidence`, item);
  }
}

function validateRecommendation(
  recommendation: AssessmentRecommendation,
  validFindingIds: Set<string>,
  validSignalIds: Set<string>,
): void {
  assert(
    RECOMMENDATION_CATEGORIES.has(recommendation.categoryId),
    `Invalid recommendation category: ${recommendation.categoryId}`,
  );
  assert(
    PRIORITIES.has(recommendation.priority),
    `Invalid recommendation priority: ${recommendation.priority}`,
  );
  assert(
    EFFORTS.has(recommendation.effort),
    `Invalid recommendation effort: ${recommendation.effort}`,
  );
  assert(
    recommendation.title.trim().length > 0,
    "Recommendation title must not be empty.",
  );
  assert(
    recommendation.summary.trim().length > 0,
    "Recommendation summary must not be empty.",
  );
  assert(
    recommendation.implementationSteps.length > 0,
    `Recommendation ${recommendation.recommendationId} must have implementation steps.`,
  );
  assert(
    recommendation.implementationSteps.every((s) => s.trim().length > 0),
    `Recommendation ${recommendation.recommendationId} has empty implementation step.`,
  );
  assert(
    recommendation.whyThisMatters.trim().length > 0,
    `Recommendation ${recommendation.recommendationId} must include whyThisMatters.`,
  );

  for (const signalId of recommendation.sourceSignalIds) {
    assert(
      validSignalIds.has(signalId),
      `Recommendation ${recommendation.recommendationId} references unknown signal ${signalId}.`,
    );
  }
  for (const findingId of recommendation.sourceFindingIds) {
    assert(
      validFindingIds.has(findingId),
      `Recommendation ${recommendation.recommendationId} references unknown finding ${findingId}.`,
    );
  }

  const textFields = [
    recommendation.title,
    recommendation.summary,
    recommendation.whyThisMatters,
    ...recommendation.implementationSteps,
    ...recommendation.caveats,
  ];
  for (const text of textFields) {
    validateBannedLanguageInText(
      `recommendation ${recommendation.recommendationId}`,
      text,
    );
  }
}

export function validateRecommendationResult(
  result: AssessmentRecommendationResult,
  validSignalIds: string[],
): void {
  const signalIdSet = new Set(validSignalIds);
  const findingIds = result.findings.map((f) => f.findingId);
  assert(
    new Set(findingIds).size === findingIds.length,
    "Duplicate finding IDs present.",
  );

  const recommendationIds = result.recommendations.map(
    (r) => r.recommendationId,
  );
  assert(
    new Set(recommendationIds).size === recommendationIds.length,
    "Duplicate recommendation IDs present.",
  );

  assert(
    result.recommendations.length >= 1 &&
      result.recommendations.length <= MAX_RECOMMENDATIONS,
    `Recommendation count must be between 1 and ${MAX_RECOMMENDATIONS}.`,
  );

  for (const finding of result.findings) {
    for (const signalId of finding.sourceSignalIds) {
      assert(
        signalIdSet.has(signalId),
        `Finding ${finding.findingId} references unknown signal ${signalId}.`,
      );
    }
    validateFinding(finding);
  }

  const findingIdSet = new Set(findingIds);
  for (const recommendation of result.recommendations) {
    validateRecommendation(recommendation, findingIdSet, signalIdSet);
  }
}

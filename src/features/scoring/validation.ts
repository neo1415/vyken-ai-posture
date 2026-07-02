import { CATEGORY_LABELS, CATEGORY_WEIGHTS, clampScore } from "./constants";
import type {
  AssessmentScoringInput,
  AssessmentScoringResult,
  RiskSignal,
  ScoringCategoryId,
} from "./types";

export class AssessmentScoringValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssessmentScoringValidationError";
  }
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new AssessmentScoringValidationError(message);
  }
}

export function validateWeightsSumToOne(epsilon = 0.0001): void {
  const sum = Object.values(CATEGORY_WEIGHTS).reduce((acc, w) => acc + w, 0);
  assert(
    Math.abs(sum - 1) <= epsilon,
    `CATEGORY_WEIGHTS must sum to 1 (got ${sum}).`,
  );
}

export function validateScoringInput(input: AssessmentScoringInput): void {
  assert(Boolean(input.companyProfile), "Company profile missing.");
  assert(
    typeof input.companyProfile.industry === "string" &&
      input.companyProfile.industry.length > 0,
    "Company profile industry missing.",
  );
  assert(
    typeof input.companyProfile.companySize === "string" &&
      input.companyProfile.companySize.length > 0,
    "Company profile size missing.",
  );

  assert(
    input.selectedTools.length > 0 ||
      input.unknownTools.length > 0 ||
      input.hasNotSureToolSelection,
    "Tool selection missing.",
  );
  assert(input.answers.length > 0, "Assessment answers missing.");
}

export function dedupeSignalsById(signals: RiskSignal[]): RiskSignal[] {
  const byId = new Map<string, RiskSignal>();

  for (const signal of signals) {
    const existing = byId.get(signal.signalId);
    if (!existing) {
      byId.set(signal.signalId, signal);
      continue;
    }

    byId.set(signal.signalId, {
      ...existing,
      severity: maxSeverity(existing.severity, signal.severity),
      scoreImpact: Math.max(existing.scoreImpact, signal.scoreImpact),
      confidence: minConfidence(existing.confidence, signal.confidence),
      evidence: unique([...existing.evidence, ...signal.evidence]),
      sourceAnswerIds: unique([
        ...existing.sourceAnswerIds,
        ...signal.sourceAnswerIds,
      ]),
    });
  }

  return [...byId.values()];
}

function unique(items: string[]): string[] {
  return [...new Set(items)];
}

function severityRank(sev: RiskSignal["severity"]): number {
  if (sev === "critical") return 4;
  if (sev === "high") return 3;
  if (sev === "medium") return 2;
  return 1;
}

function maxSeverity(
  a: RiskSignal["severity"],
  b: RiskSignal["severity"],
): RiskSignal["severity"] {
  return severityRank(a) >= severityRank(b) ? a : b;
}

function confidenceRank(conf: RiskSignal["confidence"]): number {
  if (conf === "high") return 3;
  if (conf === "medium") return 2;
  return 1;
}

function minConfidence(
  a: RiskSignal["confidence"],
  b: RiskSignal["confidence"],
): RiskSignal["confidence"] {
  return confidenceRank(a) <= confidenceRank(b) ? a : b;
}

export function validateScoringOutput(result: AssessmentScoringResult): void {
  validateWeightsSumToOne();

  assert(
    Number.isFinite(result.overallScore) &&
      clampScore(result.overallScore) === result.overallScore,
    "Overall score must be a clamped 0–100 number.",
  );

  const expectedCategories = new Set<ScoringCategoryId>(
    Object.keys(CATEGORY_LABELS) as ScoringCategoryId[],
  );
  assert(
    result.categoryScores.length === expectedCategories.size,
    "Category scores missing required categories.",
  );
  for (const categoryScore of result.categoryScores) {
    assert(
      expectedCategories.has(categoryScore.categoryId),
      `Unknown categoryId: ${categoryScore.categoryId}`,
    );
    assert(
      Number.isFinite(categoryScore.score) &&
        clampScore(categoryScore.score) === categoryScore.score,
      `Category score out of range for ${categoryScore.categoryId}`,
    );
  }

  const signalIds = result.signals.map((s) => s.signalId);
  assert(
    new Set(signalIds).size === signalIds.length,
    "Duplicate signal IDs present.",
  );
}

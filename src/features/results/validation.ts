import { containsBannedTerm } from "@/features/recommendations/validation";
import { CATEGORY_LABELS } from "@/features/scoring/constants";

import { MAX_FINDINGS_DISPLAY } from "./constants";
import type { AssessmentResultViewModel } from "./types";

export class AssessmentResultValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssessmentResultValidationError";
  }
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new AssessmentResultValidationError(message);
  }
}

const UUID_PATTERN =
  /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;

function collectDisplayStrings(vm: AssessmentResultViewModel): string[] {
  return [
    vm.summary.headline,
    vm.summary.explanation,
    ...vm.summary.caveats,
    ...vm.categoryScores.map((c) => c.explanation),
    ...vm.findings.flatMap((f) => [f.title, f.summary]),
    ...vm.recommendations.flatMap((r) => [
      r.title,
      r.summary,
      r.whyThisMatters,
      ...r.implementationSteps,
      ...r.caveats,
    ]),
  ];
}

export function validateAssessmentResultViewModel(
  vm: AssessmentResultViewModel,
): void {
  assert(vm.publicToken.trim().length > 0, "publicToken is required.");
  assert(
    Number.isFinite(vm.summary.overallScore) &&
      vm.summary.overallScore >= 0 &&
      vm.summary.overallScore <= 100,
    "overallScore must be 0–100.",
  );

  const riskLevels = new Set(["low", "moderate", "high", "critical"]);
  assert(
    riskLevels.has(vm.summary.overallRiskLevel),
    "Invalid overallRiskLevel.",
  );

  const confidenceLevels = new Set(["low", "medium", "high"]);
  assert(
    confidenceLevels.has(vm.summary.confidenceLevel),
    "Invalid confidenceLevel.",
  );

  const expectedCategories = Object.keys(CATEGORY_LABELS);
  assert(
    vm.categoryScores.length === expectedCategories.length,
    "Category scores must include all categories.",
  );

  assert(vm.findings.length >= 1, "At least one finding is required.");
  assert(
    vm.findings.length <= MAX_FINDINGS_DISPLAY,
    `Findings display exceeds ${MAX_FINDINGS_DISPLAY}.`,
  );

  assert(
    vm.recommendations.length >= 1 && vm.recommendations.length <= 8,
    "Recommendations count must be 1–8.",
  );

  for (const text of collectDisplayStrings(vm)) {
    const banned = containsBannedTerm(text);
    assert(
      banned === null,
      `Banned term "${banned}" found in result display text.`,
    );
  }

  for (const field of [vm.publicToken, ...collectDisplayStrings(vm)]) {
    assert(
      !UUID_PATTERN.test(field),
      "Raw UUID must not appear in view model.",
    );
  }
}

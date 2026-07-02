import { riskLevelFromScore } from "@/features/scoring/constants";
import type {
  AssessmentScoringResult,
  RiskLevel,
} from "@/features/scoring/types";

import {
  CATEGORY_WEIGHT_FOR_SORT,
  MAX_RECOMMENDATIONS,
  PRIORITY_ORDER,
  RECOMMENDATION_MODEL_VERSION,
} from "./constants";
import {
  getLowConfidenceCaveat,
  RECOMMENDATION_LIBRARY,
} from "./recommendation-library";
import type {
  AssessmentFinding,
  AssessmentRecommendation,
  RecommendationEngineInput,
  RecommendationPriority,
  RecommendationTemplate,
} from "./types";

const RISK_LEVEL_RANK: Record<RiskLevel, number> = {
  low: 1,
  moderate: 2,
  high: 3,
  critical: 4,
};

function hasMatchingSignal(
  template: RecommendationTemplate,
  signalIds: Set<string>,
): boolean {
  return template.triggerSignalIds.some((id) => signalIds.has(id));
}

function categoryMeetsMinRisk(
  scoringResult: AssessmentScoringResult,
  template: RecommendationTemplate,
): boolean {
  if (!template.triggerCategoryIds?.length || !template.minCategoryRiskLevel) {
    return false;
  }

  const minRank = RISK_LEVEL_RANK[template.minCategoryRiskLevel];
  return template.triggerCategoryIds.some((categoryId) => {
    const category = scoringResult.categoryScores.find(
      (c) => c.categoryId === categoryId,
    );
    if (!category) return false;
    return RISK_LEVEL_RANK[category.riskLevel] >= minRank;
  });
}

function isTemplateTriggered(
  template: RecommendationTemplate,
  input: RecommendationEngineInput,
  signalIds: Set<string>,
): boolean {
  if (hasMatchingSignal(template, signalIds)) return true;
  return categoryMeetsMinRisk(input.scoringResult, template);
}

function resolvePriority(
  template: RecommendationTemplate,
  input: RecommendationEngineInput,
  matchedSignalIds: string[],
): RecommendationPriority {
  let priority = template.defaultPriority;
  const signalSet = new Set(matchedSignalIds);

  const categoryHighOrCritical = input.scoringResult.categoryScores.some(
    (c) =>
      template.relatedRiskCategories.includes(c.categoryId) &&
      (c.riskLevel === "high" || c.riskLevel === "critical"),
  );

  if (
    template.urgentSignalIds?.some((id) => signalSet.has(id)) ||
    (categoryHighOrCritical &&
      template.defaultPriority === "high" &&
      input.scoringResult.overallRiskLevel === "critical")
  ) {
    priority = "urgent";
  } else if (
    template.priorityBoostSignalIds?.some((id) => signalSet.has(id)) ||
    categoryHighOrCritical
  ) {
    if (priority === "low") priority = "medium";
    if (priority === "medium") priority = "high";
  }

  if (
    input.scoringResult.overallRiskLevel === "critical" &&
    priority === "medium" &&
    template.categoryId === "data_protection"
  ) {
    priority = "high";
  }

  return priority;
}

function matchedSignalsForTemplate(
  template: RecommendationTemplate,
  signalIds: Set<string>,
  allSignals: AssessmentScoringResult["signals"],
): string[] {
  const matched = template.triggerSignalIds.filter((id) => signalIds.has(id));
  if (matched.length > 0) return matched;

  return allSignals
    .filter((s) => template.relatedRiskCategories.includes(s.categoryId))
    .map((s) => s.signalId)
    .slice(0, 3);
}

function matchedFindingsForTemplate(
  template: RecommendationTemplate,
  findings: AssessmentFinding[],
  matchedSignalIds: string[],
): string[] {
  const signalSet = new Set(matchedSignalIds);
  return findings
    .filter(
      (f) =>
        f.sourceSignalIds.some((id) => signalSet.has(id)) ||
        template.relatedRiskCategories.includes(f.categoryId),
    )
    .map((f) => f.findingId);
}

function buildRecommendation(
  template: RecommendationTemplate,
  input: RecommendationEngineInput,
  signalIds: Set<string>,
): AssessmentRecommendation | null {
  if (!isTemplateTriggered(template, input, signalIds)) {
    return null;
  }

  const matchedSignalIds = matchedSignalsForTemplate(
    template,
    signalIds,
    input.scoringResult.signals,
  );
  const matchedFindingIds = matchedFindingsForTemplate(
    template,
    input.findings,
    matchedSignalIds,
  );

  const priority = resolvePriority(template, input, matchedSignalIds);
  const caveats = [...template.defaultCaveats];

  if (input.scoringResult.confidenceLevel === "low") {
    const caveat = getLowConfidenceCaveat();
    if (!caveats.includes(caveat)) {
      caveats.push(caveat);
    }
  }

  return {
    recommendationId: template.recommendationId,
    title: template.title,
    summary: template.summary,
    priority,
    effort: template.defaultEffort,
    categoryId: template.categoryId,
    sourceFindingIds: [...new Set(matchedFindingIds)],
    sourceSignalIds: [...new Set(matchedSignalIds)],
    relatedRiskCategories: template.relatedRiskCategories,
    implementationSteps: template.implementationSteps,
    whyThisMatters: template.whyThisMatters,
    vykenGuardRelevance: template.vykenGuardRelevance,
    caveats,
  };
}

function sortRecommendations(
  recommendations: AssessmentRecommendation[],
): AssessmentRecommendation[] {
  return [...recommendations].sort((a, b) => {
    const priorityDiff =
      PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (priorityDiff !== 0) return priorityDiff;

    const aWeight = Math.max(
      ...a.relatedRiskCategories.map((c) => CATEGORY_WEIGHT_FOR_SORT[c]),
    );
    const bWeight = Math.max(
      ...b.relatedRiskCategories.map((c) => CATEGORY_WEIGHT_FOR_SORT[c]),
    );
    return bWeight - aWeight;
  });
}

function isLowRiskSession(scoringResult: AssessmentScoringResult): boolean {
  return (
    scoringResult.overallRiskLevel === "low" &&
    scoringResult.signals.length <= 3 &&
    scoringResult.categoryScores.every((c) => c.riskLevel === "low")
  );
}

export function generateRecommendations(
  input: RecommendationEngineInput,
): AssessmentRecommendation[] {
  const signalIds = new Set(input.scoringResult.signals.map((s) => s.signalId));
  const candidates: AssessmentRecommendation[] = [];

  for (const template of Object.values(RECOMMENDATION_LIBRARY)) {
    if (
      template.recommendationId ===
      "periodically_review_ai_usage_and_governance"
    ) {
      continue;
    }
    const rec = buildRecommendation(template, input, signalIds);
    if (rec) candidates.push(rec);
  }

  let recommendations = sortRecommendations(candidates);

  if (recommendations.length === 0 && isLowRiskSession(input.scoringResult)) {
    const fallback = buildRecommendation(
      RECOMMENDATION_LIBRARY.periodically_review_ai_usage_and_governance,
      input,
      signalIds,
    );
    if (fallback) recommendations = [fallback];
  }

  const deduped = dedupeRecommendations(recommendations);
  return deduped.slice(0, MAX_RECOMMENDATIONS);
}

function dedupeRecommendations(
  recommendations: AssessmentRecommendation[],
): AssessmentRecommendation[] {
  const byId = new Map<string, AssessmentRecommendation>();
  for (const rec of recommendations) {
    const existing = byId.get(rec.recommendationId);
    if (!existing) {
      byId.set(rec.recommendationId, rec);
      continue;
    }
    byId.set(rec.recommendationId, {
      ...existing,
      priority:
        PRIORITY_ORDER[rec.priority] < PRIORITY_ORDER[existing.priority]
          ? rec.priority
          : existing.priority,
      sourceFindingIds: [
        ...new Set([...existing.sourceFindingIds, ...rec.sourceFindingIds]),
      ],
      sourceSignalIds: [
        ...new Set([...existing.sourceSignalIds, ...rec.sourceSignalIds]),
      ],
      caveats: [...new Set([...existing.caveats, ...rec.caveats])],
    });
  }
  return sortRecommendations([...byId.values()]);
}

export function buildRecommendationResult(
  scoringResult: AssessmentScoringResult,
  findings: AssessmentFinding[],
  recommendations: AssessmentRecommendation[],
) {
  return {
    findings,
    recommendations,
    recommendationModelVersion: RECOMMENDATION_MODEL_VERSION,
    generatedAt: new Date().toISOString(),
    scoringConfidenceLevel: scoringResult.confidenceLevel,
  };
}

export function categoryRiskLevelFromScore(score: number): RiskLevel {
  return riskLevelFromScore(score);
}

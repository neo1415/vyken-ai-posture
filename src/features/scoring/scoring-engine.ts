import {
  CATEGORY_LABELS,
  CATEGORY_WEIGHTS,
  clampScore,
  riskLevelFromScore,
  roundScore,
} from "./constants";
import { computeScoringConfidence } from "./confidence-engine";
import { generateRiskSignals } from "./signal-engine";
import type {
  AssessmentScoringInput,
  AssessmentScoringResult,
  CategoryScore,
  RiskLevel,
  RiskSignal,
  ScoringCategoryId,
} from "./types";
import {
  dedupeSignalsById,
  validateScoringInput,
  validateScoringOutput,
  validateWeightsSumToOne,
} from "./validation";
import { SCORING_MODEL_VERSION } from "./constants";

function categoryScoreFromSignals(input: {
  categoryId: ScoringCategoryId;
  signals: RiskSignal[];
}): CategoryScore {
  const impacts = input.signals.map((s) => s.scoreImpact);
  const raw = impacts.reduce((acc, v) => acc + v, 0);

  const score = roundScore(raw);
  return {
    categoryId: input.categoryId,
    label: CATEGORY_LABELS[input.categoryId],
    score,
    riskLevel: riskLevelFromScore(score),
    contributingSignals: input.signals.map((s) => s.signalId),
    explanation:
      input.signals.length === 0
        ? "No major risk indicators were triggered for this category based on provided inputs."
        : "This category score is based on triggered risk signals derived from provided answers and tool/profile context.",
  };
}

function weightedOverallScore(categoryScores: CategoryScore[]): number {
  validateWeightsSumToOne();
  const scoreByCategory = new Map<ScoringCategoryId, number>(
    categoryScores.map((c) => [c.categoryId, c.score]),
  );
  const weighted = (
    Object.keys(CATEGORY_WEIGHTS) as ScoringCategoryId[]
  ).reduce(
    (acc, categoryId) =>
      acc +
      (scoreByCategory.get(categoryId) ?? 0) * CATEGORY_WEIGHTS[categoryId],
    0,
  );
  return roundScore(weighted);
}

function maxRiskLevel(levels: RiskLevel[]): RiskLevel {
  const rank = (l: RiskLevel) => {
    if (l === "critical") return 4;
    if (l === "high") return 3;
    if (l === "moderate") return 2;
    return 1;
  };
  return levels.reduce(
    (max, cur) => (rank(cur) > rank(max) ? cur : max),
    "low",
  );
}

function hasSignal(signals: RiskSignal[], signalId: string): boolean {
  return signals.some((s) => s.signalId === signalId);
}

function anySignalFromSet(signals: RiskSignal[], ids: string[]): boolean {
  return ids.some((id) => hasSignal(signals, id));
}

function computeEscalationFloor(input: {
  scoringInput: AssessmentScoringInput;
  signals: RiskSignal[];
  baseOverallLevel: RiskLevel;
}): RiskLevel {
  const { scoringInput, signals } = input;

  const hasSensitive =
    anySignalFromSet(signals, [
      "sensitive_data_entering_ai",
      "customer_personal_data_exposure",
      "financial_records_exposure",
      "claims_documents_exposure",
      "kyc_identity_data_exposure",
      "health_data_exposure",
      "secrets_tokens_exposure",
    ]) || false;

  const hasPersonalAccounts = hasSignal(signals, "personal_account_usage");
  const hasNoLogs =
    hasSignal(signals, "limited_usage_logs") ||
    hasSignal(signals, "shadow_ai_visibility_gap");
  const hasNoPolicy =
    hasSignal(signals, "no_ai_policy") ||
    hasSignal(signals, "draft_ai_policy_only");
  const hasAgenticHigh =
    anySignalFromSet(signals, [
      "ai_can_modify_files_or_run_commands",
      "secrets_or_production_data_possible",
      "internal_system_connection",
      "mcp_or_connected_tools_used",
    ]) || false;

  const industry = scoringInput.companyProfile.industry;
  const regulatedIndustry = [
    "insurance",
    "fintech",
    "banking",
    "healthcare",
    "legal",
  ].some((k) => industry.includes(k));

  // Non-averaging escalation rules (conservative, deterministic)
  if (hasSensitive && hasPersonalAccounts && hasNoLogs) {
    return regulatedIndustry ? "critical" : "high";
  }

  if (hasAgenticHigh && hasSensitive) {
    return "critical";
  }

  if (regulatedIndustry && (hasSensitive || hasNoPolicy)) {
    // floor at least high when regulated + weak controls
    return maxRiskLevel([input.baseOverallLevel, "high"]);
  }

  if (hasSensitive && hasNoPolicy) {
    return maxRiskLevel([input.baseOverallLevel, "high"]);
  }

  return input.baseOverallLevel;
}

function buildScoringSummary(input: {
  overallRiskLevel: RiskLevel;
  confidenceLevel: "low" | "medium" | "high";
  signals: RiskSignal[];
}): AssessmentScoringResult["scoringSummary"] {
  const strongest = [...input.signals]
    .sort((a, b) => b.scoreImpact - a.scoreImpact)
    .slice(0, 4)
    .map((s) => s.signalId);

  const caveats: string[] = [
    "This is a framework-informed risk posture estimate based on provided answers and curated tool profile information.",
    "It is not a legal opinion, compliance certification, audit, or live technical scan.",
  ];
  if (input.confidenceLevel !== "high") {
    caveats.push(
      "Confidence is reduced due to uncertainty in tool selection, tool profile confidence, or 'not sure' answers.",
    );
  }

  const headline =
    input.overallRiskLevel === "low"
      ? "Your responses suggest lower overall AI governance risk, with some areas still worth validating internally."
      : input.overallRiskLevel === "moderate"
        ? "Your responses suggest moderate AI governance risk, with several controls that may require review."
        : input.overallRiskLevel === "high"
          ? "Your responses suggest high AI governance risk driven by multiple risk indicators that warrant review."
          : "Your responses suggest critical AI governance risk indicators that warrant urgent internal validation and control review.";

  return {
    headline,
    explanation:
      "Scores are generated deterministically from signals derived server-side from your company context, selected tools, and structured answers.",
    caveats,
    strongestFactors: strongest,
  };
}

export function scoreAssessment(
  scoringInput: AssessmentScoringInput,
): AssessmentScoringResult {
  validateScoringInput(scoringInput);

  const rawSignals = generateRiskSignals(scoringInput);
  const signals = dedupeSignalsById(rawSignals);

  // Category scores
  const categoryIds = Object.keys(CATEGORY_LABELS) as ScoringCategoryId[];
  const categoryScores = categoryIds.map((categoryId) =>
    categoryScoreFromSignals({
      categoryId,
      signals: signals.filter((s) => s.categoryId === categoryId),
    }),
  );

  const baseOverallScore = weightedOverallScore(categoryScores);
  const baseOverallLevel = riskLevelFromScore(baseOverallScore);

  const escalationFloor = computeEscalationFloor({
    scoringInput,
    signals,
    baseOverallLevel,
  });
  const overallRiskLevel = maxRiskLevel([baseOverallLevel, escalationFloor]);

  // Ensure numeric score is consistent with overallRiskLevel floor.
  const overallScore = roundScore(
    Math.max(
      baseOverallScore,
      overallRiskLevel === "critical"
        ? 75
        : overallRiskLevel === "high"
          ? 50
          : overallRiskLevel === "moderate"
            ? 25
            : 0,
    ),
  );

  // Confidence
  const confidenceLevel = computeScoringConfidence({
    scoringInput,
    signals,
  });

  // If confidence is low and tool uncertainty is high, keep risk conservative but avoid overprecision.
  const adjustedOverallScore =
    confidenceLevel === "low"
      ? clampScore(Math.max(overallScore, 35))
      : overallScore;

  const result: AssessmentScoringResult = {
    overallScore: roundScore(adjustedOverallScore),
    overallRiskLevel: riskLevelFromScore(adjustedOverallScore),
    confidenceLevel,
    categoryScores,
    signals,
    scoringSummary: buildScoringSummary({
      overallRiskLevel,
      confidenceLevel,
      signals,
    }),
    scoringModelVersion: SCORING_MODEL_VERSION,
  };

  validateScoringOutput(result);
  return result;
}

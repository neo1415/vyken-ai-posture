import "server-only";

import { RECOMMENDATION_MODEL_VERSION } from "@/features/recommendations/constants";
import { generateFindings } from "@/features/recommendations/finding-engine";
import {
  buildRecommendationResult,
  generateRecommendations,
} from "@/features/recommendations/recommendation-engine";
import type { AssessmentRecommendationResult } from "@/features/recommendations/types";
import { validateRecommendationResult } from "@/features/recommendations/validation";
import {
  getRecommendationInputByPublicToken,
  getRecommendationCountsByPublicToken,
  getFindingsByPublicToken,
  getRecommendationsByPublicToken,
  parseScoringResultFromBreakdown,
  replaceFindingsAndRecommendationsForSession,
} from "@/server/repositories/assessment-recommendations.repository";
import { getScoringInputByPublicToken } from "@/server/repositories/assessment-scoring.repository";
import { scoreAssessmentSession } from "@/server/services/assessment-scoring.service";

export class AssessmentRecommendationError extends Error {
  constructor(
    message: string,
    readonly code:
      | "session_not_found"
      | "missing_profile"
      | "missing_tools"
      | "missing_answers"
      | "missing_score"
      | "missing_signals" = "session_not_found",
  ) {
    super(message);
    this.name = "AssessmentRecommendationError";
  }
}

async function ensureScoringResult(publicToken: string) {
  const inputRow = await getRecommendationInputByPublicToken(publicToken);
  if (!inputRow) {
    throw new AssessmentRecommendationError(
      "Assessment session not found.",
      "session_not_found",
    );
  }

  const scoringPrereq = await getScoringInputByPublicToken(publicToken);
  if (!scoringPrereq) {
    throw new AssessmentRecommendationError(
      "Assessment session not found.",
      "session_not_found",
    );
  }
  if (!scoringPrereq.companyProfile) {
    throw new AssessmentRecommendationError(
      "Company profile not found for this session.",
      "missing_profile",
    );
  }
  if (scoringPrereq.selectedTools.length === 0) {
    throw new AssessmentRecommendationError(
      "Tool selections not found for this session.",
      "missing_tools",
    );
  }
  if (scoringPrereq.answers.length === 0) {
    throw new AssessmentRecommendationError(
      "Assessment answers not found.",
      "missing_answers",
    );
  }

  let scoringResult = inputRow.score
    ? parseScoringResultFromBreakdown(inputRow.score.scoreBreakdown)
    : null;

  if (!scoringResult) {
    scoringResult = await scoreAssessmentSession(publicToken);
  }

  if (!scoringResult || scoringResult.signals.length === 0) {
    throw new AssessmentRecommendationError(
      "Risk signals not found for this session.",
      "missing_signals",
    );
  }

  return {
    assessmentSessionId: inputRow.session.id,
    scoringResult,
  };
}

export async function generateRecommendationsForAssessment(
  publicToken: string,
): Promise<AssessmentRecommendationResult> {
  const { assessmentSessionId, scoringResult } =
    await ensureScoringResult(publicToken);

  const findings = generateFindings(scoringResult);
  const recommendations = generateRecommendations({
    scoringResult,
    findings,
  });

  const result = buildRecommendationResult(
    scoringResult,
    findings,
    recommendations,
  );

  validateRecommendationResult(
    result,
    scoringResult.signals.map((s) => s.signalId),
  );

  await replaceFindingsAndRecommendationsForSession({
    assessmentSessionId,
    findings: result.findings,
    recommendations: result.recommendations,
    modelVersion: RECOMMENDATION_MODEL_VERSION,
  });

  return result;
}

export async function getAssessmentRecommendationPreview(
  publicToken: string,
): Promise<AssessmentRecommendationResult | null> {
  const inputRow = await getRecommendationInputByPublicToken(publicToken);
  if (!inputRow) return null;

  const existingFindings = await getFindingsByPublicToken(publicToken);
  const existingRecommendations =
    await getRecommendationsByPublicToken(publicToken);

  if (existingFindings.length > 0 && existingRecommendations.length > 0) {
    const scoringResult = inputRow.score
      ? parseScoringResultFromBreakdown(inputRow.score.scoreBreakdown)
      : null;
    if (!scoringResult) return null;

    return {
      findings: existingFindings,
      recommendations: existingRecommendations,
      recommendationModelVersion: RECOMMENDATION_MODEL_VERSION,
      generatedAt:
        inputRow.score?.calculatedAt.toISOString() ?? new Date().toISOString(),
      scoringConfidenceLevel: scoringResult.confidenceLevel,
    };
  }

  try {
    return await generateRecommendationsForAssessment(publicToken);
  } catch (error) {
    if (error instanceof AssessmentRecommendationError) {
      return null;
    }
    throw error;
  }
}

export async function getPersistedRecommendationCounts(publicToken: string) {
  return getRecommendationCountsByPublicToken(publicToken);
}

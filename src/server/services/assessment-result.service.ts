import "server-only";

import type { AssessmentRecommendationResult } from "@/features/recommendations/types";
import { MAX_FINDINGS_DISPLAY } from "@/features/results/constants";
import {
  findingSeverityRank,
  formatCompanySize,
  formatCountryRegion,
  formatIndustry,
  formatSensitiveData,
} from "@/features/results/formatters";
import type { AssessmentResultViewModel } from "@/features/results/types";
import { validateAssessmentResultViewModel } from "@/features/results/validation";
import type { AssessmentScoringResult } from "@/features/scoring/types";
import { isValidPublicTokenFormat } from "@/lib/security/public-token";
import { getScoringInputByPublicToken } from "@/server/repositories/assessment-scoring.repository";
import {
  generateRecommendationsForAssessment,
  getAssessmentRecommendationPreview,
} from "@/server/services/assessment-recommendations.service";
import {
  getAssessmentScoringPreview,
  scoreAssessmentSession,
} from "@/server/services/assessment-scoring.service";

function mapToViewModel(input: {
  publicToken: string;
  scoringResult: AssessmentScoringResult;
  recommendationResult: AssessmentRecommendationResult;
  companyProfile: NonNullable<
    Awaited<ReturnType<typeof getScoringInputByPublicToken>>
  >["companyProfile"];
}): AssessmentResultViewModel {
  const sortedFindings = [...input.recommendationResult.findings].sort(
    (a, b) => findingSeverityRank(b.severity) - findingSeverityRank(a.severity),
  );

  return {
    publicToken: input.publicToken,
    companyContext: {
      companyName: input.companyProfile.companyName ?? null,
      industry: formatIndustry(input.companyProfile.industry),
      companySize: formatCompanySize(input.companyProfile.companySize),
      countryRegion: formatCountryRegion(input.companyProfile.countryRegion),
      handlesSensitiveOrRegulatedData: formatSensitiveData(
        input.companyProfile.handlesSensitiveOrRegulatedData,
      ),
    },
    summary: {
      overallScore: input.scoringResult.overallScore,
      overallRiskLevel: input.scoringResult.overallRiskLevel,
      confidenceLevel: input.scoringResult.confidenceLevel,
      headline: input.scoringResult.scoringSummary.headline,
      explanation: input.scoringResult.scoringSummary.explanation,
      caveats: input.scoringResult.scoringSummary.caveats,
      signalCount: input.scoringResult.signals.length,
      findingCount: input.recommendationResult.findings.length,
      recommendationCount: input.recommendationResult.recommendations.length,
    },
    categoryScores: input.scoringResult.categoryScores.map((category) => ({
      categoryId: category.categoryId,
      label: category.label,
      score: category.score,
      riskLevel: category.riskLevel,
      explanation: category.explanation,
    })),
    findings: sortedFindings.slice(0, MAX_FINDINGS_DISPLAY).map((finding) => ({
      findingId: finding.findingId,
      categoryId: finding.categoryId,
      severity: finding.severity,
      title: finding.title,
      summary: finding.summary,
      confidence: finding.confidence,
    })),
    recommendations: input.recommendationResult.recommendations.map(
      (recommendation) => ({
        recommendationId: recommendation.recommendationId,
        title: recommendation.title,
        summary: recommendation.summary,
        priority: recommendation.priority,
        effort: recommendation.effort,
        categoryId: recommendation.categoryId,
        implementationSteps: recommendation.implementationSteps,
        whyThisMatters: recommendation.whyThisMatters,
        caveats: recommendation.caveats,
      }),
    ),
  };
}

export async function getAssessmentResult(
  publicToken: string,
): Promise<AssessmentResultViewModel | null> {
  const token = publicToken.trim();
  if (!isValidPublicTokenFormat(token)) {
    return null;
  }

  const inputRow = await getScoringInputByPublicToken(token);
  if (!inputRow?.companyProfile) {
    return null;
  }
  if (inputRow.selectedTools.length === 0) {
    return null;
  }
  if (inputRow.answers.length === 0) {
    return null;
  }

  let scoringResult = await getAssessmentScoringPreview(token);
  if (!scoringResult) {
    scoringResult = await scoreAssessmentSession(token);
  }
  if (!scoringResult || scoringResult.signals.length === 0) {
    return null;
  }

  let recommendationResult = await getAssessmentRecommendationPreview(token);
  if (!recommendationResult) {
    recommendationResult = await generateRecommendationsForAssessment(token);
  }
  if (
    recommendationResult.findings.length === 0 ||
    recommendationResult.recommendations.length === 0
  ) {
    return null;
  }

  const viewModel = mapToViewModel({
    publicToken: token,
    scoringResult,
    recommendationResult,
    companyProfile: inputRow.companyProfile,
  });

  validateAssessmentResultViewModel(viewModel);
  return viewModel;
}

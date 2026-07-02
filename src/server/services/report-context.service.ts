import "server-only";

import { buildReportContext } from "@/features/report-context/report-context-builder";
import { getReportSections } from "@/features/report-context/sections";
import type {
  ReportContext,
  ReportContextResult,
} from "@/features/report-context/types";
import { validateReportContext } from "@/features/report-context/validation";
import { findingSeverityRank } from "@/features/results/formatters";
import { isValidPublicTokenFormat } from "@/lib/security/public-token";
import { getScoringInputByPublicToken } from "@/server/repositories/assessment-scoring.repository";
import { getLatestLeadForAssessment } from "@/server/repositories/leads.repository";
import {
  getReportContextByPublicToken,
  upsertReportContextForAssessment,
} from "@/server/repositories/reports.repository";
import {
  generateRecommendationsForAssessment,
  getAssessmentRecommendationPreview,
} from "@/server/services/assessment-recommendations.service";
import {
  getAssessmentScoringPreview,
  scoreAssessmentSession,
} from "@/server/services/assessment-scoring.service";

export class ReportContextError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReportContextError";
  }
}

function formatProfileConfidence(value: string | null | undefined): string {
  if (!value) return "Unknown";
  return value.replace(/_/g, " ");
}

function mapToolsFromInputRow(
  inputRow: NonNullable<
    Awaited<ReturnType<typeof getScoringInputByPublicToken>>
  >,
) {
  const knownTools = inputRow.selectedTools
    .filter(
      (selection) =>
        selection.selectionType === "known_tool" &&
        selection.tool != null &&
        selection.category != null &&
        selection.profile != null,
    )
    .map((selection) => ({
      name: selection.tool!.name,
      slug: selection.tool!.slug,
      category: selection.category!.name,
      profileConfidence: formatProfileConfidence(
        selection.profile!.publicInfoConfidenceLevel,
      ),
    }));

  const unknownFromSelections = inputRow.selectedTools
    .filter((selection) => selection.selectionType === "unknown_tool")
    .map((selection) => ({
      name: selection.unknownToolName ?? "Unknown tool",
      url: selection.unknownToolUrl ?? null,
    }));

  const unknownFromRequests = inputRow.unknownToolRequests.map((request) => ({
    name: request.toolName,
    url: request.toolUrl ?? null,
  }));

  const unknownTools = [...unknownFromSelections, ...unknownFromRequests];

  return {
    knownTools,
    unknownTools,
    hasNotSureSelection: inputRow.selectedTools.some(
      (selection) => selection.selectionType === "not_sure",
    ),
  };
}

function mapLeadContext(
  lead: Awaited<ReturnType<typeof getLatestLeadForAssessment>>,
): ReportContext["lead"] {
  if (!lead) {
    return {
      hasLead: false,
      email: null,
      name: null,
      companyName: null,
      role: null,
      followUpInterest: null,
      consentToFollowUp: null,
    };
  }

  return {
    hasLead: true,
    email: lead.email,
    name: lead.name,
    companyName: lead.companyName,
    role: lead.role,
    followUpInterest: lead.mainAiConcern,
    consentToFollowUp: lead.consentToFollowUp,
  };
}

export async function getReportContextPreview(
  publicToken: string,
): Promise<ReportContext | null> {
  const token = publicToken.trim();
  if (!isValidPublicTokenFormat(token)) {
    return null;
  }

  return getReportContextByPublicToken(token);
}

export async function buildReportContextForAssessment(
  publicToken: string,
): Promise<ReportContextResult> {
  const token = publicToken.trim();
  if (!isValidPublicTokenFormat(token)) {
    throw new ReportContextError(
      "This assessment session could not be verified.",
    );
  }

  const inputRow = await getScoringInputByPublicToken(token);
  if (!inputRow?.companyProfile) {
    throw new ReportContextError(
      "Company profile is required for report context.",
    );
  }
  if (inputRow.selectedTools.length === 0) {
    throw new ReportContextError(
      "Tool selections are required for report context.",
    );
  }
  if (inputRow.answers.length === 0) {
    throw new ReportContextError(
      "Assessment answers are required for report context.",
    );
  }

  let scoringResult = await getAssessmentScoringPreview(token);
  if (!scoringResult) {
    scoringResult = await scoreAssessmentSession(token);
  }
  if (!scoringResult || scoringResult.signals.length === 0) {
    throw new ReportContextError(
      "Assessment scoring is required for report context.",
    );
  }

  let recommendationResult = await getAssessmentRecommendationPreview(token);
  if (!recommendationResult) {
    recommendationResult = await generateRecommendationsForAssessment(token);
  }
  if (
    recommendationResult.findings.length === 0 ||
    recommendationResult.recommendations.length === 0
  ) {
    throw new ReportContextError(
      "Findings and recommendations are required for report context.",
    );
  }

  const lead = await getLatestLeadForAssessment(inputRow.session.id);
  const sortedFindings = [...recommendationResult.findings].sort(
    (a, b) => findingSeverityRank(b.severity) - findingSeverityRank(a.severity),
  );

  const context = buildReportContext({
    generatedAt: new Date().toISOString(),
    publicToken: token,
    sessionStatus: inputRow.session.status,
    completedAt: inputRow.session.completedAt?.toISOString() ?? null,
    companyProfile: {
      companyName: inputRow.companyProfile.companyName,
      industry: inputRow.companyProfile.industry,
      companySize: inputRow.companyProfile.companySize,
      countryRegion: inputRow.companyProfile.countryRegion,
      respondentRole: inputRow.companyProfile.respondentRole,
      departmentFunction: inputRow.companyProfile.departmentFunction,
      handlesSensitiveOrRegulatedData:
        inputRow.companyProfile.handlesSensitiveOrRegulatedData,
      mainAiConcerns: inputRow.companyProfile.mainAiConcerns ?? [],
    },
    lead: mapLeadContext(lead),
    tools: mapToolsFromInputRow(inputRow),
    scoringResult: {
      overallScore: scoringResult.overallScore,
      overallRiskLevel: scoringResult.overallRiskLevel,
      confidenceLevel: scoringResult.confidenceLevel,
      headline: scoringResult.scoringSummary.headline,
      explanation: scoringResult.scoringSummary.explanation,
      caveats: scoringResult.scoringSummary.caveats,
      categoryScores: scoringResult.categoryScores.map((category) => ({
        categoryId: category.categoryId,
        label: category.label,
        score: category.score,
        riskLevel: category.riskLevel,
        explanation: category.explanation,
      })),
    },
    findings: sortedFindings.map((finding) => ({
      findingId: finding.findingId,
      categoryId: finding.categoryId,
      severity: finding.severity,
      title: finding.title,
      summary: finding.summary,
      confidence: finding.confidence,
    })),
    recommendations: recommendationResult.recommendations.map(
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
  });

  validateReportContext(context);

  await upsertReportContextForAssessment({
    assessmentSessionId: inputRow.session.id,
    reportContext: context,
  });

  return {
    context,
    sections: getReportSections(),
  };
}

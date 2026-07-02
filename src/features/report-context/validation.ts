import { containsBannedTerm } from "@/features/recommendations/validation";
import { CATEGORY_LABELS } from "@/features/scoring/constants";

import {
  EMAIL_OUTSIDE_LEAD_PATTERN,
  MAX_REPORT_FINDINGS,
  MAX_REPORT_RECOMMENDATIONS,
  REPORT_CONTEXT_VERSION,
  REPORT_POSITIVE_BANNED_PATTERNS,
} from "./constants";
import type { ReportContext } from "./types";

export class ReportContextValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReportContextValidationError";
  }
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new ReportContextValidationError(message);
  }
}

const UUID_PATTERN =
  /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{32,64}$/;

function collectUserVisibleStrings(context: ReportContext): string[] {
  return [
    context.riskSummary.headline,
    context.riskSummary.explanation,
    ...context.riskSummary.caveats,
    ...context.categoryScores.map((category) => category.explanation),
    ...context.findings.flatMap((finding) => [finding.title, finding.summary]),
    ...context.recommendations.flatMap((recommendation) => [
      recommendation.title,
      recommendation.summary,
      recommendation.whyThisMatters,
      ...recommendation.implementationSteps,
      ...recommendation.caveats,
    ]),
    ...context.appendix.methodology,
    ...context.appendix.frameworksReferenced,
    ...context.appendix.limitations,
    ...context.appendix.dataSources,
    context.company.companyName ?? "",
    context.company.industry,
    context.company.companySize,
    context.company.countryRegion,
    context.company.respondentRole,
    context.company.departmentFunction ?? "",
    context.company.handlesSensitiveOrRegulatedData,
    ...context.company.mainAiConcerns,
    context.lead.name ?? "",
    context.lead.companyName ?? "",
    context.lead.role ?? "",
    context.lead.followUpInterest ?? "",
    ...context.tools.knownTools.flatMap((tool) => [
      tool.name,
      tool.category,
      tool.profileConfidence,
    ]),
    ...context.tools.unknownTools.flatMap((tool) => [
      tool.name,
      tool.url ?? "",
    ]),
  ];
}

function collectStringsOutsideLead(context: ReportContext): string[] {
  return collectUserVisibleStrings(context);
}

function hasPositiveBannedClaim(text: string): string | null {
  for (const pattern of REPORT_POSITIVE_BANNED_PATTERNS) {
    if (pattern.test(text)) {
      return pattern.source;
    }
  }
  return null;
}

export function validateReportContext(context: ReportContext): void {
  assert(
    context.reportContextVersion === REPORT_CONTEXT_VERSION,
    "Invalid reportContextVersion.",
  );

  assert(
    !Number.isNaN(Date.parse(context.generatedAt)),
    "generatedAt must be a valid ISO timestamp.",
  );

  assert(
    TOKEN_PATTERN.test(context.assessment.publicToken),
    "Invalid assessment publicToken format.",
  );

  assert(
    Number.isFinite(context.riskSummary.overallScore) &&
      context.riskSummary.overallScore >= 0 &&
      context.riskSummary.overallScore <= 100,
    "overallScore must be 0–100.",
  );

  const riskLevels = new Set(["low", "moderate", "high", "critical"]);
  assert(
    riskLevels.has(context.riskSummary.overallRiskLevel),
    "Invalid overallRiskLevel.",
  );

  const confidenceLevels = new Set(["low", "medium", "high"]);
  assert(
    confidenceLevels.has(context.riskSummary.confidenceLevel),
    "Invalid confidenceLevel.",
  );

  const expectedCategories = Object.keys(CATEGORY_LABELS);
  assert(
    context.categoryScores.length === expectedCategories.length,
    "Category scores must include all categories.",
  );

  assert(context.findings.length >= 1, "At least one finding is required.");
  assert(
    context.findings.length <= MAX_REPORT_FINDINGS,
    `Findings exceed ${MAX_REPORT_FINDINGS}.`,
  );

  assert(
    context.recommendations.length >= 1 &&
      context.recommendations.length <= MAX_REPORT_RECOMMENDATIONS,
    "Recommendations count must be 1–8.",
  );

  assert(
    context.appendix.methodology.length >= 1,
    "Methodology statements are required.",
  );
  assert(context.appendix.limitations.length >= 1, "Limitations are required.");
  assert(
    context.appendix.frameworksReferenced.length >= 1,
    "Framework references are required.",
  );

  for (const text of collectUserVisibleStrings(context)) {
    if (!text.trim()) {
      continue;
    }

    const banned = containsBannedTerm(text);
    assert(banned === null, `Banned term "${banned}" found in report context.`);

    const positiveBanned = hasPositiveBannedClaim(text);
    assert(
      positiveBanned === null,
      `Banned positive claim pattern "${positiveBanned}" found in report context.`,
    );
  }

  for (const field of [
    context.assessment.publicToken,
    ...collectUserVisibleStrings(context),
  ]) {
    assert(
      !UUID_PATTERN.test(field),
      "Raw UUID must not appear in report context.",
    );
  }

  for (const text of collectStringsOutsideLead(context)) {
    if (!text.trim()) {
      continue;
    }
    assert(
      !EMAIL_OUTSIDE_LEAD_PATTERN.test(text),
      "Email must only appear inside the lead object.",
    );
  }

  if (context.lead.hasLead) {
    assert(
      context.lead.email != null && context.lead.email.trim().length > 0,
      "Lead email is required when hasLead is true.",
    );
    assert(
      context.lead.consentToFollowUp === true,
      "Lead consent must be true when hasLead is true.",
    );
  } else {
    assert(
      context.lead.email === null,
      "Lead email must be null when hasLead is false.",
    );
  }

  const serialized = JSON.stringify(context);
  assert(
    !serialized.includes("pdf_url"),
    "PDF URL must not exist in report context.",
  );
  assert(
    !serialized.includes("storage_path"),
    "Storage path must not exist in report context.",
  );
}

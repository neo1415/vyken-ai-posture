import { REPORT_CONTEXT_VERSION } from "@/features/report-context/constants";
import type { ReportContext } from "@/features/report-context/types";
import { validateReportContext } from "@/features/report-context/validation";
import { containsBannedTerm } from "@/features/recommendations/validation";

import { PDF_POSITIVE_BANNED_PATTERNS } from "./constants";

export class PdfReportValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PdfReportValidationError";
  }
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new PdfReportValidationError(message);
  }
}

function collectPdfVisibleStrings(context: ReportContext): string[] {
  return [
    context.riskSummary.headline,
    context.riskSummary.explanation,
    ...context.riskSummary.caveats,
    ...context.categoryScores.flatMap((category) => [
      category.label,
      category.explanation,
    ]),
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
    context.company.industry,
    context.company.companySize,
    context.company.countryRegion,
    context.company.respondentRole,
    context.company.departmentFunction ?? "",
    context.company.handlesSensitiveOrRegulatedData,
    ...context.company.mainAiConcerns,
    context.company.companyName ?? "",
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

function hasPositiveBannedClaim(text: string): string | null {
  for (const pattern of PDF_POSITIVE_BANNED_PATTERNS) {
    if (pattern.test(text)) {
      return pattern.source;
    }
  }
  return null;
}

export function validatePdfReportContext(context: ReportContext): void {
  validateReportContext(context);

  assert(
    context.reportContextVersion === REPORT_CONTEXT_VERSION,
    `Unsupported report context version: ${context.reportContextVersion}`,
  );

  const visibleStrings = collectPdfVisibleStrings(context);
  assert(
    visibleStrings.some((text) => text.trim().length > 0),
    "PDF body is empty.",
  );

  for (const text of visibleStrings) {
    if (!text.trim()) continue;

    const banned = containsBannedTerm(text);
    assert(banned === null, `Banned term "${banned}" found in PDF text.`);

    const positiveBanned = hasPositiveBannedClaim(text);
    assert(
      positiveBanned === null,
      `Banned positive claim "${positiveBanned}" found in PDF text.`,
    );
  }

  if (context.lead.email) {
    for (const text of visibleStrings) {
      assert(
        !text.includes(context.lead.email!),
        "Lead email must not appear in PDF body text.",
      );
    }
  }
}

export function collectPdfTextForVerification(context: ReportContext): string {
  validatePdfReportContext(context);
  return collectPdfVisibleStrings(context).join("\n");
}

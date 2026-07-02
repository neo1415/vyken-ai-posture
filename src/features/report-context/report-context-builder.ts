import {
  DEPARTMENT_FUNCTION_OPTIONS,
  MAIN_AI_CONCERN_OPTIONS,
  RESPONDENT_ROLE_OPTIONS,
} from "@/features/company-profile/constants";
import {
  formatCompanySize,
  formatCountryRegion,
  formatIndustry,
  formatSensitiveData,
} from "@/features/results/formatters";
import { FOLLOW_UP_INTEREST_OPTIONS } from "@/features/leads/constants";

import { REPORT_CONTEXT_VERSION } from "./constants";
import {
  REPORT_DATA_SOURCES,
  REPORT_FRAMEWORKS_REFERENCED,
  REPORT_LIMITATIONS,
  REPORT_METHODOLOGY_STATEMENTS,
  REPORT_PRIMARY_DISCLAIMER,
} from "./methodology";
import type { ReportContext, ReportContextBuilderInput } from "./types";

function labelFromOptions(
  value: string,
  options: ReadonlyArray<{ value: string; label: string }>,
): string {
  return (
    options.find((option) => option.value === value)?.label ??
    value.replace(/_/g, " ")
  );
}

function formatRespondentRole(value: string | null): string {
  if (!value) return "Not specified";
  return labelFromOptions(value, RESPONDENT_ROLE_OPTIONS);
}

function formatDepartmentFunction(value: string | null): string | null {
  if (!value) return null;
  return labelFromOptions(value, DEPARTMENT_FUNCTION_OPTIONS);
}

function formatMainAiConcerns(values: string[]): string[] {
  return values.map((value) =>
    labelFromOptions(value, MAIN_AI_CONCERN_OPTIONS),
  );
}

function formatFollowUpInterest(value: string | null): string | null {
  if (!value) return null;
  return (
    FOLLOW_UP_INTEREST_OPTIONS.find((option) => option.value === value)
      ?.label ?? value.replace(/_/g, " ")
  );
}

export function buildReportContext(
  input: ReportContextBuilderInput,
): ReportContext {
  const knownToolCount = input.tools.knownTools.length;
  const unknownToolCount = input.tools.unknownTools.length;
  const notSureCount = input.tools.hasNotSureSelection ? 1 : 0;
  const toolCount = knownToolCount + unknownToolCount + notSureCount;

  const methodology = [...REPORT_METHODOLOGY_STATEMENTS];
  const limitations = [
    REPORT_PRIMARY_DISCLAIMER,
    ...REPORT_LIMITATIONS,
    ...input.scoringResult.caveats,
  ];

  return {
    reportContextVersion: REPORT_CONTEXT_VERSION,
    generatedAt: input.generatedAt,
    assessment: {
      publicToken: input.publicToken,
      completedAt: input.completedAt,
      status: input.sessionStatus,
    },
    company: {
      companyName: input.companyProfile.companyName,
      industry: formatIndustry(input.companyProfile.industry),
      companySize: formatCompanySize(input.companyProfile.companySize),
      countryRegion: formatCountryRegion(input.companyProfile.countryRegion),
      respondentRole: formatRespondentRole(input.companyProfile.respondentRole),
      departmentFunction: formatDepartmentFunction(
        input.companyProfile.departmentFunction,
      ),
      handlesSensitiveOrRegulatedData: formatSensitiveData(
        input.companyProfile.handlesSensitiveOrRegulatedData,
      ),
      mainAiConcerns: formatMainAiConcerns(input.companyProfile.mainAiConcerns),
    },
    lead: {
      hasLead: input.lead.hasLead,
      email: input.lead.email,
      name: input.lead.name,
      companyName: input.lead.companyName,
      role: input.lead.role,
      followUpInterest: formatFollowUpInterest(input.lead.followUpInterest),
      consentToFollowUp: input.lead.consentToFollowUp,
    },
    tools: {
      knownTools: input.tools.knownTools,
      unknownTools: input.tools.unknownTools,
      hasNotSureSelection: input.tools.hasNotSureSelection,
      toolCount,
    },
    riskSummary: {
      overallScore: input.scoringResult.overallScore,
      overallRiskLevel: input.scoringResult.overallRiskLevel,
      confidenceLevel: input.scoringResult.confidenceLevel,
      headline: input.scoringResult.headline,
      explanation: input.scoringResult.explanation,
      caveats: input.scoringResult.caveats,
    },
    categoryScores: input.scoringResult.categoryScores,
    findings: input.findings,
    recommendations: input.recommendations,
    appendix: {
      methodology,
      frameworksReferenced: [...REPORT_FRAMEWORKS_REFERENCED],
      limitations,
      dataSources: [...REPORT_DATA_SOURCES],
    },
  };
}

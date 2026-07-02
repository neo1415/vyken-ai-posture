import {
  COMPANY_SIZE_OPTIONS,
  COUNTRY_REGION_OPTIONS,
  INDUSTRY_OPTIONS,
  SENSITIVE_DATA_OPTIONS,
} from "@/features/company-profile/constants";
import { RECOMMENDATION_CATEGORY_LABELS } from "@/features/recommendations/constants";

import type {
  FindingConfidence,
  FindingSeverity,
  RecommendationEffort,
  RecommendationPriority,
  ResultConfidenceLevel,
  ResultRiskLevel,
} from "./types";

function labelFromOptions(
  value: string,
  options: ReadonlyArray<{ value: string; label: string }>,
): string {
  return (
    options.find((o) => o.value === value)?.label ?? value.replace(/_/g, " ")
  );
}

export function formatIndustry(value: string): string {
  return labelFromOptions(value, INDUSTRY_OPTIONS);
}

export function formatCompanySize(value: string): string {
  return labelFromOptions(value, COMPANY_SIZE_OPTIONS);
}

export function formatCountryRegion(value: string | null): string {
  if (!value) return "Not specified";
  return labelFromOptions(value, COUNTRY_REGION_OPTIONS);
}

export function formatSensitiveData(value: string | null): string {
  if (!value) return "Not specified";
  return labelFromOptions(value, SENSITIVE_DATA_OPTIONS);
}

export function formatRiskLevel(level: ResultRiskLevel): string {
  const labels: Record<ResultRiskLevel, string> = {
    low: "Low",
    moderate: "Moderate",
    high: "High",
    critical: "Critical",
  };
  return labels[level];
}

export function formatConfidenceLevel(level: ResultConfidenceLevel): string {
  const labels: Record<ResultConfidenceLevel, string> = {
    low: "Low confidence",
    medium: "Medium confidence",
    high: "High confidence",
  };
  return labels[level];
}

export function formatFindingSeverity(severity: FindingSeverity): string {
  const labels: Record<FindingSeverity, string> = {
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",
  };
  return labels[severity];
}

export function formatPriority(priority: RecommendationPriority): string {
  const labels: Record<RecommendationPriority, string> = {
    low: "Low priority",
    medium: "Medium priority",
    high: "High priority",
    urgent: "Urgent",
  };
  return labels[priority];
}

export function formatEffort(effort: RecommendationEffort): string {
  const labels: Record<RecommendationEffort, string> = {
    low: "Low effort",
    medium: "Medium effort",
    high: "High effort",
  };
  return labels[effort];
}

export function formatRecommendationCategory(categoryId: string): string {
  return (
    RECOMMENDATION_CATEGORY_LABELS[
      categoryId as keyof typeof RECOMMENDATION_CATEGORY_LABELS
    ] ?? categoryId.replace(/_/g, " ")
  );
}

export function findingSeverityToRiskChipLevel(
  severity: FindingSeverity,
): ResultRiskLevel {
  return severity === "medium" ? "moderate" : severity;
}

export function findingSeverityRank(severity: FindingSeverity): number {
  if (severity === "critical") return 4;
  if (severity === "high") return 3;
  if (severity === "medium") return 2;
  return 1;
}

export function formatConfidenceShort(confidence: FindingConfidence): string {
  const labels: Record<FindingConfidence, string> = {
    low: "Low confidence",
    medium: "Medium confidence",
    high: "High confidence",
  };
  return labels[confidence];
}

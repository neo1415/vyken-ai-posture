export const PDF_CONFIDENTIALITY_NOTE =
  "Prepared from user-provided assessment responses. Intended for internal review and planning.";

export const PDF_PRIMARY_DISCLAIMER =
  "This report is a framework-informed starting point based on the answers provided. It is not a legal opinion, audit, certification, or live technical scan.";

export function formatPdfDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }
  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatRiskLevelLabel(
  level: "low" | "moderate" | "high" | "critical",
): string {
  const labels = {
    low: "Low",
    moderate: "Moderate",
    high: "High",
    critical: "Critical",
  } as const;
  return labels[level];
}

export function formatConfidenceLabel(
  level: "low" | "medium" | "high",
): string {
  const labels = {
    low: "Low confidence",
    medium: "Medium confidence",
    high: "High confidence",
  } as const;
  return labels[level];
}

export function formatSeverityLabel(
  severity: "low" | "medium" | "high" | "critical",
): string {
  if (severity === "medium") return "Medium";
  return formatRiskLevelLabel(severity);
}

export function formatPriorityLabel(
  priority: "low" | "medium" | "high" | "urgent",
): string {
  const labels = {
    low: "Low priority",
    medium: "Medium priority",
    high: "High priority",
    urgent: "Urgent",
  } as const;
  return labels[priority];
}

export function formatEffortLabel(effort: "low" | "medium" | "high"): string {
  const labels = {
    low: "Low effort",
    medium: "Medium effort",
    high: "High effort",
  } as const;
  return labels[effort];
}

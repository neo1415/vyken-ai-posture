import { CONFIDENCE_FILTER_OPTIONS } from "./constants";

export function formatToolStatus(isActive: boolean): string {
  return isActive ? "Active" : "Inactive";
}

export function formatPublishedStatus(status: string | null): string {
  if (!status) return "None";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function formatConfidenceLevel(level: string | null): string {
  if (!level) return "Unknown";
  if (level in CONFIDENCE_FILTER_OPTIONS) {
    return level.charAt(0).toUpperCase() + level.slice(1);
  }
  return level.replace(/_/g, " ");
}

export function formatCommonUseCases(cases: string[]): string {
  if (cases.length === 0) return "None listed";
  return cases.join(", ");
}

export function parseCommonUseCasesInput(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export function commonUseCasesToInput(cases: string[]): string {
  return cases.join("\n");
}

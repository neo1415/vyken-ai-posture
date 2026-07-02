import type { RiskLevel, ScoringCategoryId } from "./types";

export const SCORING_MODEL_VERSION = "v1.0-framework-informed" as const;

export const CATEGORY_WEIGHTS: Record<ScoringCategoryId, number> = {
  visibility_and_inventory: 0.18,
  data_exposure: 0.22,
  governance_controls: 0.2,
  vendor_and_tool_risk: 0.14,
  agentic_and_coding_risk: 0.16,
  decision_impact_risk: 0.1,
} as const;

export const CATEGORY_LABELS: Record<ScoringCategoryId, string> = {
  visibility_and_inventory: "Visibility and inventory",
  data_exposure: "Data exposure",
  governance_controls: "Governance controls",
  vendor_and_tool_risk: "Vendor and tool risk",
  agentic_and_coding_risk: "Agentic and coding risk",
  decision_impact_risk: "Decision impact risk",
};

export function clampScore(value: number): number {
  if (Number.isNaN(value) || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

export function roundScore(value: number): number {
  return Math.round(clampScore(value));
}

export function riskLevelFromScore(score0to100: number): RiskLevel {
  const score = clampScore(score0to100);
  if (score <= 24) return "low";
  if (score <= 49) return "moderate";
  if (score <= 74) return "high";
  return "critical";
}

export function isScoreInBand(score0to100: number): boolean {
  const score = score0to100;
  return Number.isFinite(score) && score >= 0 && score <= 100;
}

import { cn } from "@/lib/utils/cn";

export type RiskLevel = "low" | "moderate" | "high" | "critical" | "unknown";

const riskLevelLabels: Record<RiskLevel, string> = {
  low: "Low",
  moderate: "Moderate",
  high: "High",
  critical: "Critical",
  unknown: "Unknown",
};

const riskLevelClasses: Record<RiskLevel, string> = {
  low: "border-risk-low/40 bg-risk-low/10 text-risk-low",
  moderate: "border-risk-moderate/40 bg-risk-moderate/10 text-risk-moderate",
  high: "border-risk-high/40 bg-risk-high/10 text-risk-high",
  critical: "border-risk-critical/40 bg-risk-critical/10 text-risk-critical",
  unknown: "border-risk-unknown/40 bg-risk-unknown/10 text-risk-unknown",
};

export type RiskChipProps = {
  level: RiskLevel;
  label?: string;
  className?: string;
};

export function RiskChip({ level, label, className }: RiskChipProps) {
  const displayLabel = label ?? riskLevelLabels[level];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase",
        riskLevelClasses[level],
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("size-1.5 rounded-full", {
          "bg-risk-low": level === "low",
          "bg-risk-moderate": level === "moderate",
          "bg-risk-high": level === "high",
          "bg-risk-critical": level === "critical",
          "bg-risk-unknown": level === "unknown",
        })}
      />
      <span>{displayLabel}</span>
    </span>
  );
}

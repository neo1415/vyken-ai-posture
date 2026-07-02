import { RiskChip } from "@/components/ui/RiskChip";
import { formatRiskLevel } from "@/features/results/formatters";
import type { AssessmentResultViewModel } from "@/features/results/types";

import { resultMutedPanelClasses } from "./result-ui";

type CategoryScoreCardProps = {
  category: AssessmentResultViewModel["categoryScores"][number];
};

export function CategoryScoreCard({ category }: CategoryScoreCardProps) {
  const meterLabel = `${category.label}: ${category.score} out of 100, ${formatRiskLevel(category.riskLevel)} risk`;

  return (
    <article className={`${resultMutedPanelClasses} space-y-3`}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-foreground text-sm font-semibold">
          {category.label}
        </h3>
        <RiskChip level={category.riskLevel} />
      </div>

      <p className="text-foreground text-2xl font-bold tabular-nums">
        {category.score}
        <span className="text-muted-foreground text-sm font-medium">/100</span>
      </p>

      <div
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={category.score}
        aria-label={meterLabel}
        className="bg-background h-2 overflow-hidden rounded-full"
      >
        <div
          className="bg-primary h-full rounded-full transition-all"
          style={{ width: `${category.score}%` }}
        />
      </div>
      <p className="text-muted-foreground sr-only">{meterLabel}</p>

      <p className="text-muted-foreground text-sm leading-relaxed">
        {category.explanation}
      </p>
    </article>
  );
}

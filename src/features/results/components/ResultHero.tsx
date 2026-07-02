import { RiskChip } from "@/components/ui/RiskChip";
import { RESULT_PAGE_COPY } from "@/features/results/constants";
import {
  formatConfidenceLevel,
  formatRiskLevel,
} from "@/features/results/formatters";
import type { AssessmentResultViewModel } from "@/features/results/types";

type ResultHeroProps = {
  summary: AssessmentResultViewModel["summary"];
};

export function ResultHero({ summary }: ResultHeroProps) {
  return (
    <header className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-foreground text-xs font-bold tracking-[0.22em] uppercase">
          {RESULT_PAGE_COPY.brandLabel}
        </p>
        <span className="vyken-pill">{RESULT_PAGE_COPY.resultLabel}</span>
      </div>

      <div className="space-y-3">
        <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
          {RESULT_PAGE_COPY.pageTitle}
        </h1>
        <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed sm:text-base">
          {RESULT_PAGE_COPY.pageHelper}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <p className="text-foreground text-5xl font-bold tabular-nums sm:text-6xl">
          {summary.overallScore}
          <span className="text-muted-foreground text-2xl font-semibold">
            /100
          </span>
        </p>
        <div className="flex flex-wrap gap-2">
          <RiskChip
            level={summary.overallRiskLevel}
            label={`${formatRiskLevel(summary.overallRiskLevel)} risk`}
          />
          <span className="border-border bg-surface-muted text-foreground inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold">
            {formatConfidenceLevel(summary.confidenceLevel)}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-foreground text-base font-semibold sm:text-lg">
          {summary.headline}
        </p>
        <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
          {summary.explanation}
        </p>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {RESULT_PAGE_COPY.primaryDisclaimer}
        </p>
      </div>
    </header>
  );
}

import { RiskChip } from "@/components/ui/RiskChip";
import { RESULT_PAGE_COPY } from "@/features/results/constants";
import {
  formatConfidenceLevel,
  formatRiskLevel,
} from "@/features/results/formatters";
import type { AssessmentResultViewModel } from "@/features/results/types";

import { resultCardClasses, resultMutedPanelClasses } from "./result-ui";

type RiskScoreCardProps = {
  summary: AssessmentResultViewModel["summary"];
};

export function RiskScoreCard({ summary }: RiskScoreCardProps) {
  return (
    <section className={resultCardClasses} aria-labelledby="risk-score-title">
      <h2
        id="risk-score-title"
        className="text-foreground mb-4 text-lg font-semibold"
      >
        {RESULT_PAGE_COPY.scoreCardTitle}
      </h2>

      <div className={`${resultMutedPanelClasses} space-y-4`}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-muted-foreground text-sm">Overall score</p>
            <p className="text-foreground text-3xl font-bold tabular-nums">
              {summary.overallScore}
              <span className="text-muted-foreground text-lg font-semibold">
                {" "}
                / 100
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <RiskChip
              level={summary.overallRiskLevel}
              label={formatRiskLevel(summary.overallRiskLevel)}
            />
            <span className="border-border bg-background text-foreground inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold">
              {formatConfidenceLevel(summary.confidenceLevel)}
            </span>
          </div>
        </div>

        <dl className="grid gap-3 sm:grid-cols-3">
          <div>
            <dt className="text-muted-foreground text-xs tracking-wide uppercase">
              Signals
            </dt>
            <dd className="text-foreground text-lg font-semibold tabular-nums">
              {summary.signalCount}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs tracking-wide uppercase">
              Findings
            </dt>
            <dd className="text-foreground text-lg font-semibold tabular-nums">
              {summary.findingCount}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs tracking-wide uppercase">
              Recommendations
            </dt>
            <dd className="text-foreground text-lg font-semibold tabular-nums">
              {summary.recommendationCount}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

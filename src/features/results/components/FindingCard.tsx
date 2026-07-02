import { RiskChip } from "@/components/ui/RiskChip";
import {
  findingSeverityToRiskChipLevel,
  formatConfidenceShort,
  formatFindingSeverity,
} from "@/features/results/formatters";
import type { AssessmentResultViewModel } from "@/features/results/types";

import { resultMutedPanelClasses } from "./result-ui";

type FindingCardProps = {
  finding: AssessmentResultViewModel["findings"][number];
};

export function FindingCard({ finding }: FindingCardProps) {
  return (
    <article className={`${resultMutedPanelClasses} space-y-3`}>
      <div className="flex flex-wrap items-center gap-2">
        <RiskChip
          level={findingSeverityToRiskChipLevel(finding.severity)}
          label={formatFindingSeverity(finding.severity)}
        />
        <span className="text-muted-foreground text-xs font-medium">
          {formatConfidenceShort(finding.confidence)}
        </span>
      </div>
      <h3 className="text-foreground text-base font-semibold">
        {finding.title}
      </h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {finding.summary}
      </p>
    </article>
  );
}

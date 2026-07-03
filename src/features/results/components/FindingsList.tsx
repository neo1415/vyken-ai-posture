import { RESULT_PAGE_COPY } from "@/features/results/constants";
import type { AssessmentResultViewModel } from "@/features/results/types";

import { FindingCard } from "./FindingCard";
import {
  resultSectionClasses,
  resultSectionHelperClasses,
  resultSectionTitleClasses,
} from "./result-ui";

type FindingsListProps = {
  findings: AssessmentResultViewModel["findings"];
};

export function FindingsList({ findings }: FindingsListProps) {
  if (findings.length === 0) {
    return null;
  }

  return (
    <section className={resultSectionClasses} aria-labelledby="findings-title">
      <div className="space-y-2">
        <h2 id="findings-title" className={resultSectionTitleClasses}>
          {RESULT_PAGE_COPY.findingsSectionTitle}
        </h2>
        <p className={resultSectionHelperClasses}>
          {RESULT_PAGE_COPY.findingsSectionHelper}
        </p>
      </div>

      <div className="space-y-4">
        {findings.map((finding) => (
          <FindingCard key={finding.findingId} finding={finding} />
        ))}
      </div>
    </section>
  );
}

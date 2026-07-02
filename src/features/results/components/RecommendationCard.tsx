import {
  formatEffort,
  formatPriority,
  formatRecommendationCategory,
} from "@/features/results/formatters";
import type { AssessmentResultViewModel } from "@/features/results/types";

import { resultMutedPanelClasses } from "./result-ui";

type RecommendationCardProps = {
  recommendation: AssessmentResultViewModel["recommendations"][number];
  index: number;
};

export function RecommendationCard({
  recommendation,
  index,
}: RecommendationCardProps) {
  return (
    <article className={`${resultMutedPanelClasses} space-y-4`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="border-primary/30 bg-primary/10 text-primary inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold">
          {formatPriority(recommendation.priority)}
        </span>
        <span className="border-border bg-background text-foreground inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold">
          {formatEffort(recommendation.effort)}
        </span>
        <span className="text-muted-foreground text-xs">
          {formatRecommendationCategory(recommendation.categoryId)}
        </span>
      </div>

      <div className="space-y-2">
        <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          Recommendation {index + 1}
        </p>
        <h3 className="text-foreground text-base font-semibold">
          {recommendation.title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {recommendation.summary}
        </p>
      </div>

      <div className="space-y-2">
        <h4 className="text-foreground text-sm font-semibold">
          Implementation steps
        </h4>
        <ol className="text-muted-foreground list-decimal space-y-2 pl-5 text-sm leading-relaxed">
          {recommendation.implementationSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>

      <div className="space-y-1">
        <h4 className="text-foreground text-sm font-semibold">
          Why this matters
        </h4>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {recommendation.whyThisMatters}
        </p>
      </div>

      {recommendation.caveats.length > 0 ? (
        <div className="space-y-1">
          <h4 className="text-foreground text-sm font-semibold">Caveats</h4>
          <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm leading-relaxed">
            {recommendation.caveats.map((caveat) => (
              <li key={caveat}>{caveat}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}

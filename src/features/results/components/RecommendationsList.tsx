import { RESULT_PAGE_COPY } from "@/features/results/constants";
import type { AssessmentResultViewModel } from "@/features/results/types";

import { RecommendationCard } from "./RecommendationCard";
import {
  resultSectionClasses,
  resultSectionHelperClasses,
  resultSectionTitleClasses,
} from "./result-ui";

type RecommendationsListProps = {
  recommendations: AssessmentResultViewModel["recommendations"];
};

export function RecommendationsList({
  recommendations,
}: RecommendationsListProps) {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section
      className={resultSectionClasses}
      aria-labelledby="recommendations-title"
    >
      <div className="space-y-2">
        <h2 id="recommendations-title" className={resultSectionTitleClasses}>
          {RESULT_PAGE_COPY.recommendationsSectionTitle}
        </h2>
        <p className={resultSectionHelperClasses}>
          {RESULT_PAGE_COPY.recommendationsSectionHelper}
        </p>
      </div>

      <div className="space-y-4">
        {recommendations.map((recommendation, index) => (
          <RecommendationCard
            key={recommendation.recommendationId}
            recommendation={recommendation}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}

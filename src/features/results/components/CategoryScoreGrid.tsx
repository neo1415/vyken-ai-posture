import { RESULT_PAGE_COPY } from "@/features/results/constants";
import type { AssessmentResultViewModel } from "@/features/results/types";

import { CategoryScoreCard } from "./CategoryScoreCard";
import {
  resultSectionClasses,
  resultSectionHelperClasses,
  resultSectionTitleClasses,
} from "./result-ui";

type CategoryScoreGridProps = {
  categories: AssessmentResultViewModel["categoryScores"];
};

export function CategoryScoreGrid({ categories }: CategoryScoreGridProps) {
  return (
    <section
      className={resultSectionClasses}
      aria-labelledby="category-scores-title"
    >
      <div className="space-y-2">
        <h2 id="category-scores-title" className={resultSectionTitleClasses}>
          {RESULT_PAGE_COPY.categorySectionTitle}
        </h2>
        <p className={resultSectionHelperClasses}>
          {RESULT_PAGE_COPY.categorySectionHelper}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => (
          <CategoryScoreCard key={category.categoryId} category={category} />
        ))}
      </div>
    </section>
  );
}

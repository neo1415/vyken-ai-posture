import { RESULT_PAGE_COPY } from "@/features/results/constants";

import { resultCardClasses } from "./result-ui";

export function ResultNextStep() {
  return (
    <section className={resultCardClasses} aria-labelledby="next-step-title">
      <h2
        id="next-step-title"
        className="text-foreground mb-2 text-lg font-semibold"
      >
        {RESULT_PAGE_COPY.nextStepTitle}
      </h2>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {RESULT_PAGE_COPY.nextStepBody}
      </p>
    </section>
  );
}

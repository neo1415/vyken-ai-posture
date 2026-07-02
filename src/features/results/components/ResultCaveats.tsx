import {
  RESULT_DISCLAIMERS,
  RESULT_PAGE_COPY,
} from "@/features/results/constants";
import type { AssessmentResultViewModel } from "@/features/results/types";

import { resultCardClasses } from "./result-ui";

type ResultCaveatsProps = {
  summaryCaveats: AssessmentResultViewModel["summary"]["caveats"];
};

export function ResultCaveats({ summaryCaveats }: ResultCaveatsProps) {
  const allCaveats = [...RESULT_DISCLAIMERS, ...summaryCaveats];

  return (
    <section className={resultCardClasses} aria-labelledby="caveats-title">
      <h2
        id="caveats-title"
        className="text-foreground mb-4 text-lg font-semibold"
      >
        {RESULT_PAGE_COPY.caveatsSectionTitle}
      </h2>
      <ul className="text-muted-foreground list-disc space-y-3 pl-5 text-sm leading-relaxed">
        {allCaveats.map((caveat) => (
          <li key={caveat}>{caveat}</li>
        ))}
      </ul>
    </section>
  );
}

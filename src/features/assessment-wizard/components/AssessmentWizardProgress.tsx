import { cn } from "@/lib/utils/cn";

import {
  ASSESSMENT_TOTAL_STEPS,
  ASSESSMENT_WIZARD_COPY,
  ASSESSMENT_WIZARD_PRODUCT_STEP,
} from "../constants";

export type AssessmentWizardProgressProps = {
  currentSection: number;
  totalSections: number;
  className?: string;
};

export function AssessmentWizardProgress({
  currentSection,
  totalSections,
  className,
}: AssessmentWizardProgressProps) {
  const percent = Math.round((currentSection / totalSections) * 100);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-primary text-xs font-semibold tracking-[0.18em] uppercase">
          {ASSESSMENT_WIZARD_COPY.progressLabel}
        </p>
        <p
          className="text-primary text-sm font-semibold tabular-nums"
          aria-live="polite"
        >
          {ASSESSMENT_WIZARD_PRODUCT_STEP} / {ASSESSMENT_TOTAL_STEPS}
        </p>
      </div>
      <div
        className="vyken-progress-track"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Assessment step ${ASSESSMENT_WIZARD_PRODUCT_STEP} of ${ASSESSMENT_TOTAL_STEPS}`}
      >
        <div className="vyken-progress-fill" style={{ width: `${percent}%` }} />
      </div>
      <p className="text-muted-foreground text-xs">
        {ASSESSMENT_WIZARD_COPY.sectionProgressLabel} {currentSection} of{" "}
        {totalSections}
      </p>
    </div>
  );
}

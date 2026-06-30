import { cn } from "@/lib/utils/cn";

import { COMPANY_PROFILE_COPY } from "../constants";

export type CompanyProfileProgressProps = {
  currentStep: number;
  totalSteps: number;
  className?: string;
};

export function CompanyProfileProgress({
  currentStep,
  totalSteps,
  className,
}: CompanyProfileProgressProps) {
  const stepNumber = currentStep + 1;
  const percent = Math.round((stepNumber / totalSteps) * 100);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-primary text-xs font-semibold tracking-[0.18em] uppercase">
          {COMPANY_PROFILE_COPY.progressLabel}
        </p>
        <p
          className="text-primary text-sm font-semibold tabular-nums"
          aria-live="polite"
        >
          {stepNumber} / {totalSteps}
        </p>
      </div>
      <div
        className="vyken-progress-track"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Company profile step ${stepNumber} of ${totalSteps}`}
      >
        <div className="vyken-progress-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

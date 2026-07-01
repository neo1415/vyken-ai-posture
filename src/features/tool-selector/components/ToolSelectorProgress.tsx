import { cn } from "@/lib/utils/cn";

import {
  ASSESSMENT_TOTAL_STEPS,
  TOOL_SELECTOR_COPY,
  TOOL_SELECTOR_STEP_NUMBER,
} from "../constants";

export type ToolSelectorProgressProps = {
  className?: string;
};

export function ToolSelectorProgress({ className }: ToolSelectorProgressProps) {
  const percent = Math.round(
    (TOOL_SELECTOR_STEP_NUMBER / ASSESSMENT_TOTAL_STEPS) * 100,
  );

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-primary text-xs font-semibold tracking-[0.18em] uppercase">
          {TOOL_SELECTOR_COPY.progressLabel}
        </p>
        <p
          className="text-primary text-sm font-semibold tabular-nums"
          aria-live="polite"
        >
          {TOOL_SELECTOR_STEP_NUMBER} / {ASSESSMENT_TOTAL_STEPS}
        </p>
      </div>
      <div
        className="vyken-progress-track"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Assessment step ${TOOL_SELECTOR_STEP_NUMBER} of ${ASSESSMENT_TOTAL_STEPS}`}
      >
        <div className="vyken-progress-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils/cn";

import { getRequiredQuestionIds } from "../validation";
import { isAgenticSectionRequired } from "../agentic-trigger";
import type { AnswerMap, SelectedToolContext } from "../types";

export type AssessmentAnswerSummaryProps = {
  answers: AnswerMap;
  toolContext: SelectedToolContext;
  className?: string;
};

export function AssessmentAnswerSummary({
  answers,
  toolContext,
  className,
}: AssessmentAnswerSummaryProps) {
  const requiredIds = getRequiredQuestionIds(toolContext, answers);
  const answeredCount = requiredIds.filter((id) => {
    const value = answers[id];
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return typeof value === "string" && value.length > 0;
  }).length;

  const agenticRequired = isAgenticSectionRequired(toolContext, answers);

  return (
    <div
      className={cn(
        "border-border bg-surface-muted rounded-lg border px-4 py-3",
        className,
      )}
      aria-live="polite"
    >
      <p className="text-foreground text-sm font-medium">
        You&apos;ve answered {answeredCount} of {requiredIds.length} required
        questions
      </p>
      {agenticRequired ? (
        <p className="text-muted-foreground mt-1 text-xs">
          Additional agentic/coding questions are required based on your tool
          and data exposure selections.
        </p>
      ) : null}
    </div>
  );
}

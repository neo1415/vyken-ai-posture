import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export type AssessmentQuestionCardProps = {
  questionId: string;
  title: string;
  helperText?: string;
  frameworkHint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
};

export function AssessmentQuestionCard({
  questionId,
  title,
  helperText,
  frameworkHint,
  error,
  children,
  className,
}: AssessmentQuestionCardProps) {
  const errorId = `${questionId}-error`;

  return (
    <fieldset
      className={cn("vyken-card space-y-4 border-0 p-4 sm:p-6", className)}
      aria-describedby={
        error ? errorId : helperText ? `${questionId}-helper` : undefined
      }
    >
      <legend className="text-foreground mb-2 text-base font-semibold">
        {title}
      </legend>
      {helperText ? (
        <p
          id={`${questionId}-helper`}
          className="text-muted-foreground text-sm leading-relaxed"
        >
          {helperText}
        </p>
      ) : null}
      {frameworkHint ? (
        <p className="text-primary/80 text-xs leading-relaxed italic">
          {frameworkHint}
        </p>
      ) : null}
      <div className="grid gap-2 sm:grid-cols-2">{children}</div>
      {error ? (
        <p id={errorId} role="alert" className="text-danger text-sm">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

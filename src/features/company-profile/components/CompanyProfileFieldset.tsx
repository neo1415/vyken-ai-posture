import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

import { FieldGroupError } from "./FormError";

export type CompanyProfileFieldsetProps = {
  legend: string;
  helperText?: string;
  required?: boolean;
  errorId?: string;
  errors?: string[];
  children: ReactNode;
  className?: string;
};

export function CompanyProfileFieldset({
  legend,
  helperText,
  required = false,
  errorId,
  errors,
  children,
  className,
}: CompanyProfileFieldsetProps) {
  const describedBy = [
    helperText ? `${errorId}-helper` : null,
    errors?.length ? errorId : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <fieldset
      className={cn("space-y-3 border-0 p-0", className)}
      aria-describedby={describedBy || undefined}
    >
      <legend className="text-foreground text-base font-medium">
        {legend}
        {required ? (
          <span className="text-danger ml-1" aria-hidden="true">
            *
          </span>
        ) : null}
        {required ? <span className="sr-only"> (required)</span> : null}
      </legend>
      {helperText ? (
        <p
          id={`${errorId}-helper`}
          className="text-muted-foreground text-sm leading-relaxed"
        >
          {helperText}
        </p>
      ) : null}
      {children}
      {errorId ? <FieldGroupError id={errorId} errors={errors} /> : null}
    </fieldset>
  );
}

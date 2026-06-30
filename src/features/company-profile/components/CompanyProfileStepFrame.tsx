import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export type CompanyProfileStepFrameProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  stepKey?: string;
};

export function CompanyProfileStepFrame({
  title,
  description,
  children,
  className,
  stepKey,
}: CompanyProfileStepFrameProps) {
  return (
    <section
      key={stepKey}
      className={cn(
        "vyken-step-enter vyken-card space-y-6 p-6 sm:p-8",
        className,
      )}
      aria-labelledby={`step-title-${stepKey ?? title}`}
    >
      <header className="space-y-2">
        <h2
          id={`step-title-${stepKey ?? title}`}
          className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl"
        >
          {title}
        </h2>
        {description ? (
          <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed sm:text-base">
            {description}
          </p>
        ) : null}
      </header>
      {children}
    </section>
  );
}

import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export type AssessmentSectionFrameProps = {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
};

export function AssessmentSectionFrame({
  title,
  description,
  children,
  className,
}: AssessmentSectionFrameProps) {
  return (
    <section className={cn("space-y-6", className)}>
      <div className="space-y-2">
        <h2 className="text-foreground text-xl font-semibold tracking-tight">
          {title}
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export type SectionHeaderAlignment = "left" | "center";

export type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  alignment?: SectionHeaderAlignment;
  actions?: ReactNode;
  headingLevel?: 1 | 2 | 3;
  className?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  alignment = "left",
  actions,
  headingLevel = 2,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        alignment === "center" && "text-center sm:flex-col sm:items-center",
        className,
      )}
    >
      <div
        className={cn(
          "max-w-3xl space-y-2",
          alignment === "center" && "mx-auto",
        )}
      >
        {eyebrow ? (
          <p className="text-primary text-xs font-semibold tracking-widest uppercase">
            {eyebrow}
          </p>
        ) : null}
        {headingLevel === 1 ? (
          <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
            {title}
          </h1>
        ) : headingLevel === 2 ? (
          <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
            {title}
          </h2>
        ) : (
          <h3 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
            {title}
          </h3>
        )}
        {description ? (
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div
          className={cn(
            "flex shrink-0 flex-wrap gap-2",
            alignment === "center" && "justify-center",
          )}
        >
          {actions}
        </div>
      ) : null}
    </div>
  );
}

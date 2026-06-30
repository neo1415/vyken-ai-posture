import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

import { Badge } from "./Badge";

export type ToolCardProps = {
  name: string;
  category: string;
  description?: string;
  selected?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  confidenceLabel?: string;
  className?: string;
};

/**
 * Visual shell for future AI tool selection.
 * Selection state is display-only — parent controls `selected` prop.
 * Interactive selection wrapper will be added in the assessment module.
 */
export function ToolCard({
  name,
  category,
  description,
  selected = false,
  disabled = false,
  icon,
  confidenceLabel,
  className,
}: ToolCardProps) {
  return (
    <article
      className={cn(
        "border-border bg-surface-elevated flex flex-col gap-3 rounded-[var(--radius-card)] border p-4 transition-colors",
        selected && "border-primary ring-primary/30 ring-1",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {icon ? (
            <div
              aria-hidden="true"
              className="bg-surface-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-semibold"
            >
              {icon}
            </div>
          ) : (
            <div
              aria-hidden="true"
              className="bg-surface-muted text-primary flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
            >
              {name.charAt(0)}
            </div>
          )}
          <div>
            <h3 className="text-foreground text-sm font-semibold">{name}</h3>
            <p className="text-muted-foreground text-xs">{category}</p>
          </div>
        </div>
        {selected ? (
          <Badge variant="info" aria-label="Selected">
            Selected
          </Badge>
        ) : null}
      </div>
      {description ? (
        <p className="text-muted-foreground text-xs leading-relaxed">
          {description}
        </p>
      ) : null}
      {confidenceLabel ? (
        <p className="text-muted-foreground text-xs">
          Confidence: {confidenceLabel}
        </p>
      ) : null}
    </article>
  );
}

import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <section
      className={cn(
        "border-border bg-surface-muted/50 flex flex-col items-center rounded-[var(--radius-card)] border px-6 py-12 text-center",
        className,
      )}
      aria-labelledby="empty-state-title"
    >
      {icon ? (
        <div
          aria-hidden="true"
          className="text-muted-foreground bg-surface-elevated mb-4 flex size-12 items-center justify-center rounded-full"
        >
          {icon}
        </div>
      ) : null}
      <h2
        id="empty-state-title"
        className="text-foreground text-lg font-semibold"
      >
        {title}
      </h2>
      <p className="text-muted-foreground mt-2 max-w-md text-sm leading-relaxed">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </section>
  );
}

import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export type ErrorStateVariant = "default" | "inline";

export type ErrorStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  variant?: ErrorStateVariant;
  className?: string;
};

export function ErrorState({
  title,
  description,
  action,
  variant = "default",
  className,
}: ErrorStateProps) {
  return (
    <section
      role="alert"
      className={cn(
        "rounded-[var(--radius-card)] border px-6 py-8",
        variant === "default" &&
          "border-danger/40 bg-danger/5 flex flex-col items-center text-center",
        variant === "inline" && "border-danger/30 bg-surface-elevated",
        className,
      )}
      aria-labelledby="error-state-title"
    >
      <h2
        id="error-state-title"
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

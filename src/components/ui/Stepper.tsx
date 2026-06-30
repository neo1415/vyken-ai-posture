import { cn } from "@/lib/utils/cn";

export type StepStatus = "complete" | "current" | "upcoming";

export type StepperStep = {
  id: string;
  label: string;
  status: StepStatus;
};

export type StepperProps = {
  steps: StepperStep[];
  className?: string;
  label?: string;
};

export function Stepper({
  steps,
  className,
  label = "Progress",
}: StepperProps) {
  if (steps.length === 0) {
    return null;
  }

  return (
    <nav aria-label={label} className={cn("w-full", className)}>
      <ol className="flex flex-wrap gap-2 sm:gap-4">
        {steps.map((step, index) => (
          <li
            key={step.id}
            aria-current={step.status === "current" ? "step" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium sm:text-sm",
              step.status === "complete" &&
                "border-primary/40 bg-primary/10 text-primary",
              step.status === "current" &&
                "border-primary bg-primary/15 text-foreground",
              step.status === "upcoming" &&
                "border-border bg-surface-muted text-muted-foreground",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "flex size-5 items-center justify-center rounded-full text-[10px] font-bold",
                step.status === "complete" &&
                  "bg-primary text-primary-foreground",
                step.status === "current" &&
                  "border-primary text-primary bg-background border",
                step.status === "upcoming" &&
                  "border-border text-muted-foreground bg-background border",
              )}
            >
              {step.status === "complete" ? "✓" : index + 1}
            </span>
            <span>{step.label}</span>
          </li>
        ))}
      </ol>
    </nav>
  );
}

import { cn } from "@/lib/utils/cn";

export type ToolSelectionSummaryProps = {
  knownCount: number;
  unknownCount: number;
  notSure: boolean;
  validationHint?: string;
  className?: string;
};

export function ToolSelectionSummary({
  knownCount,
  unknownCount,
  notSure,
  validationHint,
  className,
}: ToolSelectionSummaryProps) {
  const total = knownCount + unknownCount + (notSure ? 1 : 0);
  const parts: string[] = [];

  if (knownCount > 0) {
    parts.push(`${knownCount} tool${knownCount === 1 ? "" : "s"} selected`);
  }
  if (unknownCount > 0) {
    parts.push(`${unknownCount} unknown tool${unknownCount === 1 ? "" : "s"}`);
  }
  if (notSure) {
    parts.push("Not sure selected");
  }

  const summaryText =
    parts.length > 0 ? parts.join(" · ") : "No selections yet";

  return (
    <div
      className={cn(
        "border-border bg-surface-muted rounded-lg border px-4 py-3",
        className,
      )}
      aria-live="polite"
    >
      <p className="text-foreground text-sm font-medium">{summaryText}</p>
      <p className="text-muted-foreground text-xs">Total selections: {total}</p>
      {validationHint ? (
        <p className="text-danger mt-2 text-xs" role="alert">
          {validationHint}
        </p>
      ) : null}
    </div>
  );
}

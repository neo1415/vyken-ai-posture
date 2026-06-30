import { cn } from "@/lib/utils/cn";

export type ProgressIndicatorProps = {
  value: number;
  label?: string;
  className?: string;
};

function normalizeProgress(value: number): number {
  if (Number.isNaN(value) || !Number.isFinite(value)) {
    return 0;
  }
  return Math.min(100, Math.max(0, value));
}

export function ProgressIndicator({
  value,
  label = "Progress",
  className,
}: ProgressIndicatorProps) {
  const normalized = normalizeProgress(value);

  return (
    <div className={cn("w-full space-y-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground text-sm">{label}</span>
        <span className="text-foreground text-sm font-medium tabular-nums">
          {normalized}%
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={normalized}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="bg-surface-muted h-2 w-full overflow-hidden rounded-full"
      >
        <div
          className="bg-primary h-full rounded-full transition-[width] duration-300 ease-out"
          style={{ width: `${normalized}%` }}
        />
      </div>
    </div>
  );
}

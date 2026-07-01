/** Shared Tailwind/class maps for tool selector Vyken UI. */
export const vykenToolCheckboxCardClasses =
  "vyken-card-interactive group relative flex cursor-pointer flex-col gap-3 p-4 has-[:checked]:vyken-selected-card has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--focus-ring)] data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50";

export const vykenToolNativeControlClasses =
  "border-border text-primary size-4 shrink-0 accent-[var(--primary)]";

export const vykenCategoryFilterClasses =
  "rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1.5 text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]";

export const vykenCategoryFilterSelectedClasses =
  "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]";

export const vykenSearchInputClasses =
  "border-border bg-surface-muted text-foreground placeholder:text-muted-foreground w-full rounded-lg border px-4 py-2.5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]";

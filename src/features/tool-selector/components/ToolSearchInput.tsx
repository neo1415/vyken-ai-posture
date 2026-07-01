import { cn } from "@/lib/utils/cn";

import { TOOL_SELECTOR_COPY } from "../constants";
import { vykenSearchInputClasses } from "./tool-selector-ui";

export type ToolSearchInputProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function ToolSearchInput({
  id,
  value,
  onChange,
  className,
}: ToolSearchInputProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={id} className="text-foreground text-sm font-medium">
        {TOOL_SELECTOR_COPY.searchLabel}
      </label>
      <div className="relative">
        <input
          id={id}
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={TOOL_SELECTOR_COPY.searchPlaceholder}
          className={vykenSearchInputClasses}
          autoComplete="off"
        />
        {value.length > 0 ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 text-xs font-medium"
            aria-label="Clear search"
          >
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}

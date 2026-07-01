import { cn } from "@/lib/utils/cn";

import { TOOL_SELECTOR_COPY } from "../constants";
import {
  vykenToolCheckboxCardClasses,
  vykenToolNativeControlClasses,
} from "./tool-selector-ui";

export type NotSureToolCardProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function NotSureToolCard({ checked, onChange }: NotSureToolCardProps) {
  const inputId = "tool-not-sure";

  return (
    <label
      htmlFor={inputId}
      className={cn(
        vykenToolCheckboxCardClasses,
        checked && "vyken-selected-card",
      )}
    >
      <div className="flex items-start gap-3">
        <input
          id={inputId}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className={vykenToolNativeControlClasses}
        />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-foreground text-sm font-semibold">
            {TOOL_SELECTOR_COPY.notSureTitle}
          </p>
          <p className="text-muted-foreground text-xs leading-relaxed">
            {TOOL_SELECTOR_COPY.notSureHelper}
          </p>
        </div>
        {checked ? (
          <span
            className="text-primary shrink-0 text-xs font-semibold"
            aria-hidden="true"
          >
            Selected
          </span>
        ) : null}
      </div>
    </label>
  );
}

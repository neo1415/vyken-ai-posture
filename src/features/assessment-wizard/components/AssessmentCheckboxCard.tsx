import { cn } from "@/lib/utils/cn";

import {
  vykenAssessmentCheckboxCardClasses,
  vykenAssessmentNativeControlClasses,
} from "./assessment-wizard-ui";

export type AssessmentCheckboxCardProps = {
  id: string;
  name: string;
  value: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: string, checked: boolean) => void;
};

export function AssessmentCheckboxCard({
  id,
  name,
  value,
  label,
  description,
  checked,
  onChange,
}: AssessmentCheckboxCardProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        vykenAssessmentCheckboxCardClasses,
        checked && "vyken-selected-card",
      )}
    >
      <input
        id={id}
        type="checkbox"
        name={name}
        value={value}
        checked={checked}
        onChange={(event) => onChange(value, event.target.checked)}
        className={vykenAssessmentNativeControlClasses}
      />
      <span className="min-w-0 flex-1 space-y-1">
        <span className="text-foreground block text-sm leading-snug">
          {label}
        </span>
        {description ? (
          <span className="text-muted-foreground block text-xs leading-relaxed">
            {description}
          </span>
        ) : null}
      </span>
    </label>
  );
}

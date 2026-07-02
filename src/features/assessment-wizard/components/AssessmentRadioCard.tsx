import { cn } from "@/lib/utils/cn";

import {
  vykenAssessmentNativeControlClasses,
  vykenAssessmentRadioCardClasses,
} from "./assessment-wizard-ui";

export type AssessmentRadioCardProps = {
  id: string;
  name: string;
  value: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: string) => void;
};

export function AssessmentRadioCard({
  id,
  name,
  value,
  label,
  description,
  checked,
  onChange,
}: AssessmentRadioCardProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        vykenAssessmentRadioCardClasses,
        checked && "vyken-selected-card",
      )}
    >
      <input
        id={id}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
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

import { cn } from "@/lib/utils/cn";

import {
  vykenCheckboxCardClasses,
  vykenNativeControlClasses,
} from "./company-profile-ui";

export type CompanyProfileCheckboxCardProps = {
  id: string;
  name: string;
  value: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: string, checked: boolean) => void;
};

export function CompanyProfileCheckboxCard({
  id,
  name,
  value,
  label,
  checked,
  disabled = false,
  onChange,
}: CompanyProfileCheckboxCardProps) {
  return (
    <label
      htmlFor={id}
      data-disabled={disabled}
      className={cn(vykenCheckboxCardClasses, checked && "vyken-selected-card")}
    >
      <input
        id={id}
        type="checkbox"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(value, event.target.checked)}
        className={vykenNativeControlClasses}
      />
      <span className="text-foreground min-w-0 flex-1 text-sm leading-snug">
        {label}
      </span>
      {checked ? (
        <span
          className="text-primary shrink-0 text-xs font-semibold"
          aria-hidden="true"
        >
          ✓
        </span>
      ) : null}
    </label>
  );
}

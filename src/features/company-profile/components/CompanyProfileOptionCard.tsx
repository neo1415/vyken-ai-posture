import { cn } from "@/lib/utils/cn";

import {
  vykenNativeControlClasses,
  vykenOptionCardClasses,
} from "./company-profile-ui";

export type CompanyProfileOptionCardProps = {
  id: string;
  name: string;
  value: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: string) => void;
  className?: string;
};

export function CompanyProfileOptionCard({
  id,
  name,
  value,
  label,
  description,
  checked,
  onChange,
  className,
}: CompanyProfileOptionCardProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        vykenOptionCardClasses,
        checked && "vyken-selected-card",
        className,
      )}
    >
      <input
        id={id}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className={vykenNativeControlClasses}
      />
      <span className="min-w-0 flex-1">
        <span className="text-foreground block text-sm leading-snug font-medium">
          {label}
        </span>
        {description ? (
          <span className="text-muted-foreground mt-1 block text-xs leading-relaxed">
            {description}
          </span>
        ) : null}
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

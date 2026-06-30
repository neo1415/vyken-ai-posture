import { cn } from "@/lib/utils/cn";

import { FormError } from "./FormError";

const inputClasses =
  "border-border bg-surface text-foreground focus-visible:ring-focus-ring w-full rounded-lg border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none";

export type TextFieldProps = {
  id: string;
  name: string;
  label: string;
  defaultValue?: string;
  maxLength?: number;
  optional?: boolean;
  error?: string;
  autoComplete?: string;
};

export function TextField({
  id,
  name,
  label,
  defaultValue,
  maxLength,
  optional = false,
  error,
  autoComplete = "organization",
}: TextFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-foreground block text-sm font-medium">
        {label}
        {optional ? (
          <span className="text-muted-foreground ml-1 font-normal">
            (optional)
          </span>
        ) : null}
      </label>
      <input
        id={id}
        name={name}
        type="text"
        defaultValue={defaultValue}
        maxLength={maxLength}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(inputClasses, error && "border-danger")}
      />
      <FormError id={errorId} message={error} />
    </div>
  );
}

export type SelectFieldProps = {
  id: string;
  name: string;
  label: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  defaultValue?: string;
  required?: boolean;
  optional?: boolean;
  placeholder?: string;
  error?: string;
};

export function SelectField({
  id,
  name,
  label,
  options,
  defaultValue,
  required = false,
  optional = false,
  placeholder = "Select an option",
  error,
}: SelectFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-foreground block text-sm font-medium">
        {label}
        {optional ? (
          <span className="text-muted-foreground ml-1 font-normal">
            (optional)
          </span>
        ) : required ? (
          <span className="text-danger ml-1" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      <select
        id={id}
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(inputClasses, error && "border-danger")}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FormError id={errorId} message={error} />
    </div>
  );
}

export type OptionCardInputProps = {
  id: string;
  name: string;
  value: string;
  label: string;
  type: "radio" | "checkbox";
  defaultChecked?: boolean;
};

export function OptionCardInput({
  id,
  name,
  value,
  label,
  type,
  defaultChecked,
}: OptionCardInputProps) {
  return (
    <label
      htmlFor={id}
      className="border-border bg-surface hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-primary/10 flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition-colors"
    >
      <input
        id={id}
        type={type}
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="border-border text-primary mt-0.5 size-4 shrink-0 accent-[var(--primary)]"
      />
      <span className="text-foreground leading-snug">{label}</span>
    </label>
  );
}

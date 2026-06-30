import { cn } from "@/lib/utils/cn";

export type CompanyProfileSelectProps = {
  id: string;
  name?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: ReadonlyArray<{ value: string; label: string }>;
  required?: boolean;
  optional?: boolean;
  placeholder?: string;
  error?: string;
};

export function CompanyProfileSelect({
  id,
  name,
  label,
  value,
  onChange,
  options,
  required = false,
  optional = false,
  placeholder = "Select an option",
  error,
}: CompanyProfileSelectProps) {
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
        {...(name ? { name } : {})}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn("vyken-input", error && "vyken-input--error")}
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
      {error ? (
        <p id={errorId} role="alert" className="text-danger text-sm">
          {error}
        </p>
      ) : null}
    </div>
  );
}

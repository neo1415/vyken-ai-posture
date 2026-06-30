import { cn } from "@/lib/utils/cn";

export type CompanyProfileTextInputProps = {
  id: string;
  name?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  optional?: boolean;
  error?: string;
  placeholder?: string;
};

export function CompanyProfileTextInput({
  id,
  name,
  label,
  value,
  onChange,
  maxLength,
  optional = false,
  error,
  placeholder,
}: CompanyProfileTextInputProps) {
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
        {...(name ? { name } : {})}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={maxLength}
        placeholder={placeholder}
        autoComplete="organization"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn("vyken-input", error && "vyken-input--error")}
      />
      {error ? (
        <p id={errorId} role="alert" className="text-danger text-sm">
          {error}
        </p>
      ) : null}
    </div>
  );
}

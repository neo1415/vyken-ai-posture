import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export type FormErrorProps = {
  id?: string;
  message?: string;
  className?: string;
};

export function FormError({ id, message, className }: FormErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <p id={id} role="alert" className={cn("text-danger text-sm", className)}>
      {message}
    </p>
  );
}

export type FieldGroupErrorProps = {
  errors?: string[];
  id: string;
};

export function FieldGroupError({ errors, id }: FieldGroupErrorProps) {
  if (!errors?.length) {
    return null;
  }

  return (
    <div id={id} role="alert" className="text-danger space-y-1 text-sm">
      {errors.map((error) => (
        <p key={error}>{error}</p>
      ))}
    </div>
  );
}

export type FormAlertProps = {
  message?: string;
  children?: ReactNode;
};

export function FormAlert({ message, children }: FormAlertProps) {
  if (!message && !children) {
    return null;
  }

  return (
    <div
      role="alert"
      className="border-danger/40 bg-danger/10 text-foreground rounded-lg border px-4 py-3 text-sm"
    >
      {message ? <p>{message}</p> : null}
      {children}
    </div>
  );
}

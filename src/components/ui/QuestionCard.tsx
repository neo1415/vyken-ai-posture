import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./Card";

export type QuestionCardProps = {
  title: string;
  description?: string;
  helperText?: string;
  children?: ReactNode;
  required?: boolean;
  className?: string;
};

export function QuestionCard({
  title,
  description,
  helperText,
  children,
  required = false,
  className,
}: QuestionCardProps) {
  const titleId = title.replace(/\s+/g, "-").toLowerCase();

  return (
    <Card className={className} aria-labelledby={titleId}>
      <CardHeader>
        <CardTitle id={titleId}>
          {title}
          {required ? (
            <span className="text-danger ml-1" aria-hidden="true">
              *
            </span>
          ) : null}
          {required ? <span className="sr-only"> (required)</span> : null}
        </CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
        {helperText ? (
          <p className="text-muted-foreground border-border mt-2 border-l-2 pl-3 text-xs leading-relaxed">
            {helperText}
          </p>
        ) : null}
      </CardHeader>
      {children ? <CardContent>{children}</CardContent> : null}
    </Card>
  );
}

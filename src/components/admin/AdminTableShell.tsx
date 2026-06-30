import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

export type AdminTableShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
};

/**
 * Visual table wrapper for future admin views.
 * Not protected — admin authentication is implemented in a later module.
 */
export function AdminTableShell({
  title,
  description,
  children,
  actions,
  className,
}: AdminTableShellProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex-row items-start justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>
          {description ? (
            <CardDescription>{description}</CardDescription>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="border-border overflow-x-auto rounded-lg border">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

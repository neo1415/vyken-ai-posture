import type { ReactNode } from "react";

import { Badge } from "@/components/ui/Badge";
import { PageContainer } from "@/components/layout/PageContainer";
import { APP_NAME } from "@/lib/constants/app";
import { cn } from "@/lib/utils/cn";

type AdminShellProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Placeholder admin shell. Authentication and authorization are added in the admin module.
 */
export function AdminShell({ children, className }: AdminShellProps) {
  return (
    <div className={cn("bg-background flex min-h-screen flex-col", className)}>
      <header className="border-border bg-surface-elevated border-b">
        <PageContainer
          size="wide"
          className="flex items-center justify-between py-4"
        >
          <div>
            <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Admin placeholder
            </p>
            <h1 className="text-foreground text-lg font-semibold">
              {APP_NAME}
            </h1>
          </div>
          <Badge variant="warning" aria-label="Authentication status">
            Auth not implemented
          </Badge>
        </PageContainer>
      </header>

      <main className="flex-1 py-8 sm:py-10">
        <PageContainer size="wide">{children}</PageContainer>
      </main>
    </div>
  );
}

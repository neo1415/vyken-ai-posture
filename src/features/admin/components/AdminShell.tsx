import type { ReactNode } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { PageContainer } from "@/components/layout/PageContainer";
import { APP_NAME } from "@/lib/constants/app";
import { cn } from "@/lib/utils/cn";

type AdminShellProps = {
  children: ReactNode;
  className?: string;
};

export function AdminShell({ children, className }: AdminShellProps) {
  return (
    <div className={cn("bg-background flex min-h-screen flex-col", className)}>
      <header className="border-border bg-surface-elevated border-b">
        <PageContainer
          size="wide"
          className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Internal admin
            </p>
            <h1 className="text-foreground text-lg font-semibold">
              {APP_NAME}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <nav aria-label="Admin navigation" className="flex gap-4 text-sm">
              <Link
                href="/admin/leads"
                className="text-foreground hover:text-primary font-medium"
              >
                Leads
              </Link>
              <Link
                href="/admin/tools"
                className="text-foreground hover:text-primary font-medium"
              >
                Tools
              </Link>
            </nav>
            <Badge variant="warning">Temporary admin gate</Badge>
          </div>
        </PageContainer>
      </header>

      <main className="flex-1 py-8 sm:py-10">
        <PageContainer size="wide">{children}</PageContainer>
      </main>
    </div>
  );
}

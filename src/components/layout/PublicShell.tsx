import type { ReactNode } from "react";
import Link from "next/link";

import { PageContainer } from "@/components/layout/PageContainer";
import { cn } from "@/lib/utils/cn";

type PublicShellProps = {
  children: ReactNode;
  className?: string;
};

export function PublicShell({ children, className }: PublicShellProps) {
  return (
    <div className={cn("bg-background flex min-h-screen flex-col", className)}>
      <header className="border-border/60 bg-surface/90 border-b backdrop-blur-md">
        <PageContainer className="flex items-center justify-between py-4">
          <Link
            href="/"
            className="text-foreground text-xs font-bold tracking-[0.18em] uppercase sm:text-sm"
          >
            Vyken Security
          </Link>
          <nav aria-label="Public navigation">
            <ul className="flex items-center gap-4 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/ai-risk-assessment"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Assessment
                </Link>
              </li>
            </ul>
          </nav>
        </PageContainer>
      </header>

      <main className="flex-1 py-8 sm:py-12">
        <PageContainer>{children}</PageContainer>
      </main>

      <footer className="border-border bg-surface border-t">
        <PageContainer className="py-6">
          <p className="text-muted-foreground text-sm">
            Framework-informed assessment. Not legal advice or certification.
          </p>
        </PageContainer>
      </footer>
    </div>
  );
}

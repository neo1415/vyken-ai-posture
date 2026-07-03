import type { ReactNode } from "react";
import Link from "next/link";

import { AdminLogoutButton } from "@/features/admin-auth/components/AdminLogoutButton";
import type { AdminSessionView } from "@/features/admin-auth/types";
import { Badge } from "@/components/ui/Badge";
import { PageContainer } from "@/components/layout/PageContainer";
import { APP_NAME } from "@/lib/constants/app";
import { cn } from "@/lib/utils/cn";

type AdminNavLinkProps = {
  href: string;
  label: string;
  active?: boolean;
};

function AdminNavLink({ href, label, active }: AdminNavLinkProps) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "font-medium transition-colors",
        active ? "text-primary" : "text-foreground hover:text-primary",
      )}
    >
      {label}
    </Link>
  );
}

type AdminShellProps = {
  children: ReactNode;
  session: AdminSessionView;
  activePath?: string;
  className?: string;
};

export function AdminShell({
  children,
  session,
  activePath,
  className,
}: AdminShellProps) {
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
              <AdminNavLink
                href="/admin/leads"
                label="Leads"
                active={activePath?.startsWith("/admin/leads")}
              />
              <AdminNavLink
                href="/admin/tools"
                label="Tools"
                active={activePath?.startsWith("/admin/tools")}
              />
            </nav>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground hidden sm:inline">
                {session.email}
              </span>
              <Badge variant="secondary">{session.displayRole}</Badge>
              <AdminLogoutButton />
            </div>
          </div>
        </PageContainer>
      </header>

      <main className="flex-1 py-8 sm:py-10">
        <PageContainer size="wide">{children}</PageContainer>
      </main>
    </div>
  );
}

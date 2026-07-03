import type { ReactNode } from "react";

import { PageContainer } from "@/components/layout/PageContainer";
import { APP_NAME } from "@/lib/constants/app";

type AdminLoginLayoutProps = {
  children: ReactNode;
};

export default function AdminLoginLayout({ children }: AdminLoginLayoutProps) {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <header className="border-border border-b py-6">
        <PageContainer size="narrow">
          <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            {APP_NAME}
          </p>
          <h1 className="text-foreground mt-1 text-lg font-semibold">
            Admin sign in
          </h1>
        </PageContainer>
      </header>
      <main className="flex flex-1 items-center py-10">
        <PageContainer size="narrow">{children}</PageContainer>
      </main>
    </div>
  );
}

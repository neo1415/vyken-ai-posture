import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AdminShell } from "@/features/admin/components/AdminShell";
import { getAuthenticatedAdmin } from "@/server/admin/admin-auth";
import { toAdminSessionView } from "@/server/admin/admin-permissions";

type ProtectedAdminLayoutProps = {
  children: ReactNode;
};

export default async function ProtectedAdminLayout({
  children,
}: ProtectedAdminLayoutProps) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const headerStore = await headers();
  const pathname = headerStore.get("x-pathname") ?? "/admin";

  return (
    <AdminShell session={toAdminSessionView(admin)} activePath={pathname}>
      {children}
    </AdminShell>
  );
}

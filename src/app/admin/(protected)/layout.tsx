import type { ReactNode } from "react";
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

  return (
    <AdminShell session={toAdminSessionView(admin)}>{children}</AdminShell>
  );
}

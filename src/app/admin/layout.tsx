import type { ReactNode } from "react";

import { AdminShell } from "@/features/admin/components/AdminShell";

type AdminLayoutProps = {
  children: ReactNode;
};

/** Temporary admin gate — see docs/admin-dashboard/security-notes.md */
export default function AdminLayout({ children }: AdminLayoutProps) {
  return <AdminShell>{children}</AdminShell>;
}

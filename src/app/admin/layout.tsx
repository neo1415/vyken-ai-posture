import type { ReactNode } from "react";

import { AdminShell } from "@/components/layout/AdminShell";

type AdminLayoutProps = {
  children: ReactNode;
};

/** Admin auth and authorization are implemented in a dedicated future module. */
export default function AdminLayout({ children }: AdminLayoutProps) {
  return <AdminShell>{children}</AdminShell>;
}

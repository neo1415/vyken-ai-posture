import { redirect } from "next/navigation";

import { AdminAccessGate } from "@/features/admin/components/AdminAccessGate";
import { getAdminAccessFromRequest } from "@/server/admin/admin-access";

export default async function AdminHomePage() {
  const hasAccess = await getAdminAccessFromRequest();
  if (hasAccess) {
    redirect("/admin/leads");
  }

  return (
    <div className="space-y-6">
      <AdminAccessGate />
    </div>
  );
}

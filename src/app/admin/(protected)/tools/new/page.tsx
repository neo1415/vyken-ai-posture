import Link from "next/link";

import { AdminForbidden } from "@/features/admin/components/AdminForbidden";
import { ToolProfileForm } from "@/features/tool-admin/components/ToolProfileForm";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getAuthenticatedAdmin } from "@/server/admin/admin-auth";
import { canManageToolProfiles } from "@/server/admin/admin-permissions";
import { getAdminToolCategoryOptions } from "@/server/services/tool-admin.service";

export default async function AdminNewToolPage() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return null;
  }

  if (!canManageToolProfiles(admin)) {
    return (
      <AdminForbidden
        title="Cannot create tools"
        description="Your admin role can view tool profiles but cannot create new tools."
      />
    );
  }

  const categories = await getAdminToolCategoryOptions(admin);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <SectionHeader
          eyebrow="Admin"
          title="Add AI tool"
          description="Create a new tool with an initial draft profile."
        />
        <Link
          href="/admin/tools"
          className="text-primary text-sm font-medium hover:underline"
        >
          ← Back to tools
        </Link>
      </div>

      <ToolProfileForm mode="create" categories={categories} />
    </div>
  );
}

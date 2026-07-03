import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminForbidden } from "@/features/admin/components/AdminForbidden";
import { ToolProfileForm } from "@/features/tool-admin/components/ToolProfileForm";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getAuthenticatedAdmin } from "@/server/admin/admin-auth";
import { canManageToolProfiles } from "@/server/admin/admin-permissions";
import {
  getAdminToolCategoryOptions,
  getAdminToolDetailView,
} from "@/server/services/tool-admin.service";

type AdminToolEditPageProps = {
  params: Promise<{ toolSlug: string }>;
};

export default async function AdminToolEditPage({
  params,
}: AdminToolEditPageProps) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return null;
  }

  if (!canManageToolProfiles(admin)) {
    return (
      <AdminForbidden
        title="Cannot edit tools"
        description="Your admin role can view tool profiles but cannot edit them."
      />
    );
  }

  const { toolSlug } = await params;
  const [detail, categories] = await Promise.all([
    getAdminToolDetailView(toolSlug, admin),
    getAdminToolCategoryOptions(admin),
  ]);
  if (!detail) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <SectionHeader
          eyebrow="Edit tool"
          title={detail.name}
          description="Update tool metadata and profile fields. Saves as a draft."
        />
        <Link
          href={`/admin/tools/${detail.slug}`}
          className="text-primary text-sm font-medium hover:underline"
        >
          ← Back to detail
        </Link>
      </div>

      <ToolProfileForm mode="edit" categories={categories} detail={detail} />
    </div>
  );
}

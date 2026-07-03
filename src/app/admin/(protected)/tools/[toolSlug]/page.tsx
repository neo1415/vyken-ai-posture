import Link from "next/link";
import { notFound } from "next/navigation";

import { ToolProfileDetail } from "@/features/tool-admin/components/ToolProfileDetail";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getAuthenticatedAdmin } from "@/server/admin/admin-auth";
import {
  canManageToolProfiles,
  canPublishToolProfiles,
} from "@/server/admin/admin-permissions";
import { getAdminToolDetailView } from "@/server/services/tool-admin.service";

type AdminToolDetailPageProps = {
  params: Promise<{ toolSlug: string }>;
};

export default async function AdminToolDetailPage({
  params,
}: AdminToolDetailPageProps) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return null;
  }

  const { toolSlug } = await params;
  const detail = await getAdminToolDetailView(toolSlug, admin);
  if (!detail) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <SectionHeader
          eyebrow="Tool profile"
          title={detail.name}
          description={`Category: ${detail.category}`}
        />
        <Link
          href="/admin/tools"
          className="text-primary text-sm font-medium hover:underline"
        >
          ← Back to tools
        </Link>
      </div>

      <ToolProfileDetail
        detail={detail}
        canManageToolProfiles={canManageToolProfiles(admin)}
        canPublishToolProfiles={canPublishToolProfiles(admin)}
      />
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminAccessGate } from "@/features/admin/components/AdminAccessGate";
import { ToolProfileDetail } from "@/features/tool-admin/components/ToolProfileDetail";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getAdminAccessFromRequest } from "@/server/admin/admin-access";
import { getAdminToolDetailView } from "@/server/services/tool-admin.service";

type AdminToolDetailPageProps = {
  params: Promise<{ toolSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readAdminKey(
  searchParams: Record<string, string | string[] | undefined>,
): string | null {
  const value = searchParams.admin_key;
  return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
}

export default async function AdminToolDetailPage({
  params,
  searchParams,
}: AdminToolDetailPageProps) {
  const query = await searchParams;
  const adminKey = readAdminKey(query);
  const hasAccess = await getAdminAccessFromRequest({
    adminKey,
  });
  if (!hasAccess) {
    return <AdminAccessGate />;
  }

  const { toolSlug } = await params;
  const detail = await getAdminToolDetailView(toolSlug, { adminKey });
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

      <ToolProfileDetail detail={detail} />
    </div>
  );
}

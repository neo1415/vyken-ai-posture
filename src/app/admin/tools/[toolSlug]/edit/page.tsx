import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminAccessGate } from "@/features/admin/components/AdminAccessGate";
import { ToolProfileForm } from "@/features/tool-admin/components/ToolProfileForm";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getAdminAccessFromRequest } from "@/server/admin/admin-access";
import {
  getAdminToolCategoryOptions,
  getAdminToolDetailView,
} from "@/server/services/tool-admin.service";

type AdminToolEditPageProps = {
  params: Promise<{ toolSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readAdminKey(
  searchParams: Record<string, string | string[] | undefined>,
): string | null {
  const value = searchParams.admin_key;
  return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
}

export default async function AdminToolEditPage({
  params,
  searchParams,
}: AdminToolEditPageProps) {
  const query = await searchParams;
  const adminKey = readAdminKey(query);
  const hasAccess = await getAdminAccessFromRequest({
    adminKey,
  });
  if (!hasAccess) {
    return <AdminAccessGate />;
  }

  const { toolSlug } = await params;
  const access = { adminKey };
  const [detail, categories] = await Promise.all([
    getAdminToolDetailView(toolSlug, access),
    getAdminToolCategoryOptions(access),
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

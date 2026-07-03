import Link from "next/link";

import { AdminAccessGate } from "@/features/admin/components/AdminAccessGate";
import { ToolProfileForm } from "@/features/tool-admin/components/ToolProfileForm";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getAdminAccessFromRequest } from "@/server/admin/admin-access";
import { getAdminToolCategoryOptions } from "@/server/services/tool-admin.service";

type AdminNewToolPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readAdminKey(
  searchParams: Record<string, string | string[] | undefined>,
): string | null {
  const value = searchParams.admin_key;
  return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
}

export default async function AdminNewToolPage({
  searchParams,
}: AdminNewToolPageProps) {
  const params = await searchParams;
  const adminKey = readAdminKey(params);
  const hasAccess = await getAdminAccessFromRequest({
    adminKey,
  });
  if (!hasAccess) {
    return <AdminAccessGate />;
  }

  const categories = await getAdminToolCategoryOptions({ adminKey });

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

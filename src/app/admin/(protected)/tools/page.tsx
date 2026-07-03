import { Suspense } from "react";
import Link from "next/link";

import { ToolAdminFilters } from "@/features/tool-admin/components/ToolAdminFilters";
import { ToolAdminTable } from "@/features/tool-admin/components/ToolAdminTable";
import { parseToolAdminListSearchParams } from "@/features/tool-admin/validation";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getAuthenticatedAdmin } from "@/server/admin/admin-auth";
import { canManageToolProfiles } from "@/server/admin/admin-permissions";
import {
  getAdminToolCategoryOptions,
  getAdminToolsView,
} from "@/server/services/tool-admin.service";

type AdminToolsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminToolsPage({
  searchParams,
}: AdminToolsPageProps) {
  const params = await searchParams;
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return null;
  }

  const filters = parseToolAdminListSearchParams(params);
  const [result, categories] = await Promise.all([
    getAdminToolsView(filters, admin),
    getAdminToolCategoryOptions(admin),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <SectionHeader
          eyebrow="Admin"
          title="Tool profile admin"
          description="Review and manage AI tool profiles used by tool selection, scoring, and reports."
        />
        <Link
          href="/admin/leads"
          className="text-primary text-sm font-medium hover:underline"
        >
          ← Leads
        </Link>
      </div>

      <Suspense
        fallback={
          <p className="text-muted-foreground text-sm">Loading filters…</p>
        }
      >
        <ToolAdminFilters categories={categories} />
      </Suspense>

      <ToolAdminTable
        items={result.items}
        canManageToolProfiles={canManageToolProfiles(admin)}
      />

      {result.total === 0 ? (
        <EmptyState
          title="No tools found"
          description="Adjust filters or add a new tool profile."
        />
      ) : (
        <p className="text-muted-foreground text-sm">
          Showing {result.items.length} of {result.total} tools (page{" "}
          {result.page}).
        </p>
      )}
    </div>
  );
}

import { Suspense } from "react";

import { AdminAccessGate } from "@/features/admin/components/AdminAccessGate";
import { AdminLeadFilters } from "@/features/admin/components/AdminLeadFilters";
import { AdminLeadTable } from "@/features/admin/components/AdminLeadTable";
import { parseAdminLeadListSearchParams } from "@/features/admin/validation";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getAdminAccessFromRequest } from "@/server/admin/admin-access";
import { getAdminLeadsView } from "@/server/services/admin-dashboard.service";

type AdminLeadsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readAdminKey(
  searchParams: Record<string, string | string[] | undefined>,
): string | null {
  const value = searchParams.admin_key;
  return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
}

export default async function AdminLeadsPage({
  searchParams,
}: AdminLeadsPageProps) {
  const params = await searchParams;
  const hasAccess = await getAdminAccessFromRequest({
    adminKey: readAdminKey(params),
  });
  if (!hasAccess) {
    return <AdminAccessGate />;
  }

  const filters = parseAdminLeadListSearchParams(params);
  const result = await getAdminLeadsView(filters);

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Admin"
        title="Lead dashboard"
        description="Review captured assessment leads, scores, report status, and email delivery."
      />

      <Suspense
        fallback={
          <p className="text-muted-foreground text-sm">Loading filters…</p>
        }
      >
        <AdminLeadFilters />
      </Suspense>

      <AdminLeadTable items={result.items} />

      {result.total === 0 ? (
        <EmptyState
          title="No leads yet"
          description="Completed assessments with lead capture will appear here."
        />
      ) : (
        <p className="text-muted-foreground text-sm">
          Showing {result.items.length} of {result.total} leads (page{" "}
          {result.page}).
        </p>
      )}
    </div>
  );
}

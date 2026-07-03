import Link from "next/link";

import { AdminTableShell } from "@/components/admin/AdminTableShell";
import {
  formatAdminRiskLevel,
  formatEmailDeliveryStatus,
  formatReportStatus,
} from "@/features/admin/formatters";
import type { AdminLeadListItem } from "@/features/admin/types";
import { RiskChip } from "@/components/ui/RiskChip";
import { AdminLeadStatusChip } from "@/features/admin/components/AdminLeadStatusChip";

type AdminLeadTableProps = {
  items: AdminLeadListItem[];
};

export function AdminLeadTable({ items }: AdminLeadTableProps) {
  return (
    <AdminTableShell
      title="Assessment leads"
      description="Latest submissions first. Use filters to narrow results."
    >
      <table className="w-full min-w-[56rem] text-left text-sm">
        <thead className="bg-surface-muted text-muted-foreground border-border border-b">
          <tr>
            <th className="px-4 py-3 font-medium" scope="col">
              Submitted
            </th>
            <th className="px-4 py-3 font-medium" scope="col">
              Lead
            </th>
            <th className="px-4 py-3 font-medium" scope="col">
              Company
            </th>
            <th className="px-4 py-3 font-medium" scope="col">
              Score
            </th>
            <th className="px-4 py-3 font-medium" scope="col">
              Risk
            </th>
            <th className="px-4 py-3 font-medium" scope="col">
              Report
            </th>
            <th className="px-4 py-3 font-medium" scope="col">
              Email
            </th>
            <th className="px-4 py-3 font-medium" scope="col">
              Lead status
            </th>
            <th className="px-4 py-3 font-medium" scope="col">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td className="text-muted-foreground px-4 py-8" colSpan={9}>
                No leads match the current filters.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.publicToken} className="border-border border-b">
                <td className="px-4 py-3 whitespace-nowrap">
                  {new Date(item.submittedAt).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">{item.email}</div>
                  {item.name ? (
                    <div className="text-muted-foreground text-xs">
                      {item.name}
                    </div>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  {item.companyName ?? "—"}
                  {item.role ? (
                    <div className="text-muted-foreground text-xs">
                      {item.role}
                    </div>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  {item.overallScore != null ? item.overallScore : "—"}
                </td>
                <td className="px-4 py-3">
                  {item.riskLevel ? (
                    <RiskChip
                      level={
                        item.riskLevel as
                          "low" | "moderate" | "high" | "critical" | "unknown"
                      }
                      label={formatAdminRiskLevel(item.riskLevel)}
                    />
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3">
                  {formatReportStatus(item.reportStatus)}
                </td>
                <td className="px-4 py-3">
                  {formatEmailDeliveryStatus(item.emailDeliveryStatus)}
                </td>
                <td className="px-4 py-3">
                  <AdminLeadStatusChip status={item.leadStatus} />
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/leads/${item.publicToken}`}
                    className="text-primary font-medium hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </AdminTableShell>
  );
}

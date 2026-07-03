import { AdminTableShell } from "@/components/admin/AdminTableShell";
import { formatConfidenceLevel } from "@/features/tool-admin/formatters";
import { ToolProfileStatusChip } from "@/features/tool-admin/components/ToolProfileStatusChip";
import type { AdminToolProfileVersion } from "@/features/tool-admin/types";

type ToolProfileVersionTableProps = {
  versions: AdminToolProfileVersion[];
};

export function ToolProfileVersionTable({
  versions,
}: ToolProfileVersionTableProps) {
  return (
    <AdminTableShell
      title="Version history"
      description="All profile versions for this tool."
    >
      <table className="w-full min-w-[40rem] text-left text-sm">
        <thead className="bg-surface-muted text-muted-foreground border-border border-b">
          <tr>
            <th className="px-4 py-3 font-medium" scope="col">
              Version
            </th>
            <th className="px-4 py-3 font-medium" scope="col">
              Status
            </th>
            <th className="px-4 py-3 font-medium" scope="col">
              Confidence
            </th>
            <th className="px-4 py-3 font-medium" scope="col">
              Reviewed
            </th>
            <th className="px-4 py-3 font-medium" scope="col">
              Updated
            </th>
          </tr>
        </thead>
        <tbody>
          {versions.length === 0 ? (
            <tr>
              <td className="text-muted-foreground px-4 py-8" colSpan={5}>
                No profile versions yet.
              </td>
            </tr>
          ) : (
            versions.map((version) => (
              <tr key={version.versionLabel} className="border-border border-b">
                <td className="px-4 py-3 font-mono">{version.versionLabel}</td>
                <td className="px-4 py-3">
                  <ToolProfileStatusChip status={version.status} />
                </td>
                <td className="px-4 py-3">
                  {formatConfidenceLevel(version.confidenceLevel)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {version.lastReviewedAt
                    ? new Date(version.lastReviewedAt).toLocaleString()
                    : "—"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {version.updatedAt
                    ? new Date(version.updatedAt).toLocaleString()
                    : "—"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </AdminTableShell>
  );
}

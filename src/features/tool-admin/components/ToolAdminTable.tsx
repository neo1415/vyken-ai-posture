import Link from "next/link";

import { AdminTableShell } from "@/components/admin/AdminTableShell";
import {
  formatConfidenceLevel,
  formatPublishedStatus,
} from "@/features/tool-admin/formatters";
import { ToolProfileStatusChip } from "@/features/tool-admin/components/ToolProfileStatusChip";
import type { AdminToolListItem } from "@/features/tool-admin/types";

type ToolAdminTableProps = {
  items: AdminToolListItem[];
};

export function ToolAdminTable({ items }: ToolAdminTableProps) {
  return (
    <AdminTableShell
      title="AI tool profiles"
      description="Published profiles power public tool selection, scoring, and reports."
      actions={
        <Link
          href="/admin/tools/new"
          className="bg-primary text-primary-foreground inline-flex h-10 items-center rounded-lg px-4 text-sm font-medium hover:opacity-90"
        >
          Add tool
        </Link>
      }
    >
      <table className="w-full min-w-[56rem] text-left text-sm">
        <thead className="bg-surface-muted text-muted-foreground border-border border-b">
          <tr>
            <th className="px-4 py-3 font-medium" scope="col">
              Tool
            </th>
            <th className="px-4 py-3 font-medium" scope="col">
              Category
            </th>
            <th className="px-4 py-3 font-medium" scope="col">
              Status
            </th>
            <th className="px-4 py-3 font-medium" scope="col">
              Published
            </th>
            <th className="px-4 py-3 font-medium" scope="col">
              Confidence
            </th>
            <th className="px-4 py-3 font-medium" scope="col">
              Version
            </th>
            <th className="px-4 py-3 font-medium" scope="col">
              Updated
            </th>
            <th className="px-4 py-3 font-medium" scope="col">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td className="text-muted-foreground px-4 py-8" colSpan={8}>
                No tools match the current filters.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.slug} className="border-border border-b">
                <td className="px-4 py-3">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-muted-foreground font-mono text-xs">
                    {item.slug}
                  </div>
                </td>
                <td className="px-4 py-3">{item.category}</td>
                <td className="px-4 py-3">
                  <ToolProfileStatusChip status={item.status} />
                </td>
                <td className="px-4 py-3">
                  {formatPublishedStatus(item.publishedProfileStatus)}
                </td>
                <td className="px-4 py-3">
                  {formatConfidenceLevel(item.confidenceLevel)}
                </td>
                <td className="px-4 py-3">
                  {item.publishedVersionLabel ?? "—"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {item.lastUpdatedAt
                    ? new Date(item.lastUpdatedAt).toLocaleString()
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <Link
                      href={`/admin/tools/${item.slug}`}
                      className="text-primary font-medium hover:underline"
                    >
                      View
                    </Link>
                    <Link
                      href={`/admin/tools/${item.slug}/edit`}
                      className="text-primary font-medium hover:underline"
                    >
                      Edit
                    </Link>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </AdminTableShell>
  );
}

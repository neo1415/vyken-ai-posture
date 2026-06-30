import { AdminTableShell } from "@/components/admin/AdminTableShell";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeader } from "@/components/ui/SectionHeader";

export default function AdminPlaceholderPage() {
  return (
    <div className="space-y-10">
      <SectionHeader
        eyebrow="Admin"
        title="Lead dashboard"
        description="Design system preview only. This route is not protected. Authentication, lead data, and CRUD will be added in later modules."
      />

      <AdminTableShell
        title="Leads"
        description="Table shell for future lead management. No real data is shown."
        actions={<Badge variant="warning">Unauthenticated</Badge>}
      >
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead className="bg-surface-muted text-muted-foreground border-border border-b">
            <tr>
              <th className="px-4 py-3 font-medium" scope="col">
                Column
              </th>
              <th className="px-4 py-3 font-medium" scope="col">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-border border-b">
              <td className="text-muted-foreground px-4 py-8" colSpan={2}>
                No lead data — admin module not implemented.
              </td>
            </tr>
          </tbody>
        </table>
      </AdminTableShell>

      <EmptyState
        title="No leads to display"
        description="Lead intelligence will appear here after the assessment and admin modules are built. This is not a functional dashboard yet."
      />
    </div>
  );
}

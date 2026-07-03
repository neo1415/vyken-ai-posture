import { AdminTableShell } from "@/components/admin/AdminTableShell";
import {
  formatEmailDeliveryStatus,
  formatEmailEventType,
  truncateErrorMessage,
} from "@/features/admin/formatters";
import type { AdminLeadDetail } from "@/features/admin/types";

type AdminEmailEventsTableProps = {
  events: AdminLeadDetail["emailEvents"];
  emailDeliveryStatus: string;
};

export function AdminEmailEventsTable({
  events,
  emailDeliveryStatus,
}: AdminEmailEventsTableProps) {
  return (
    <AdminTableShell
      title="Email delivery"
      description={`Overall status: ${formatEmailDeliveryStatus(emailDeliveryStatus)}`}
    >
      <table className="w-full min-w-[40rem] text-left text-sm">
        <thead className="bg-surface-muted text-muted-foreground border-border border-b">
          <tr>
            <th className="px-4 py-3 font-medium" scope="col">
              Type
            </th>
            <th className="px-4 py-3 font-medium" scope="col">
              Recipient
            </th>
            <th className="px-4 py-3 font-medium" scope="col">
              Status
            </th>
            <th className="px-4 py-3 font-medium" scope="col">
              Provider
            </th>
            <th className="px-4 py-3 font-medium" scope="col">
              Sent at
            </th>
            <th className="px-4 py-3 font-medium" scope="col">
              Error
            </th>
          </tr>
        </thead>
        <tbody>
          {events.length === 0 ? (
            <tr>
              <td className="text-muted-foreground px-4 py-8" colSpan={6}>
                No email events recorded yet.
              </td>
            </tr>
          ) : (
            events.map((event, index) => (
              <tr
                key={`${event.type}-${event.sentAt ?? index}`}
                className="border-border border-b"
              >
                <td className="px-4 py-3">
                  {formatEmailEventType(event.type)}
                </td>
                <td className="px-4 py-3">{event.recipient}</td>
                <td className="px-4 py-3">{event.status}</td>
                <td className="px-4 py-3">{event.provider ?? "—"}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {event.sentAt ? new Date(event.sentAt).toLocaleString() : "—"}
                </td>
                <td className="text-muted-foreground px-4 py-3">
                  {truncateErrorMessage(event.errorMessage) ?? "—"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </AdminTableShell>
  );
}

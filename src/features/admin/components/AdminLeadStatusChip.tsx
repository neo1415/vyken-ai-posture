import { Badge } from "@/components/ui/Badge";
import { formatLeadStatus } from "@/features/admin/formatters";
import type { AdminLeadStatus } from "@/features/admin/constants";

type AdminLeadStatusChipProps = {
  status: string;
};

const statusVariant: Record<
  AdminLeadStatus,
  "default" | "secondary" | "success" | "warning" | "danger" | "info"
> = {
  new: "info",
  contacted: "secondary",
  qualified: "success",
  booked: "success",
  not_ready: "warning",
  closed: "default",
  ignore_spam: "danger",
};

export function AdminLeadStatusChip({ status }: AdminLeadStatusChipProps) {
  const variant =
    status in statusVariant
      ? statusVariant[status as AdminLeadStatus]
      : "secondary";

  return <Badge variant={variant}>{formatLeadStatus(status)}</Badge>;
}

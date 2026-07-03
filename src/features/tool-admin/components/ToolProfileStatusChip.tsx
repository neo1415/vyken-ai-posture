import { Badge } from "@/components/ui/Badge";
import { formatPublishedStatus } from "@/features/tool-admin/formatters";

type ToolProfileStatusChipProps = {
  status: string | null;
};

const variantMap: Record<
  string,
  "default" | "secondary" | "success" | "warning" | "outline"
> = {
  published: "success",
  draft: "warning",
  archived: "secondary",
  active: "success",
  inactive: "outline",
};

export function ToolProfileStatusChip({ status }: ToolProfileStatusChipProps) {
  const key = status ?? "unknown";
  const variant = variantMap[key] ?? "secondary";
  return <Badge variant={variant}>{formatPublishedStatus(status)}</Badge>;
}

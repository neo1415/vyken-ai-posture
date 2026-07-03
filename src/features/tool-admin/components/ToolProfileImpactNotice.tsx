import { TOOL_PROFILE_IMPACT_NOTICE } from "@/features/tool-admin/constants";

export function ToolProfileImpactNotice() {
  return (
    <div
      className="border-warning/40 bg-warning/10 text-foreground rounded-lg border p-4 text-sm"
      role="note"
    >
      {TOOL_PROFILE_IMPACT_NOTICE}
    </div>
  );
}

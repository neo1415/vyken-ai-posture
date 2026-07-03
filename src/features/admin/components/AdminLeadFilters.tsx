"use client";

import { useRouter, useSearchParams } from "next/navigation";

import {
  ADMIN_EMAIL_STATUS_FILTER_OPTIONS,
  ADMIN_LEAD_STATUS_OPTIONS,
  ADMIN_RISK_FILTER_OPTIONS,
} from "@/features/admin/constants";
import {
  formatEmailDeliveryStatus,
  formatLeadStatus,
} from "@/features/admin/formatters";
import { Button } from "@/components/ui/Button";

export function AdminLeadFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/admin/leads?${params.toString()}`);
  }

  return (
    <form
      className="grid gap-3 md:grid-cols-2 xl:grid-cols-5"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const params = new URLSearchParams();
        for (const [key, value] of formData.entries()) {
          if (typeof value === "string" && value.trim()) {
            params.set(key, value.trim());
          }
        }
        router.push(`/admin/leads?${params.toString()}`);
      }}
    >
      <label className="space-y-1 text-sm">
        <span className="text-muted-foreground font-medium">Search</span>
        <input
          name="search"
          defaultValue={searchParams.get("search") ?? ""}
          placeholder="Email, company, or name"
          maxLength={120}
          className="border-border bg-background text-foreground w-full rounded-lg border px-3 py-2"
        />
      </label>

      <label className="space-y-1 text-sm">
        <span className="text-muted-foreground font-medium">Risk level</span>
        <select
          name="riskLevel"
          defaultValue={searchParams.get("riskLevel") ?? ""}
          onChange={(event) => updateFilter("riskLevel", event.target.value)}
          className="border-border bg-background text-foreground w-full rounded-lg border px-3 py-2"
        >
          <option value="">All</option>
          {ADMIN_RISK_FILTER_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-1 text-sm">
        <span className="text-muted-foreground font-medium">Email status</span>
        <select
          name="emailStatus"
          defaultValue={searchParams.get("emailStatus") ?? ""}
          onChange={(event) => updateFilter("emailStatus", event.target.value)}
          className="border-border bg-background text-foreground w-full rounded-lg border px-3 py-2"
        >
          <option value="">All</option>
          {ADMIN_EMAIL_STATUS_FILTER_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {formatEmailDeliveryStatus(option)}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-1 text-sm">
        <span className="text-muted-foreground font-medium">Lead status</span>
        <select
          name="leadStatus"
          defaultValue={searchParams.get("leadStatus") ?? ""}
          onChange={(event) => updateFilter("leadStatus", event.target.value)}
          className="border-border bg-background text-foreground w-full rounded-lg border px-3 py-2"
        >
          <option value="">All</option>
          {ADMIN_LEAD_STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {formatLeadStatus(option)}
            </option>
          ))}
        </select>
      </label>

      <div className="flex items-end">
        <Button type="submit" variant="secondary">
          Apply filters
        </Button>
      </div>
    </form>
  );
}

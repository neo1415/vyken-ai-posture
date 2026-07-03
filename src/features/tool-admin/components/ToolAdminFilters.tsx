"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/Button";
import {
  CONFIDENCE_FILTER_OPTIONS,
  TOOL_STATUS_FILTER_OPTIONS,
} from "@/features/tool-admin/constants";
import { formatConfidenceLevel } from "@/features/tool-admin/formatters";
import type { AdminToolCategoryOption } from "@/features/tool-admin/types";

type ToolAdminFiltersProps = {
  categories: AdminToolCategoryOption[];
};

export function ToolAdminFilters({ categories }: ToolAdminFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

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
        router.push(`/admin/tools?${params.toString()}`);
      }}
    >
      <label className="space-y-1 text-sm">
        <span className="text-muted-foreground font-medium">Search</span>
        <input
          name="search"
          defaultValue={searchParams.get("search") ?? ""}
          placeholder="Name or slug"
          maxLength={120}
          className="border-border bg-background text-foreground w-full rounded-lg border px-3 py-2"
        />
      </label>

      <label className="space-y-1 text-sm">
        <span className="text-muted-foreground font-medium">Category</span>
        <select
          name="categorySlug"
          defaultValue={searchParams.get("categorySlug") ?? ""}
          className="border-border bg-background text-foreground w-full rounded-lg border px-3 py-2"
        >
          <option value="">All</option>
          {categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-1 text-sm">
        <span className="text-muted-foreground font-medium">Tool status</span>
        <select
          name="status"
          defaultValue={searchParams.get("status") ?? ""}
          className="border-border bg-background text-foreground w-full rounded-lg border px-3 py-2"
        >
          <option value="">All</option>
          {TOOL_STATUS_FILTER_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-1 text-sm">
        <span className="text-muted-foreground font-medium">Confidence</span>
        <select
          name="confidenceLevel"
          defaultValue={searchParams.get("confidenceLevel") ?? ""}
          className="border-border bg-background text-foreground w-full rounded-lg border px-3 py-2"
        >
          <option value="">All</option>
          {CONFIDENCE_FILTER_OPTIONS.map((level) => (
            <option key={level} value={level}>
              {formatConfidenceLevel(level)}
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

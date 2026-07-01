import { cn } from "@/lib/utils/cn";

import { TOOL_CATEGORY_FILTERS } from "../constants";
import type { ToolCategoryFilter } from "../types";
import {
  vykenCategoryFilterClasses,
  vykenCategoryFilterSelectedClasses,
} from "./tool-selector-ui";

export type ToolCategoryFiltersProps = {
  selected: ToolCategoryFilter;
  onChange: (category: ToolCategoryFilter) => void;
  className?: string;
};

export function ToolCategoryFilters({
  selected,
  onChange,
  className,
}: ToolCategoryFiltersProps) {
  return (
    <div
      className={cn("flex flex-wrap gap-2", className)}
      role="group"
      aria-label="Filter tools by category"
    >
      {TOOL_CATEGORY_FILTERS.map((filter) => {
        const isSelected = selected === filter.slug;
        return (
          <button
            key={filter.slug}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onChange(filter.slug)}
            className={cn(
              vykenCategoryFilterClasses,
              isSelected && vykenCategoryFilterSelectedClasses,
            )}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}

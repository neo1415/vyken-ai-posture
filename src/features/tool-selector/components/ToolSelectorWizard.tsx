"use client";

import { useActionState, useMemo, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import { LinkButton } from "@/components/ui/LinkButton";
import { FormAlert } from "@/features/company-profile/components/FormError";
import { submitToolSelection } from "@/features/tool-selector/actions";
import {
  MAX_SELECTED_KNOWN_TOOLS,
  TOOL_SELECTOR_COPY,
} from "@/features/tool-selector/constants";
import type {
  AssessmentToolOption,
  ToolCategoryFilter,
  ToolSelectorFormState,
  UnknownToolInput,
} from "@/features/tool-selector/types";
import { INITIAL_TOOL_SELECTOR_FORM_STATE } from "@/features/tool-selector/types";

import { NotSureToolCard } from "./NotSureToolCard";
import { SelectableToolCard } from "./SelectableToolCard";
import { ToolCategoryFilters } from "./ToolCategoryFilters";
import { ToolSearchInput } from "./ToolSearchInput";
import { ToolSelectionSummary } from "./ToolSelectionSummary";
import { ToolSelectorProgress } from "./ToolSelectorProgress";
import { UnknownToolFields } from "./UnknownToolFields";

export type ToolSelectorWizardProps = {
  sessionToken: string;
  tools: AssessmentToolOption[];
};

function matchesSearch(tool: AssessmentToolOption, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  const haystack = [
    tool.name,
    tool.categoryName,
    tool.shortDescription ?? "",
    ...tool.commonUseCases,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalized);
}

function matchesCategory(
  tool: AssessmentToolOption,
  category: ToolCategoryFilter,
): boolean {
  if (category === "all") {
    return true;
  }
  return tool.categorySlug === category;
}

function countFilledUnknownRows(rows: UnknownToolInput[]): number {
  return rows.filter((row) => row.name.trim().length > 0).length;
}

function validateClientSelection(input: {
  selectedSlugs: string[];
  notSure: boolean;
  unknownRows: UnknownToolInput[];
}): string | null {
  const unknownCount = countFilledUnknownRows(input.unknownRows);
  const hasSelection =
    input.selectedSlugs.length > 0 || input.notSure || unknownCount > 0;

  if (!hasSelection) {
    return "Select at least one tool, add an unknown tool, or choose Not sure.";
  }

  if (input.selectedSlugs.length > MAX_SELECTED_KNOWN_TOOLS) {
    return `Select up to ${MAX_SELECTED_KNOWN_TOOLS} known tools.`;
  }

  return null;
}

export function ToolSelectorWizard({
  sessionToken,
  tools,
}: ToolSelectorWizardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState<ToolCategoryFilter>("all");
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [notSure, setNotSure] = useState(false);
  const [unknownRows, setUnknownRows] = useState<UnknownToolInput[]>([]);
  const [clientError, setClientError] = useState<string | null>(null);

  const [formState, submitAction, isPending] = useActionState<
    ToolSelectorFormState,
    FormData
  >(submitToolSelection, INITIAL_TOOL_SELECTOR_FORM_STATE);

  const filteredTools = useMemo(
    () =>
      tools.filter(
        (tool) =>
          matchesCategory(tool, categoryFilter) &&
          matchesSearch(tool, searchQuery),
      ),
    [tools, categoryFilter, searchQuery],
  );

  const knownCount = selectedSlugs.length;
  const unknownCount = countFilledUnknownRows(unknownRows);
  const atKnownLimit = selectedSlugs.length >= MAX_SELECTED_KNOWN_TOOLS;

  const formError =
    clientError ??
    formState.fieldErrors?.form?.[0] ??
    (formState.status === "error" ? formState.message : undefined);

  function toggleTool(slug: string, checked: boolean) {
    setClientError(null);
    setSelectedSlugs((current) => {
      if (checked) {
        if (
          current.includes(slug) ||
          current.length >= MAX_SELECTED_KNOWN_TOOLS
        ) {
          return current;
        }
        return [...current, slug];
      }
      return current.filter((value) => value !== slug);
    });
  }

  const filledUnknownRows = useMemo(
    () => unknownRows.filter((row) => row.name.trim().length > 0),
    [unknownRows],
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const validationMessage = validateClientSelection({
      selectedSlugs,
      notSure,
      unknownRows,
    });

    if (validationMessage) {
      event.preventDefault();
      setClientError(validationMessage);
      return;
    }

    setClientError(null);
  }

  return (
    <form action={submitAction} onSubmit={handleSubmit} className="space-y-8">
      <ToolSelectorProgress />

      <ToolSearchInput
        id="tool-search"
        value={searchQuery}
        onChange={setSearchQuery}
      />

      <ToolCategoryFilters
        selected={categoryFilter}
        onChange={setCategoryFilter}
      />

      {tools.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          {TOOL_SELECTOR_COPY.emptyToolsMessage}
        </p>
      ) : filteredTools.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          {TOOL_SELECTOR_COPY.noSearchResults}
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filteredTools.map((tool) => (
            <SelectableToolCard
              key={tool.slug}
              tool={tool}
              checked={selectedSlugs.includes(tool.slug)}
              disabled={!selectedSlugs.includes(tool.slug) && atKnownLimit}
              onChange={toggleTool}
            />
          ))}
        </div>
      )}

      <NotSureToolCard checked={notSure} onChange={setNotSure} />

      <UnknownToolFields
        rows={unknownRows}
        onChange={setUnknownRows}
        fieldErrors={formState.fieldErrors}
      />

      <ToolSelectionSummary
        knownCount={knownCount}
        unknownCount={unknownCount}
        notSure={notSure}
        validationHint={formError}
      />

      {formState.status === "error" && formState.message && !clientError ? (
        <FormAlert message={formState.message} />
      ) : null}

      <input type="hidden" name="sessionToken" value={sessionToken} />
      <input type="hidden" name="notSure" value={notSure ? "true" : "false"} />
      <input
        type="hidden"
        name="unknownToolsJson"
        value={JSON.stringify(
          filledUnknownRows.map((row) => ({
            name: row.name.trim(),
            url: row.url.trim(),
          })),
        )}
        readOnly
      />
      {selectedSlugs.map((slug) => (
        <input
          key={slug}
          type="hidden"
          name="selectedToolSlugs"
          value={slug}
          readOnly
        />
      ))}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <LinkButton href="/ai-risk-assessment" variant="ghost" size="sm">
          {TOOL_SELECTOR_COPY.backLabel}
        </LinkButton>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : TOOL_SELECTOR_COPY.submitLabel}
        </Button>
      </div>
    </form>
  );
}

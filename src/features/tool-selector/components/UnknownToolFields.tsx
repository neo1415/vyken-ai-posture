import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

import {
  MAX_UNKNOWN_TOOLS,
  TOOL_SELECTOR_COPY,
  UNKNOWN_TOOL_NAME_MAX_LENGTH,
  UNKNOWN_TOOL_URL_MAX_LENGTH,
} from "../constants";
import type { ToolSelectorFieldErrors, UnknownToolInput } from "../types";
import { vykenSearchInputClasses } from "./tool-selector-ui";

export type UnknownToolFieldsProps = {
  rows: UnknownToolInput[];
  onChange: (rows: UnknownToolInput[]) => void;
  fieldErrors?: ToolSelectorFieldErrors;
  className?: string;
};

function fieldError(
  fieldErrors: ToolSelectorFieldErrors | undefined,
  index: number,
  field: "name" | "url",
): string | undefined {
  const key = `unknownTools.${index}.${field}` as keyof ToolSelectorFieldErrors;
  return fieldErrors?.[key]?.[0];
}

export function UnknownToolFields({
  rows,
  onChange,
  fieldErrors,
  className,
}: UnknownToolFieldsProps) {
  const canAdd = rows.length < MAX_UNKNOWN_TOOLS;

  function updateRow(index: number, patch: Partial<UnknownToolInput>) {
    onChange(
      rows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...patch } : row,
      ),
    );
  }

  function addRow() {
    if (!canAdd) {
      return;
    }
    onChange([...rows, { name: "", url: "" }]);
  }

  function removeRow(index: number) {
    onChange(rows.filter((_, rowIndex) => rowIndex !== index));
  }

  return (
    <div className={cn("vyken-card space-y-4 p-4 sm:p-6", className)}>
      <div className="space-y-1">
        <h2 className="text-foreground text-sm font-semibold">
          {TOOL_SELECTOR_COPY.unknownSectionTitle}
        </h2>
        <p className="text-muted-foreground text-xs">
          Add up to {MAX_UNKNOWN_TOOLS} tools not listed above.
        </p>
      </div>

      {rows.length === 0 ? (
        <Button type="button" variant="secondary" size="sm" onClick={addRow}>
          Add unknown tool
        </Button>
      ) : (
        <div className="space-y-4">
          {rows.map((row, index) => {
            const nameError = fieldError(fieldErrors, index, "name");
            const urlError = fieldError(fieldErrors, index, "url");
            const nameId = `unknown-tool-name-${index}`;
            const urlId = `unknown-tool-url-${index}`;

            return (
              <div
                key={`unknown-row-${index}`}
                className="border-border space-y-3 rounded-lg border p-4"
              >
                <div className="space-y-2">
                  <label htmlFor={nameId} className="text-foreground text-sm">
                    {TOOL_SELECTOR_COPY.unknownNameLabel}
                  </label>
                  <input
                    id={nameId}
                    type="text"
                    value={row.name}
                    maxLength={UNKNOWN_TOOL_NAME_MAX_LENGTH}
                    onChange={(event) =>
                      updateRow(index, { name: event.target.value })
                    }
                    className={vykenSearchInputClasses}
                    aria-invalid={Boolean(nameError)}
                    aria-describedby={nameError ? `${nameId}-error` : undefined}
                  />
                  {nameError ? (
                    <p id={`${nameId}-error`} className="text-danger text-xs">
                      {nameError}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label htmlFor={urlId} className="text-foreground text-sm">
                    {TOOL_SELECTOR_COPY.unknownUrlLabel}
                  </label>
                  <input
                    id={urlId}
                    type="url"
                    value={row.url}
                    maxLength={UNKNOWN_TOOL_URL_MAX_LENGTH}
                    onChange={(event) =>
                      updateRow(index, { url: event.target.value })
                    }
                    className={vykenSearchInputClasses}
                    aria-invalid={Boolean(urlError)}
                    aria-describedby={urlError ? `${urlId}-error` : undefined}
                    placeholder="https://"
                  />
                  {urlError ? (
                    <p id={`${urlId}-error`} className="text-danger text-xs">
                      {urlError}
                    </p>
                  ) : null}
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRow(index)}
                >
                  {TOOL_SELECTOR_COPY.removeUnknownLabel}
                </Button>
              </div>
            );
          })}

          {canAdd ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={addRow}
            >
              {TOOL_SELECTOR_COPY.addUnknownLabel}
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}

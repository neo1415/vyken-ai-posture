import { cn } from "@/lib/utils/cn";

import { RISK_RELEVANCE_TAGS } from "../constants";
import type { AssessmentToolOption } from "../types";
import {
  vykenToolCheckboxCardClasses,
  vykenToolNativeControlClasses,
} from "./tool-selector-ui";

export type SelectableToolCardProps = {
  tool: AssessmentToolOption;
  checked: boolean;
  disabled?: boolean;
  onChange: (slug: string, checked: boolean) => void;
};

function buildRelevanceTags(tool: AssessmentToolOption): string[] {
  const tags: string[] = [];
  if (tool.supportsFileUploads) {
    tags.push(RISK_RELEVANCE_TAGS.fileUploads);
  }
  if (tool.supportsMeetingTranscripts) {
    tags.push(RISK_RELEVANCE_TAGS.meetings);
  }
  if (tool.codingAssistantRelevance) {
    tags.push(RISK_RELEVANCE_TAGS.coding);
  }
  if (tool.agenticOrConnectedToolRelevance) {
    tags.push(RISK_RELEVANCE_TAGS.connected);
  }
  return tags;
}

export function SelectableToolCard({
  tool,
  checked,
  disabled = false,
  onChange,
}: SelectableToolCardProps) {
  const inputId = `tool-${tool.slug}`;
  const relevanceTags = buildRelevanceTags(tool);
  const useCases = tool.commonUseCases.slice(0, 3);

  return (
    <label
      htmlFor={inputId}
      data-disabled={disabled}
      className={cn(
        vykenToolCheckboxCardClasses,
        checked && "vyken-selected-card",
      )}
    >
      <div className="flex items-start gap-3">
        <input
          id={inputId}
          type="checkbox"
          name="toolOption"
          value={tool.slug}
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(tool.slug, event.target.checked)}
          className={vykenToolNativeControlClasses}
        />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-foreground text-sm font-semibold">
                {tool.name}
              </p>
              <p className="text-muted-foreground text-xs">
                {tool.categoryName}
              </p>
            </div>
            {checked ? (
              <span
                className="text-primary shrink-0 text-xs font-semibold"
                aria-hidden="true"
              >
                Selected
              </span>
            ) : null}
          </div>
          {tool.shortDescription ? (
            <p className="text-muted-foreground text-xs leading-relaxed">
              {tool.shortDescription}
            </p>
          ) : null}
          {useCases.length > 0 ? (
            <ul
              className="flex flex-wrap gap-1.5"
              aria-label="Common use cases"
            >
              {useCases.map((useCase) => (
                <li
                  key={useCase}
                  className="border-border bg-surface-muted text-muted-foreground rounded-full border px-2 py-0.5 text-[0.65rem]"
                >
                  {useCase}
                </li>
              ))}
            </ul>
          ) : null}
          {relevanceTags.length > 0 ? (
            <ul className="flex flex-wrap gap-1.5" aria-label="Risk relevance">
              {relevanceTags.map((tag) => (
                <li
                  key={tag}
                  className="border-primary/30 bg-primary/5 text-primary rounded-full border px-2 py-0.5 text-[0.65rem] font-medium"
                >
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </label>
  );
}

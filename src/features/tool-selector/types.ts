import type { ConfidenceLevel } from "@/features/tool-profiles/types";

/** Safe public tool profile shape passed to the client selector. */
export type AssessmentToolOption = {
  slug: string;
  name: string;
  categorySlug: string;
  categoryName: string;
  shortDescription?: string;
  commonUseCases: string[];
  supportsFileUploads: boolean | null;
  supportsMeetingTranscripts: boolean | null;
  codingAssistantRelevance: boolean | null;
  agenticOrConnectedToolRelevance: boolean | null;
  confidenceLevel: ConfidenceLevel;
};

export type ToolCategoryFilter =
  | "all"
  | "general_assistant"
  | "ai_search_research"
  | "workplace_copilot"
  | "coding_assistant"
  | "meeting_assistant"
  | "writing_productivity"
  | "design_media"
  | "automation_agent";

export type UnknownToolInput = {
  name: string;
  url: string;
};

export type ToolSelectorSubmissionInput = {
  sessionToken: string;
  selectedToolSlugs: string[];
  notSure: boolean;
  unknownTools: Array<{ name: string; url: string | null }>;
};

export type ToolSelectorFieldErrors = Partial<
  Record<
    | "sessionToken"
    | "selectedToolSlugs"
    | "notSure"
    | "unknownTools"
    | "form"
    | `unknownTools.${number}.name`
    | `unknownTools.${number}.url`,
    string[]
  >
>;

export type ToolSelectorFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: ToolSelectorFieldErrors;
};

export const INITIAL_TOOL_SELECTOR_FORM_STATE: ToolSelectorFormState = {
  status: "idle",
};

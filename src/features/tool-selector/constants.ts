import type { ToolCategoryFilter } from "./types";

export const MAX_SELECTED_KNOWN_TOOLS = 15;
export const MAX_UNKNOWN_TOOLS = 3;
export const UNKNOWN_TOOL_NAME_MAX_LENGTH = 80;
export const UNKNOWN_TOOL_URL_MAX_LENGTH = 240;

export const ASSESSMENT_TOTAL_STEPS = 5;
export const TOOL_SELECTOR_STEP_NUMBER = 2;

export const TOOL_SELECTOR_COPY = {
  brandLabel: "Vyken Security",
  freeToolLabel: "Free tool",
  progressLabel: "Your AI governance posture",
  pageTitle: "Which AI tools are used or being considered?",
  supportingCopy:
    'Select all that apply. If you are not sure what employees use, choose "Not sure" — that may itself indicate a visibility gap.',
  searchPlaceholder: "Search AI tools...",
  searchLabel: "Search AI tools",
  submitLabel: "Continue to usage questions",
  backLabel: "Back to company context",
  startOverLabel: "Start over",
  notSureTitle: "I'm not sure what employees use",
  notSureHelper: "This can indicate a Shadow AI visibility gap.",
  unknownSectionTitle: "Tool not listed?",
  unknownNameLabel: "Tool name",
  unknownUrlLabel: "Tool URL (optional)",
  addUnknownLabel: "Add another tool",
  removeUnknownLabel: "Remove",
  noSearchResults:
    "No matching tools. You can add it as an unknown tool below.",
  emptyToolsMessage:
    "No published tools are available right now. You can still add unknown tools or choose Not sure.",
} as const;

export const TOOL_CATEGORY_FILTERS: ReadonlyArray<{
  slug: ToolCategoryFilter;
  label: string;
}> = [
  { slug: "all", label: "All" },
  { slug: "general_assistant", label: "General assistants" },
  { slug: "ai_search_research", label: "AI search/research" },
  { slug: "workplace_copilot", label: "Workplace copilots" },
  { slug: "coding_assistant", label: "Coding assistants" },
  { slug: "meeting_assistant", label: "Meeting assistants" },
  { slug: "writing_productivity", label: "Writing/productivity" },
  { slug: "design_media", label: "Design/media" },
  { slug: "automation_agent", label: "Automation/agents" },
] as const;

export const RISK_RELEVANCE_TAGS = {
  fileUploads: "File uploads",
  meetings: "Meetings",
  coding: "Coding",
  connected: "Connected/agentic",
} as const;

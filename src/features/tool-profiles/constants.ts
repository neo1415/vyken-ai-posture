/** MVP tool slugs — keep in sync with seed data. */
export const MVP_TOOL_SLUGS = [
  "chatgpt",
  "claude",
  "google-gemini",
  "microsoft-copilot",
  "perplexity",
  "deepseek",
  "github-copilot",
  "cursor",
  "notion-ai",
  "grammarly",
  "otter",
  "fireflies",
  "fathom",
  "canva-ai",
  "zapier-ai",
] as const;

export type MvpToolSlug = (typeof MVP_TOOL_SLUGS)[number];

export const TOOL_CATEGORY_SLUGS = [
  "general_assistant",
  "ai_search_research",
  "workplace_copilot",
  "coding_assistant",
  "meeting_assistant",
  "writing_productivity",
  "design_media",
  "automation_agent",
  "unknown_other",
] as const;

export type ToolCategorySlug = (typeof TOOL_CATEGORY_SLUGS)[number];

export const CONFIDENCE_LEVELS = ["high", "medium", "low", "unknown"] as const;

export const PUBLISHED_STATUSES = ["draft", "published", "archived"] as const;

export const PROFILE_SOURCE_TYPES = [
  "official_vendor",
  "official_vendor_help",
  "official_vendor_legal",
  "official_vendor_trust",
  "reputable_reporting",
] as const;

export const SEED_REVIEWED_BY = "Vyken research seed" as const;

export const SEED_PROFILE_VERSION = "1.0" as const;

export const SEED_REVIEW_DATE = "2026-06-30" as const;

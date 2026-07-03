export const TOOL_ADMIN_MODULE_VERSION = "tool-admin-v1" as const;

export const TOOL_ADMIN_DEFAULT_PAGE = 1 as const;
export const TOOL_ADMIN_DEFAULT_LIMIT = 25 as const;
export const TOOL_ADMIN_MAX_LIMIT = 100 as const;
export const TOOL_ADMIN_MAX_SEARCH_LENGTH = 120 as const;

export const TOOL_NAME_MAX_LENGTH = 120 as const;
export const TOOL_SLUG_MAX_LENGTH = 80 as const;
export const TOOL_REVIEW_NOTES_MAX_LENGTH = 2000 as const;
export const TOOL_SOURCE_NOTES_MAX_LENGTH = 2000 as const;
export const TOOL_SUMMARY_MAX_LENGTH = 1000 as const;
export const TOOL_TEXT_FIELD_MAX_LENGTH = 4000 as const;
export const TOOL_URL_MAX_LENGTH = 500 as const;

export const TOOL_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const CONFIDENCE_FILTER_OPTIONS = [
  "high",
  "medium",
  "low",
  "unknown",
] as const;

export const TOOL_STATUS_FILTER_OPTIONS = ["active", "inactive"] as const;

export const INITIAL_PROFILE_VERSION = "1.0" as const;

export const TOOL_PROFILE_IMPACT_NOTICE =
  "Changes to published tool profiles may affect future assessments, scoring, reports, and admin views. Existing completed assessment snapshots should not be silently rewritten.";

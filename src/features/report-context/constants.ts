import type { ReportContextVersion } from "./types";

export const REPORT_CONTEXT_VERSION: ReportContextVersion = "report-context-v1";

export const MAX_REPORT_FINDINGS = 12 as const;

export const MAX_REPORT_RECOMMENDATIONS = 8 as const;

export const REPORT_POSITIVE_BANNED_PATTERNS = [
  /\byou are compliant\b/i,
  /\byou are non-compliant\b/i,
  /\bcertified\b/i,
  /\baudit passed\b/i,
  /\baudit failed\b/i,
  /\bguaranteed\b/i,
  /\bsafe to use\b/i,
  /\bunsafe to use\b/i,
  /\bbreach confirmed\b/i,
  /\bviolation confirmed\b/i,
] as const;

export const EMAIL_OUTSIDE_LEAD_PATTERN =
  /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;

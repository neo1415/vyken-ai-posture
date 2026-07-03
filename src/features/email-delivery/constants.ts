export const USER_REPORT_EMAIL_SUBJECT =
  "Your Vyken AI governance assessment report";

export const INTERNAL_NOTIFICATION_SUBJECT =
  "New AI governance assessment lead";

export const PDF_ATTACHMENT_FILENAME = "ai-governance-risk-report.pdf";

export const EMAIL_BANNED_CLAIM_PATTERNS = [
  /\bcompliant\b/i,
  /\bnon-compliant\b/i,
  /\bcertified\b/i,
  /\baudit passed\b/i,
  /\baudit failed\b/i,
  /\bguaranteed\b/i,
  /\bsafe to use\b/i,
  /\bunsafe to use\b/i,
  /\bbreach confirmed\b/i,
  /\bviolation confirmed\b/i,
] as const;

export const EMAIL_ALLOWED_DISCLAIMER =
  "not a legal opinion, audit, certification, or live technical scan";

export const UUID_PATTERN =
  /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;

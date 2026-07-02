export const PDF_REPORT_TITLE = "AI Governance Risk Assessment Report";

export const PDF_BRAND = {
  name: "Vyken Security",
  primary: "#00b4d8",
  accent: "#48cae4",
  background: "#0a0a0f",
  surface: "#141820",
  border: "#1e2a3a",
  text: "#f8fafc",
  muted: "#94a3b8",
  riskLow: "#22c55e",
  riskModerate: "#eab308",
  riskHigh: "#f97316",
  riskCritical: "#ef4444",
} as const;

export const PDF_PAGE = {
  size: "A4" as const,
  margin: 40,
  footerHeight: 28,
  headerHeight: 32,
};

export const PDF_FILE_PREFIX = "vyken-ai-risk-report";

export const PDF_POSITIVE_BANNED_PATTERNS = [
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

export const PDF_EXPECTED_HEADINGS = [
  "Executive Summary",
  "Company Context",
  "AI Tool Context",
  "Risk Score Summary",
  "Category Risk Breakdown",
  "Key Findings",
  "Recommended Next Steps",
  "Methodology",
  "Limitations and Caveats",
] as const;

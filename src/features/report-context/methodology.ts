export const REPORT_METHODOLOGY_STATEMENTS = [
  "This assessment uses a framework-informed scoring model based on user-provided answers about AI tool usage, data exposure, governance controls, visibility, and agentic/coding workflows.",
  "Signals are derived from structured assessment responses and curated tool profile metadata where available.",
  "Findings and recommendations summarize patterns suggested by the assessment; they should be validated internally before implementation.",
] as const;

export const REPORT_FRAMEWORKS_REFERENCED = [
  "NIST AI RMF (informed by)",
  "ISO/IEC 42001-style AI management system controls",
  "ISO/IEC 23894-style AI risk management thinking",
  "OWASP LLM Top 10-style application risk considerations",
  "EU AI Act-style risk lens",
  "Privacy and data protection principles",
] as const;

export const REPORT_LIMITATIONS = [
  "Based on answers provided by the respondent.",
  "Not a live technical scan.",
  "Not a legal opinion.",
  "Not an audit or certification.",
  "Tool observations depend on actual configuration, plan, and usage.",
  "Should be reviewed internally before being used for formal decisions.",
] as const;

export const REPORT_DATA_SOURCES = [
  "Self-reported company profile and assessment responses",
  "Selected AI tool profiles from the curated Vyken tool database",
  "Server-side scoring, signal, finding, and recommendation engines",
] as const;

export const REPORT_PRIMARY_DISCLAIMER =
  "This report is a framework-informed starting point based on the answers provided. It is not a legal opinion, audit, certification, or live technical scan.";

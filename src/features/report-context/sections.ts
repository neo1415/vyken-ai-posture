import type { ReportSection } from "./types";

export const REPORT_SECTION_DEFINITIONS: ReportSection[] = [
  {
    sectionId: "cover",
    title: "Cover",
    description: "Report title, organization context, and assessment date.",
    included: true,
    order: 1,
  },
  {
    sectionId: "executive_summary",
    title: "Executive summary",
    description: "Overall risk score, headline, and high-level explanation.",
    included: true,
    order: 2,
  },
  {
    sectionId: "company_context",
    title: "Company context",
    description: "Industry, size, region, and AI concern profile.",
    included: true,
    order: 3,
  },
  {
    sectionId: "ai_tool_context",
    title: "AI tool context",
    description: "Selected tools, categories, and profile confidence notes.",
    included: true,
    order: 4,
  },
  {
    sectionId: "risk_score_summary",
    title: "Risk score summary",
    description: "Overall score, risk level, and confidence.",
    included: true,
    order: 5,
  },
  {
    sectionId: "category_risk_breakdown",
    title: "Category risk breakdown",
    description: "Six category scores with explanations.",
    included: true,
    order: 6,
  },
  {
    sectionId: "key_findings",
    title: "Key findings",
    description: "Prioritized findings from the assessment.",
    included: true,
    order: 7,
  },
  {
    sectionId: "recommended_next_steps",
    title: "Recommended next steps",
    description: "Prioritized recommendations with implementation steps.",
    included: true,
    order: 8,
  },
  {
    sectionId: "methodology",
    title: "Methodology",
    description: "How the assessment and scoring model work.",
    included: true,
    order: 9,
  },
  {
    sectionId: "limitations_and_caveats",
    title: "Limitations and caveats",
    description: "Scope limits, disclaimers, and assumptions.",
    included: true,
    order: 10,
  },
];

export function getReportSections(): ReportSection[] {
  return REPORT_SECTION_DEFINITIONS.map((section) => ({ ...section }));
}

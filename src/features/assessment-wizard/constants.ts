import type { AssessmentSection } from "./types";

export const ASSESSMENT_TOTAL_STEPS = 5;
export const ASSESSMENT_WIZARD_PRODUCT_STEP = 3;

export const ASSESSMENT_WIZARD_COPY = {
  brandLabel: "Vyken Security",
  freeToolLabel: "Free tool",
  progressLabel: "Your AI governance posture",
  pageTitle: "Usage and data exposure",
  pageSubtitle:
    "Answer a few structured questions about how AI is used, what data may be involved, and what controls exist. Do not enter confidential information.",
  submitLabel: "Continue to results preview",
  backToToolsLabel: "Back to tool selection",
  startOverLabel: "Start assessment",
  nextLabel: "Continue",
  backLabel: "Back",
  sectionProgressLabel: "Section",
} as const;

export const ASSESSMENT_SECTIONS: AssessmentSection[] = [
  {
    id: "usage_context",
    title: "Usage context",
    description:
      "How AI tools are used today or being considered across your organization.",
  },
  {
    id: "data_exposure",
    title: "Data exposure",
    description:
      "What kinds of data may enter prompts, uploads, transcripts, or AI workspaces.",
  },
  {
    id: "governance_controls",
    title: "Governance controls",
    description:
      "Policies, approvals, and ownership that shape responsible AI use.",
  },
  {
    id: "visibility_auditability",
    title: "Visibility and enforcement",
    description:
      "Whether usage can be reviewed, logged, investigated, or controlled.",
  },
  {
    id: "agentic_coding",
    title: "Agentic and coding risk",
    description:
      "Additional questions when coding assistants, automation, or connected tools may be involved.",
  },
];

export const BASE_WIZARD_SECTION_IDS = [
  "usage_context",
  "data_exposure",
  "governance_controls",
  "visibility_auditability",
] as const;

export const AGENTIC_SECTION_ID = "agentic_coding" as const;

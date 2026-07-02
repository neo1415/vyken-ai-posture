export const MAX_FINDINGS_DISPLAY = 6 as const;

export const RESULT_PAGE_COPY = {
  brandLabel: "Vyken Security",
  resultLabel: "AI Governance Posture Result",
  pageTitle: "Your AI governance posture result",
  pageHelper:
    "Based on your answers, this assessment highlights where AI usage may create visibility, data exposure, governance, or agentic workflow risk.",
  primaryDisclaimer:
    "This is a framework-informed starting point, not a legal opinion, audit, or certification.",
  scoreCardTitle: "Risk score overview",
  categorySectionTitle: "Category scores",
  categorySectionHelper:
    "Scores reflect six risk dimensions informed by your answers and selected tools.",
  findingsSectionTitle: "Key findings",
  findingsSectionHelper:
    "These observations summarize patterns suggested by your assessment responses.",
  recommendationsSectionTitle: "Recommended next steps",
  recommendationsSectionHelper:
    "Prioritized actions that may help reduce identified risk areas. Validate internally before implementation.",
  caveatsSectionTitle: "Caveats and assumptions",
  nextStepTitle: "What comes next",
  nextStepBody:
    "Want a shareable report version? The report delivery step comes next.",
  missingSessionTitle: "Result not available",
  missingSessionBody:
    "We could not find a completed assessment for this link. Please start from the beginning.",
  startAssessmentLabel: "Start assessment",
  backToQuestionsLabel: "Back to assessment questions",
} as const;

export const RESULT_DISCLAIMERS = [
  "This assessment is a framework-informed starting point based on the answers provided. It is not a legal opinion, audit, certification, or live technical scan.",
  "Tool-related observations depend on reviewed public information and your organization's actual configuration, plan, and usage.",
  "Results reflect self-reported answers at the time of assessment and may change as policies, tools, or usage evolve.",
  "Lower confidence scores suggest limited visibility or incomplete information — treat recommendations as areas to validate internally.",
] as const;

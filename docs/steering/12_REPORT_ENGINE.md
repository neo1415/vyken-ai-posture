# 12 — Report Engine

## Purpose

Define how branded PDF reports are generated from structured context — not freeform AI generation.

## What it controls

- Report template structure
- `reportContext` object assembly
- PDF section ordering and content rules
- Free vs call-only value boundaries

## Generation principles

1. Reports built from **controlled templates** + **structured context object**.
2. Generation runs **server-side** only.
3. No unconstrained LLM narrative in MVP (templated strings + data interpolation).
4. User-provided text escaped/sanitized in PDF and email.
5. Report records store **snapshot** of context and tool profile versions.

## Report context object

```typescript
interface ReportContext {
  company_profile: CompanyProfile;
  selected_tools: ToolSnapshot[];
  tool_profile_versions: Record<tool_id, string>;
  answers: AnswerSnapshot[];
  signals: SignalSnapshot[];
  scores: ScoreSnapshot;
  maturity_stage: MaturityStage;
  top_risk_drivers: RiskDriver[];
  findings: Finding[];
  recommendations: RecommendationBlock[];
  framework_mappings: FrameworkMapping[];
  nist_action_plan: NistActionPlan;      // Govern/Map/Measure/Manage
  starter_policy_checklist: ChecklistItem[];
  vyken_ctas: CtaBlock[];
  disclaimer: DisclaimerBlock;
  generated_at: ISO8601;
  report_version: string;
}
```

Assembly order:

```
session data → signals → scores → findings → recommendations
  → framework mappings → NIST plan → checklist → CTAs → disclaimer
```

## PDF report sections (18)

| # | Section | Content source |
|---|---------|----------------|
| 1 | Cover page | Company name, date, Vyken branding, confidentiality note |
| 2 | Executive summary | Overall rating, maturity stage, top 3 drivers, 2-sentence overview |
| 3 | Company context | Profile fields (no sensitive free text) |
| 4 | Selected AI tools | Tool names, categories, confidence notes |
| 5 | Overall risk rating | Label + brief interpretation |
| 6 | Score breakdown | Component scores with plain-English explanations |
| 7 | Tool stack risk findings | Tool-related signals and findings |
| 8 | Data exposure findings | Data signals and taxonomy drivers |
| 9 | Governance maturity findings | Policy, ownership, vendor, human review gaps |
| 10 | Auditability/enforcement findings | Logging, enforcement, incident gaps |
| 11 | Agentic/coding/MCP risk note | **Conditional** — when agentic flag elevated/high |
| 12 | Framework-informed findings | Mapped findings per `03_FRAMEWORK_MAPPING.md` |
| 13 | NIST Govern/Map/Measure/Manage action plan | Prioritized actions from controls library |
| 14 | Starter AI policy checklist | 8–12 checklist items from `06_CONTROL_LIBRARY.md` |
| 15 | Recommended next steps | Top recommendations with actions |
| 16 | Where Vyken Guard fits | Sales bridge — visibility, enforcement, audit evidence |
| 17 | CTA links | Book call, Guard, registration — tracked URLs |
| 18 | Disclaimer | Not legal advice, not certification, self-reported, point-in-time |

## Free report value (included)

- Risk rating and breakdown
- Gap findings by category
- Recommended controls and actions
- NIST-style action plan
- Starter policy checklist
- Framework-informed findings (educational)

## Call-only value (not in free report)

- Full custom AI policy document
- Full implementation roadmap
- Full vendor review per tool
- Full ISO 42001 readiness audit
- Full legal/regulatory analysis
- Full agentic/MCP security review
- Vyken Guard deployment plan

## Report access security

- Reports accessed via **unguessable token** (not sequential ID in URL).
- Token expires per retention policy (configurable).
- Admin may access via authenticated session.
- PDF stored in secure object storage or generated on-demand from snapshot.

## Tool profile in reports

- Show tool name, category, use-case notes, confidence level.
- Include: "Profile version X reviewed on [date]" when available.
- Low/unknown confidence: "Recommend internal vendor review."

## Do / Do not

**Do:**
- Snapshot `report_context` JSON at generation time.
- Use same context for email HTML summary and PDF body.
- Include disclaimer on cover and final page.

**Do not:**
- Generate unique legal conclusions per user via LLM.
- Include full recommendation library if it duplicates consulting IP.
- Embed service keys or internal admin URLs in PDFs.

## Acceptance criteria

- All 18 sections render for a complete assessment.
- Section 11 omitted when agentic flag is `none`.
- Report regeneration from snapshot produces identical output.
- Disclaimer uses approved wording from `01_PROJECT_BRIEF.md`.

## Related documents

- [03_FRAMEWORK_MAPPING.md](./03_FRAMEWORK_MAPPING.md)
- [06_CONTROL_LIBRARY.md](./06_CONTROL_LIBRARY.md)
- [11_RECOMMENDATION_LIBRARY.md](./11_RECOMMENDATION_LIBRARY.md)
- [13_DATABASE_SCHEMA_PLAN.md](./13_DATABASE_SCHEMA_PLAN.md)
- [15_SECURITY_STANDARD.md](./15_SECURITY_STANDARD.md)

# 10 — Scoring Model

## Purpose

Define how risk signals and company context produce scores, ratings, maturity stages, and lead qualification — with non-averaging escalation logic.

## What it controls

- `scoringService` implementation
- `assessment_scores` table fields
- Result page and PDF score display
- Lead qualification for admin

## Scoring components

| Component | Weight (baseline) | Description |
|-----------|-------------------|-------------|
| Overall AI Governance Risk | Composite | Top-level rating; not simple average |
| Tool Stack Risk | 15% input | Tool categories, unknown tools, profile confidence |
| Data Exposure Risk | 30% input | Sensitive data types, uploads, transcripts, secrets |
| Governance Maturity Gap | 25% input | Policy, ownership, approved tools, vendor/human review |
| Auditability/Enforcement Gap | 25% input | Logging, enforcement, incidents |
| Agentic/Coding Risk Flag | Modifier (separate) | Flag + dedicated report section; not buried |
| Internal Lead Qualification Score | Admin only | Sales priority 0–100 |

Weights inform baseline calculation; **escalation rules override** naive averaging.

## Rating labels

| Label | Meaning |
|-------|---------|
| **Low** | Limited sensitive exposure; reasonable controls for context |
| **Moderate** | Notable gaps; some sensitive use without full controls |
| **High** | Significant gaps with sensitive data or weak governance |
| **Critical** | Severe combination: regulated data + weak controls + personal accounts or agentic risk |
| **Unknown / Insufficient Information** | Too many "not sure" answers to rate confidently |

## Maturity stages (derived)

| Stage | Name | Typical signal pattern |
|-------|------|------------------------|
| 1 | Unknown / Unmapped | `unknown_ai_usage` dominant |
| 2 | Informal Usage | Tools in use, weak policy |
| 3 | Policy-Only | Draft/approved policy, no audit/enforcement |
| 4 | Managed Governance | Policy + vendor review + partial audit |
| 5 | Enforced & Auditable | Policy + logs + enforcement signals |

## Non-averaging logic (mandatory)

1. **Do not simple-average away critical risks.** One critical driver can elevate overall rating.
2. **Sensitive data + personal accounts + no audit logs** → minimum **High**, often **Critical** in regulated industries.
3. **Agentic/coding risks** → separate flag; dedicated report note even if overall is Moderate.
4. **Unknown tool + sensitive data** → increase caution; cap confidence — may yield **Unknown** overall.
5. **Regulated industry + weak controls** → apply industry modifier (+1 severity band).
6. **Large company (1,001+) + low maturity** → escalate more than small company with same gaps (`large_company_low_maturity`).

### Escalation algorithm (conceptual)

```
base_scores = weighted components
overall = max(base_composite, escalation_floor)
if critical_combo_detected: overall = max(overall, HIGH)
if severe_combo_detected: overall = CRITICAL
if insufficient_answers > threshold: overall = UNKNOWN
agentic_flag = separate boolean + severity
```

## Agentic/coding risk flag

Independent of overall numeric score:

- **Triggered by:** `coding_assistant_usage`, `mcp_usage`, `agent_command_execution`, `agent_file_access`, `secrets_exposure` + coding
- **Levels:** none / elevated / high
- **Report:** Always include Section 11 when elevated or high

## Lead qualification score (internal)

Factors increasing score:

- Critical/High overall rating
- Regulated industry
- Large company size
- Multiple sensitive data signals
- No enforcement + no audit logs
- Agentic flag high
- CTA clicks (post-assessment)

Not shown to public users in MVP.

## Scoring test scenarios

| # | Scenario | Expected overall | Notes |
|---|----------|-------------------|-------|
| 1 | Small marketing team, public content only, company accounts, basic policy | Low | Baseline low risk |
| 2 | Insurance company, claims documents, personal accounts | High–Critical | Regulated + sensitive data |
| 3 | Fintech, KYC/financial records, no policy | Critical | `regulated_industry` escalation |
| 4 | Healthcare, patient data, draft policy only | Critical | Health data escalation |
| 5 | SaaS, Cursor, source code, no review gate | High + agentic elevated | Separate coding flag |
| 6 | Legal firm, contracts, mixed accounts | High | Legal data + account risk |
| 7 | Large enterprise (5,000+), no policy, no visibility | High–Critical | `large_company_low_maturity` |
| 8 | Enterprise accounts, logs, policy, vendor review | Low–Moderate | Stage 4–5 maturity |
| 9 | Unknown tool + sensitive customer data | High or Unknown | Caution + insufficient vendor info |
| 10 | Coding agent, repo/command access, no code review | High + agentic high | Dedicated report section |

## Score persistence

Store per session:

```typescript
{
  overall_rating: 'low' | 'moderate' | 'high' | 'critical' | 'unknown';
  tool_stack_score: number;
  data_exposure_score: number;
  governance_gap_score: number;
  auditability_gap_score: number;
  agentic_risk_flag: 'none' | 'elevated' | 'high';
  maturity_stage: 1 | 2 | 3 | 4 | 5;
  lead_qualification_score: number;
  top_risk_drivers: string[];  // signal or taxonomy IDs
  scoring_version: string;     // for reproducibility
}
```

## Do / Do not

**Do:**
- Version scoring logic (`scoring_version`).
- Unit test all 10 scenarios above.
- Recompute on server for every final submission.

**Do not:**
- Trust client-submitted `overall_rating`.
- Hide agentic risk inside tool stack average only.
- Use floating scores in user-facing UI without label mapping.

## Acceptance criteria

- All 10 test scenarios pass automated tests.
- Escalation rules documented in code comments referencing this doc.
- Result page shows overall + breakdown + agentic flag when applicable.

## Related documents

- [09_SIGNAL_MAPPING.md](./09_SIGNAL_MAPPING.md)
- [05_RISK_TAXONOMY.md](./05_RISK_TAXONOMY.md)
- [12_REPORT_ENGINE.md](./12_REPORT_ENGINE.md)

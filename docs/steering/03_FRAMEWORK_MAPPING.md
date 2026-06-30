# 03 — Framework Mapping

## Purpose

Define how recognized AI governance and security frameworks inform questions, scoring, recommendations, and reports — without overclaiming compliance or certification.

## What it controls

- Framework references in UI, PDF, and recommendations
- Allowed and forbidden wording
- Mapping tables from findings to framework lenses

## Framework usage

### 1. NIST AI RMF

| Function | Product use |
|----------|-------------|
| **Govern** | Ownership, policy, accountability questions; Govern action plan items |
| **Map** | Tool inventory, data flow, use-case identification in assessment |
| **Measure** | Scoring, risk signals, maturity staging |
| **Manage** | Recommendations, controls, enforcement/auditability gaps |

### 2. ISO/IEC 42001-style thinking

- AI management system maturity (policy → monitoring → improvement)
- Governance ownership and roles
- Documented AI policy and acceptable use
- Risk management integration
- Monitoring and review cycles
- Continual improvement in recommendations

### 3. ISO/IEC 23894-style risk thinking

- Risk identification (tools, data, use cases)
- Risk analysis (severity, likelihood proxies via signals)
- Risk evaluation (scoring bands, escalation rules)
- Risk treatment (recommended controls from `06_CONTROL_LIBRARY.md`)
- Monitoring (auditability, logging, enforcement gaps)

### 4. EU AI Act-style risk lens

| Lens | Assessment application |
|------|------------------------|
| Unacceptable/prohibited-style concerns | Flag regulated decision risk, sensitive biometric/social scoring proxies via data + use-case questions |
| High-risk use cases | Healthcare, finance, insurance, legal + sensitive data combinations |
| Limited risk / transparency | Meeting transcripts, customer-facing AI outputs |
| Lower risk | Public content, marketing drafts with no sensitive data |

**Never** output "high-risk AI system under EU AI Act" as a legal classification.

### 5. OWASP LLM Top 10

| Category | Product mapping |
|----------|-----------------|
| Prompt injection | Agentic/coding risk section; connected tool permissions |
| Sensitive information disclosure | Data exposure questions; personal accounts + sensitive data |
| Insecure output handling | Human review gap; decision-influence questions |
| Supply chain concerns | Vendor review gap; unknown tool risk |
| Excessive agency | MCP, command execution, connected API/database access |

### 6. Privacy / data protection principles

- Personal and sensitive data identification in questions
- Data minimization in recommended actions
- Purpose limitation in usage context questions
- Retention and deletion uncertainty in tool profiles
- Automated decision-making sensitivity
- Audit evidence for governance reporting

## Wording rules

### Allowed phrases

- "Framework-informed"
- "Mapped to"
- "Uses risk concepts from"
- "Inspired by recognized governance/security frameworks"
- "Aligned with common themes from NIST AI RMF"
- "Informed by ISO/IEC 42001-style AI management thinking"

### Forbidden phrases

- "NIST certified"
- "ISO compliant" / "ISO 42001 certified"
- "EU AI Act compliant"
- "Legal certification"
- "Full audit"
- "Official compliance report"
- "Approved by [framework body]"

## Example framework mapping table

| Risk finding | Framework lens | Product recommendation |
|--------------|----------------|------------------------|
| Personal AI accounts with customer data | NIST Govern + OWASP LLM sensitive disclosure + Privacy minimization | Restrict personal accounts; require company-managed accounts; define sensitive data rules |
| No AI policy, informal usage | ISO 42001-style policy + NIST Govern | Assign owner; draft acceptable use policy; define approved tools |
| Source code in coding assistant, no review gate | OWASP supply chain + NIST Map/Manage | Map dev AI workflows; require human review for sensitive repos |
| Meeting transcripts in AI tools | Privacy purpose limitation + EU transparency lens | Define transcript handling rules; restrict sensitive meetings |
| No audit logs for AI usage | NIST Measure/Manage + ISO monitoring | Implement usage logging; retention for audit evidence |
| Agent with file/command access | OWASP excessive agency | Review connected permissions; limit autonomous actions |

## Where frameworks appear

1. Landing page trust line (light touch)
2. Question helper text (selected questions)
3. PDF framework-informed findings section
4. NIST Govern/Map/Measure/Manage action plan
5. Recommendation `framework_mapping` field
6. Disclaimer (not certification)

## Do / Do not

**Do:**
- Tie each major finding to 1–3 framework lenses in reports.
- Use frameworks to educate and prioritize, not to certify.

**Do not:**
- Imply regulatory compliance or legal adequacy.
- Name specific EU AI Act articles as binding conclusions.
- Present OWASP mappings as penetration test results.

## Acceptance criteria

- All report framework sections use allowed wording only.
- Legal/compliance review can find no certification claims in templates.
- Each recommendation block includes `framework_mapping` referencing at least one lens.

## Related documents

- [05_RISK_TAXONOMY.md](./05_RISK_TAXONOMY.md)
- [06_CONTROL_LIBRARY.md](./06_CONTROL_LIBRARY.md)
- [11_RECOMMENDATION_LIBRARY.md](./11_RECOMMENDATION_LIBRARY.md)
- [12_REPORT_ENGINE.md](./12_REPORT_ENGINE.md)

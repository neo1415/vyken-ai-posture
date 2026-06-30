# 05 — Risk Taxonomy

## Purpose

Define the canonical risk categories used across signals, findings, recommendations, and reports.

## What it controls

- Risk signal naming alignment
- Finding categories in PDF report
- Recommendation trigger vocabulary
- Vyken CTA directions per risk type

## Risk categories

### Shadow AI

- **Meaning:** AI tools used without organizational awareness or approval.
- **Why it matters:** Unknown usage prevents policy, logging, and vendor review.
- **Trigger signals:** `unknown_ai_usage`, `unapproved_tools`, "not sure" on tool selection
- **Recommendation direction:** AI tool inventory, visibility assessment
- **Vyken CTA:** Review AI visibility options

### Personal account risk

- **Meaning:** Employees use personal AI accounts for work.
- **Why it matters:** No enterprise controls, retention, or audit trail.
- **Trigger signals:** `personal_ai_accounts`, `mixed_account_usage`
- **Recommendation direction:** Restrict personal accounts; require company-managed accounts
- **Vyken CTA:** Enforcement and account governance

### Sensitive data exposure

- **Meaning:** Customer, employee, financial, health, or regulated data may enter AI tools.
- **Why it matters:** Disclosure, retention, and training-use uncertainty.
- **Trigger signals:** `sensitive_customer_data`, `employee_data`, `financial_data`, `health_data`, `claims_kyc_identity_data`
- **Recommendation direction:** Data classification rules for AI; redaction/blocking
- **Vyken CTA:** Data exposure controls

### Prompt/upload exposure

- **Meaning:** Sensitive content pasted into prompts or chat sessions.
- **Why it matters:** Harder to control than structured uploads; easy to leak.
- **Trigger signals:** Sensitive data signals + usage context "drafting/research"
- **Recommendation direction:** Prompt hygiene training; DLP-style controls
- **Vyken CTA:** Redaction and blocking

### File upload risk

- **Meaning:** Documents uploaded to AI tools or workspaces.
- **Why it matters:** Bulk data exposure; retention on vendor systems.
- **Trigger signals:** `file_uploads_enabled` + sensitive data signals
- **Recommendation direction:** Upload restrictions; approved tools only
- **Vyken CTA:** Policy enforcement

### Meeting transcript risk

- **Meaning:** Recordings or transcripts processed by AI meeting tools.
- **Why it matters:** Unintended capture of confidential discussions.
- **Trigger signals:** `meeting_transcript_exposure`
- **Recommendation direction:** Transcript handling policy; meeting-type rules
- **Vyken CTA:** Visibility into meeting AI usage

### Source code/secrets risk

- **Meaning:** Code, logs, API keys, or tokens enter AI coding tools.
- **Why it matters:** IP loss, credential exposure, supply chain risk.
- **Trigger signals:** `source_code_exposure`, `secrets_exposure`, `secrets_or_logs_exposure`
- **Recommendation direction:** Dev AI guardrails; secrets scanning; repo restrictions
- **Vyken CTA:** Coding assistant governance review

### Vendor/privacy risk

- **Meaning:** Unclear vendor data handling, retention, training use, subprocessors.
- **Why it matters:** Third-party risk and privacy obligations.
- **Trigger signals:** `no_vendor_review`, low-confidence tool profiles
- **Recommendation direction:** Vendor due diligence checklist
- **Vyken CTA:** Request vendor review consultation

### Data retention/training-use uncertainty

- **Meaning:** Organization unsure whether data is retained or used for training.
- **Why it matters:** Compliance and contractual exposure.
- **Trigger signals:** "Not sure" on data questions + tools with unknown profile confidence
- **Recommendation direction:** Review vendor terms; enterprise agreements
- **Vyken CTA:** Vendor review

### Governance ownership gap

- **Meaning:** No designated AI governance owner.
- **Why it matters:** No accountability for policy, incidents, or improvements.
- **Trigger signals:** `no_ai_owner`
- **Recommendation direction:** Assign AI governance owner (AI-GOV-001)
- **Vyken CTA:** Governance consultation

### Policy gap

- **Meaning:** No approved AI usage policy or only draft policy.
- **Why it matters:** Employees lack clear rules; inconsistent behavior.
- **Trigger signals:** `no_ai_policy`, `draft_policy_only`
- **Recommendation direction:** Create/update AI acceptable use policy
- **Vyken CTA:** Starter policy → full policy on call

### Approved tool list gap

- **Meaning:** No maintained list of approved AI tools.
- **Why it matters:** Shadow AI and inconsistent vendor review.
- **Trigger signals:** `no_approved_tool_list`, `unapproved_tools`
- **Recommendation direction:** Maintain approved AI tool list (AI-GOV-002)
- **Vyken CTA:** Tool governance

### Human review gap

- **Meaning:** No human review for sensitive or high-impact AI outputs.
- **Why it matters:** Insecure output handling; regulated decision risk.
- **Trigger signals:** `no_human_review` + decision-influence answers
- **Recommendation direction:** Human-in-the-loop for sensitive workflows
- **Vyken CTA:** Workflow controls

### Auditability gap

- **Meaning:** No logging or evidence of AI usage.
- **Why it matters:** Cannot demonstrate governance to auditors or regulators.
- **Trigger signals:** `no_audit_logs`
- **Recommendation direction:** AI usage logging (AI-AUD-001)
- **Vyken CTA:** Audit evidence capabilities

### Enforcement gap

- **Meaning:** No technical controls to warn, block, redact, or alert.
- **Why it matters:** Policy-only governance fails in practice.
- **Trigger signals:** `no_enforcement`
- **Recommendation direction:** Implement enforcement controls (AI-ENF-001)
- **Vyken CTA:** Vyken Guard enforcement

### Incident response gap

- **Meaning:** No AI incident escalation process.
- **Why it matters:** Slow response to data leaks or misuse.
- **Trigger signals:** `no_incident_process`
- **Recommendation direction:** AI incident response process (AI-INC-001)
- **Vyken CTA:** Incident readiness consultation

### Agentic/coding/MCP risk

- **Meaning:** AI agents, coding assistants, or MCP tools with elevated permissions.
- **Why it matters:** Excessive agency; command execution; connected system access.
- **Trigger signals:** `coding_assistant_usage`, `mcp_usage`, `agent_command_execution`, `agent_file_access`, `connected_tool_access`
- **Recommendation direction:** Review permissions; code review gates
- **Vyken CTA:** Agentic security review (call-only depth)

### Connected tool/access risk

- **Meaning:** AI tools connected to APIs, drives, Slack, databases, or internal docs.
- **Why it matters:** Expanded blast radius beyond chat.
- **Trigger signals:** `connected_tool_access`, `mcp_usage`
- **Recommendation direction:** Map integrations; least-privilege connections
- **Vyken CTA:** Connected tool assessment

### Regulated decision risk

- **Meaning:** AI influences decisions about people, customers, access, or regulated outcomes.
- **Why it matters:** Heightened governance and human oversight expectations.
- **Trigger signals:** Decision-influence "Yes/Sometimes" + sensitive data + regulated industry
- **Recommendation direction:** Human review; use-case register; heightened controls
- **Vyken CTA:** Regulated use-case review

### Unknown tool risk

- **Meaning:** User selected tools not in curated database or marked low confidence.
- **Why it matters:** Cannot assess vendor controls from public profile.
- **Trigger signals:** Unknown tool selection, `unknown_ai_usage`
- **Recommendation direction:** Internal vendor review; request tool profile update
- **Vyken CTA:** Request review

## Do / Do not

**Do:**
- Map every signal to at least one taxonomy category.
- Surface top 3–5 taxonomy drivers on result page and executive summary.

**Do not:**
- Invent new risk category names in UI without updating this document.
- Conflate taxonomy categories with legal risk classifications.

## Acceptance criteria

- Signal library in `09_SIGNAL_MAPPING.md` covers all categories above.
- Report findings reference taxonomy labels internally.
- Recommendations trace to taxonomy via signals.

## Related documents

- [06_CONTROL_LIBRARY.md](./06_CONTROL_LIBRARY.md)
- [09_SIGNAL_MAPPING.md](./09_SIGNAL_MAPPING.md)
- [11_RECOMMENDATION_LIBRARY.md](./11_RECOMMENDATION_LIBRARY.md)

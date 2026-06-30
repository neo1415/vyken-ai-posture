# Product Requirements Document

# Vyken AI Risk Assessment Hub — MVP

Prepared for: Vyken Security
Product: Vyken AI Risk Assessment Hub
Primary commercial destination: Vyken Guard
Version: MVP PRD Draft 1
Date: June 2026

---

## 1. Product Summary

The Vyken AI Risk Assessment Hub is a public, lead-generating AI governance and security assessment tool for organizations using or considering workplace AI tools.

The MVP will allow users to assess their organization’s AI tool stack, governance maturity, data exposure risk, auditability gaps, and early agentic/coding-tool risk signals. The tool will collect basic company context, allow the user to select multiple AI tools, ask a short set of guided questions, generate an immediate risk summary, capture a work email, and send a branded PDF report.

The product must feel useful enough for a CISO, GRC lead, IT director, compliance officer, risk manager, or executive to forward internally. It must not feel like a shallow quiz.

The tool must be framework-informed, but not boring. It should use recognized AI governance and security ideas from NIST AI RMF, ISO/IEC 42001-style AI management controls, ISO/IEC 23894-style risk thinking, EU AI Act-style risk classification, OWASP LLM Top 10, and privacy/data protection principles. These references should appear lightly in the landing page, question helper text, report sections, and recommended next steps.

The product must not claim to certify, audit, legally validate, or fully scan an AI tool. It is a practical risk assessment and lead-generation asset, not a legal opinion or compliance certification.

---

## 2. Primary Business Goal

The primary goal is to generate qualified leads for Vyken Guard and Vyken Security consulting conversations.

The tool should attract users who are already concerned about:

* Shadow AI
* Employees using personal AI accounts
* Sensitive data in AI prompts/uploads
* AI meeting transcripts
* AI coding assistants
* AI agents and connected tools
* Lack of AI policy
* Lack of AI visibility
* Lack of audit logs
* Lack of enforcement
* Vendor/privacy risk
* Regulatory and compliance pressure

The product should give users enough value to trust Vyken, but still leave a clear reason to book a call, request a walkthrough, register for Vyken Guard, or speak with Vyken Security.

---

## 3. Secondary Goals

The MVP should also:

1. Educate prospects on AI governance and AI security risk.
2. Position Vyken Security as a serious AI governance and AI security company.
3. Support the Vyken AI Risk Index content series.
4. Produce branded reports that prospects can share internally.
5. Help Vyken understand each lead’s risk profile before follow-up.
6. Create a practical bridge from assessment to Vyken Guard.
7. Build a reusable scoring/report engine that can later support deeper assessments.
8. Support future expansion into MCP, agentic AI, GitHub/code review, and deeper vendor review.

---

## 4. Product Positioning

### Public positioning

“Assess the AI tools your team uses and see where governance, data exposure, auditability, and agentic AI risks may exist.”

### Stronger sales positioning

“AI risk depends on the tools, the data, the company context, and the controls around usage. Vyken’s AI Risk Assessment helps teams identify where AI governance risk may exist and what to fix first.”

### Vyken Guard bridge

“The assessment shows where risk may exist. Vyken Guard helps organizations move from written AI policy to practical visibility, enforcement, and audit evidence.”

---

## 5. What This Product Is

The MVP is:

* A public lead-generation assessment tool
* A multi-step AI risk wizard
* A multi-tool AI stack assessment
* A company-context-aware risk assessment
* A framework-informed governance assessment
* A branded PDF report generator
* A lead intelligence capture engine
* A sales bridge to Vyken Guard
* A foundation for future deeper AI governance modules

---

## 6. What This Product Is Not

The MVP is not:

* A full enterprise SaaS dashboard
* A live AI monitoring product
* A browser extension
* A legal compliance certification
* A full ISO/IEC 42001 audit
* A full EU AI Act legal assessment
* A vulnerability scanner
* A live privacy policy scraper
* An MCP server scanner
* A GitHub repository scanner
* A full AI policy generator
* A replacement for legal, privacy, security, or compliance review

The product must use careful language. It must not say:

* “This tool is secure.”
* “This tool is unsafe.”
* “This proves compliance.”
* “This is a full audit.”
* “This certifies your AI usage.”
* “This is legal advice.”
* “Vyken has fully scanned this AI vendor.”

Preferred language:

* “Based on your answers…”
* “This may indicate…”
* “This suggests…”
* “This should be reviewed…”
* “This assessment is a starting point…”
* “Risk depends on how the tool is used, what data enters it, and what controls exist.”

---

## 7. Target Users

Primary users:

* CISO
* Head of Information Security
* GRC Lead
* Compliance Officer
* Data Protection Officer
* Risk Manager
* Security Architect
* IT Director
* AI Governance Lead
* Privacy Lead
* Internal Audit Lead

Secondary users:

* CTO
* Engineering Manager
* Product Security Lead
* Legal Counsel
* Procurement/Vendor Risk Manager
* Operations Lead
* Department Head
* Founder/Executive in regulated or data-heavy company

---

## 8. Target Industries

The MVP should speak especially well to regulated and document-heavy organizations.

Priority industries:

* Banking
* Fintech
* Insurance
* Healthcare
* Legal/professional services
* Consulting
* SaaS/technology
* Education
* Public sector
* Telecoms
* Retail/ecommerce
* Media/marketing
* Manufacturing

Industry context must affect the report. For example, AI use with public marketing copy is different from AI use with claims documents, patient records, KYC documents, financial records, customer complaints, contracts, or source code.

---

## 9. MVP Assessment Paths

The MVP should be structured as a single AI Risk Assessment Hub with one primary path and two lightweight supporting paths.

### Path 1: AI Tool Stack Risk Assessment

This is the main MVP path.

It answers:

“Which AI tools are being used, what data may enter them, and what governance or security gaps exist?”

This path supports multi-tool selection.

### Path 2: AI Governance Gap Check

This is included inside the main path as a governance/control maturity section.

It answers:

“How prepared is the organization to govern AI use?”

It checks:

* AI policy
* Approved tool list
* Personal account rules
* Sensitive data rules
* Vendor review
* Human review
* Auditability
* Enforcement
* Incident response
* Ownership

### Path 3: Agentic/Coding/MCP Risk Screen

This is a lightweight screening section in MVP.

It answers:

“Are coding assistants, AI agents, MCP servers, or connected AI tools creating additional security risk?”

The MVP must not scan MCP servers or repositories. It only asks screening questions and flags where deeper review is recommended.

---

## 10. Core User Journey

### Journey A: Standard assessment

1. User lands on the assessment page from LinkedIn, website, outreach, or AI Risk Index.
2. User sees the value proposition and framework-informed trust signals.
3. User clicks “Start Assessment.”
4. User provides basic company context.
5. User selects multiple AI tools used or being considered.
6. User answers guided questions about usage, data, governance, visibility, and controls.
7. If coding/agentic tools are selected, user answers lightweight agentic risk questions.
8. User sees an immediate on-screen risk summary.
9. User enters work email to receive the full branded PDF report.
10. System generates and emails the report.
11. Vyken receives internal lead details and risk summary.
12. User is guided toward Vyken Guard registration, book-a-call, or relevant AI Risk Index resources.

### Journey B: User is not sure which tools employees use

1. User selects “I’m not sure what employees use.”
2. System treats this as a Shadow AI visibility signal.
3. Assessment continues with governance/data/control questions.
4. Report highlights unknown AI usage as a visibility and auditability gap.
5. CTA guides user toward AI visibility and policy enforcement conversation.

### Journey C: Tool not listed

1. User searches for a tool and cannot find it.
2. User selects “Other / request tool review.”
3. User enters tool name and optional website.
4. System includes it in the report as an unknown/limited-confidence tool.
5. Vyken receives unknown tool request internally.
6. Report recommends internal vendor review before sensitive data is allowed.

### Journey D: Agentic/coding risk

1. User selects Cursor, GitHub Copilot, coding assistant, automation agent, MCP, or connected AI tool.
2. System triggers agentic/coding risk section.
3. User answers lightweight questions about repo/file/API/command access.
4. Report includes an “Agentic AI / Developer Tooling Risk Note.”
5. CTA invites the user to book a deeper agentic AI risk review.

---

## 11. Landing Page Requirements

### Hero headline

“Assess the AI tools your team may already be using.”

Alternative:

“Find the governance and data exposure risks in your AI tool stack.”

### Subheadline

“Get a practical AI risk report covering workplace AI tools, sensitive data exposure, policy gaps, auditability, and recommended controls.”

### Trust/authority line

“Informed by recognized AI governance and security frameworks, including NIST AI RMF, ISO/IEC 42001-style AI management controls, EU AI Act risk-based thinking, OWASP LLM Top 10, and privacy/data protection principles.”

### Primary CTA

“Start Assessment”

### Secondary CTA

“Book a Call”

### Feature cards

1. **AI Tool Stack Risk**
   Assess multiple workplace AI tools at once, including assistants, copilots, meeting tools, coding assistants, and automation tools.

2. **Data Exposure Insight**
   Identify whether prompts, uploads, transcripts, source code, claims, contracts, or customer data may create governance risk.

3. **Governance Gap Check**
   Review policy, approved tools, vendor review, auditability, human oversight, and enforcement readiness.

4. **Branded PDF Report**
   Receive a practical report with risk drivers, recommended controls, and next steps.

5. **Built for Security and Compliance Teams**
   Designed for security, risk, compliance, privacy, audit, IT, and leadership teams managing AI adoption.

---

## 12. Company Profile Section

The assessment must collect company context early.

This section must be framed as report personalization, not invasive data collection.

### Suggested title

“Tailor the assessment to your organization”

### Supporting copy

“We only ask for basic business context so the report can reflect your industry, company size, and likely governance expectations. Do not enter confidential information.”

### Fields

1. Company name

   * Optional text input
   * Used for report personalization and lead record

2. Country/region

   * Dropdown
   * Used for broad regulatory context

3. Industry

   * Select card/dropdown
   * Required

4. Company size

   * Range selection
   * Required

5. Role

   * Dropdown
   * Required or recommended

6. Department/function

   * Dropdown
   * Optional

7. Does your organization handle sensitive or regulated data?

   * Yes / No / Not sure

8. Main AI concern

   * Multi-select cards

### Company size options

* 1–10
* 11–50
* 51–200
* 201–500
* 501–1,000
* 1,001–5,000
* 5,000+

### Main AI concern options

* Personal AI accounts
* Sensitive data in prompts/uploads
* Meeting transcripts
* Source code or developer tools
* AI agents or connected tools
* Lack of AI policy
* Lack of visibility/audit logs
* Vendor/privacy concerns
* Regulatory or compliance pressure
* Not sure yet

### Company profile scoring use

Company profile must influence:

* Industry risk modifier
* Company-size maturity expectation
* Report tone
* Recommended controls
* Lead qualification
* Sales follow-up context

---

## 13. AI Tool Selection Section

The MVP must support multi-tool selection.

The user should not be forced to run the assessment separately for each AI tool.

### UI requirements

* Search/autocomplete
* Category filters
* Logo/tool cards
* Multi-select checkboxes
* “Other / not listed”
* “I’m not sure what employees use”
* Mobile-friendly card layout

### Suggested title

“Which AI tools are used or being considered?”

### Supporting copy

“Select all that apply. If you are not sure what employees use, select ‘Not sure’ — that may itself indicate a visibility gap.”

### Tool categories

1. General AI assistants

   * ChatGPT
   * Claude
   * Google Gemini
   * DeepSeek

2. AI search/research tools

   * Perplexity
   * ChatGPT Search
   * Gemini search-style use

3. Workplace copilots

   * Microsoft Copilot
   * Google Gemini for Workspace

4. Coding assistants

   * GitHub Copilot
   * Cursor
   * Replit AI
   * Codeium
   * Windsurf
   * Claude Code, if included later

5. Meeting assistants

   * Otter
   * Fireflies
   * Fathom

6. Writing/productivity

   * Grammarly
   * Notion AI

7. Design/media

   * Canva AI
   * Adobe Firefly, if included later

8. Automation/agents

   * Zapier AI
   * Make AI
   * Lindy, if included later
   * MCP-connected tools, if included later

### Initial MVP tool database

Seed at least these tools:

* ChatGPT
* Claude
* Google Gemini
* Microsoft Copilot
* Perplexity
* DeepSeek
* GitHub Copilot
* Cursor
* Notion AI
* Grammarly
* Otter
* Fireflies
* Fathom
* Canva AI
* Zapier AI

---

## 14. Tool Profile Database

The MVP must include a curated tool profile database.

The system must not invent vendor facts. If public information is limited, the tool profile must mark confidence as limited and recommend internal review.

### Tool profile fields

Each AI tool profile should include:

* Tool name
* Slug
* Category
* Logo/icon reference
* Common workplace use cases
* Supports file uploads?
* Supports meeting/audio transcripts?
* Relevant to source code/development?
* Relevant to automation/agents?
* Public privacy policy link
* Public security/trust link
* Training-use notes
* Data retention notes
* Deletion/user-control notes
* Enterprise/admin controls notes
* Audit/logging notes
* Compliance/security documentation notes
* Subprocessor/third-party notes
* Recommended usage boundaries
* Sensitive data concerns
* Risk notes
* Confidence level
* Last reviewed date
* Reviewed by
* Profile version
* Published status

### Confidence levels

* High: clear public documentation and recently reviewed
* Medium: some public documentation available
* Low: limited or unclear public information
* Unknown: tool not reviewed yet

### Versioning requirement

Tool profiles must be versioned.

If a report is generated using tool profile version 1.3, the report record must store that version. This matters because AI vendor policies change.

---

## 15. Assessment Question Sections

The assessment should use mostly clickable cards, chips, toggles, and multi-select options. Text input should be minimal.

Every difficult question should include short helper text. Some helper text should lightly reference frameworks or governance principles.

### Section A: Company Context

Covered in section 12.

### Section B: Tool Stack

Covered in section 13.

### Section C: Usage Context

Questions:

1. Are these AI tools already being used in your organization?

   * Yes
   * No, being considered
   * Some are used, some are being considered
   * Not sure

2. Are these tools officially approved?

   * Yes, approved
   * Some approved
   * No
   * Not sure

3. What account types are employees using?

   * Company-managed accounts
   * Personal accounts
   * Both
   * Not sure

4. Which teams use or may use these tools?

   * IT/security
   * Engineering
   * Customer support
   * Sales/marketing
   * Legal/compliance
   * Finance
   * HR
   * Operations
   * Claims/underwriting
   * Leadership
   * Not sure
   * Other

5. What are the tools mainly used for?

   * Drafting/writing
   * Research
   * Summarizing documents
   * Coding
   * Meeting notes/transcripts
   * Customer support
   * Data analysis
   * Legal/contract review
   * Claims/underwriting/fraud review
   * Decision support
   * Workflow automation
   * Other

6. Do AI outputs influence decisions about customers, employees, applicants, vendors, or users?

   * Yes
   * No
   * Sometimes
   * Not sure

Helper text:

“Risk-based AI governance treats some use cases as more sensitive when they affect people, customers, employees, access to services, or regulated decisions.”

### Section D: Data Exposure

Questions:

1. What data may enter prompts, uploads, transcripts, or AI workspaces?

   * Public information only
   * Internal documents
   * Customer personal data
   * Employee data
   * Financial records
   * Legal/contracts
   * Claims documents
   * KYC/identity data
   * Health/medical data
   * Source code
   * Logs
   * API keys/secrets/tokens
   * Meeting recordings/transcripts
   * Strategy/confidential business plans
   * Not sure

2. Are files uploaded into AI tools?

   * Yes
   * No
   * Sometimes
   * Not sure

3. Are meeting recordings or transcripts processed by AI tools?

   * Yes
   * No
   * Sometimes
   * Not sure

4. Are source code, logs, secrets, or developer workflows involved?

   * Yes
   * No
   * Sometimes
   * Not sure

Helper text:

“Data exposure risk depends on what enters the AI tool and whether your organization can control training use, retention, deletion, access, and audit logs.”

### Section E: Governance Controls

Questions:

1. Does your organization have an AI usage policy?

   * Yes, approved
   * Draft/in progress
   * No
   * Not sure

2. Do employees know which AI tools are approved?

   * Yes
   * Partly
   * No
   * Not sure

3. Are there rules for what data must not be entered into AI tools?

   * Yes
   * Partly
   * No
   * Not sure

4. Is there a vendor review process before approving AI tools?

   * Yes
   * Partly
   * No
   * Not sure

5. Is human review required for sensitive AI-assisted decisions?

   * Yes
   * Partly
   * No
   * Not sure

6. Is someone responsible for AI governance?

   * Yes
   * Informally
   * No
   * Not sure

Helper text:

“AI governance is not only about choosing tools. It also requires ownership, policies, approved use cases, review processes, and evidence that controls are working.”

### Section F: Visibility, Auditability, and Enforcement

Questions:

1. Can security, compliance, or IT review AI usage later?

   * Yes, centrally
   * Partly
   * No
   * Not sure

2. Are AI usage logs available for review?

   * Yes
   * For some tools only
   * No
   * Not sure

3. Can risky AI activity be blocked, redacted, alerted on, or logged?

   * Yes
   * Partly
   * No
   * Not sure

4. Can your organization investigate whether sensitive data was pasted, uploaded, or exposed through AI tools?

   * Yes
   * Partly
   * No
   * Not sure

5. Can controls differ by role, team, tool, or data type?

   * Yes
   * Partly
   * No
   * Not sure

Helper text:

“An AI policy is difficult to enforce if the organization cannot see, review, or evidence how AI tools are being used.”

### Section G: Agentic/Coding/MCP Risk Screen

Trigger this section if:

* User selects coding assistant
* User selects automation/agent tool
* User selects MCP/connected AI
* User indicates source code/logs/secrets are involved
* User indicates AI tools access internal systems

Questions:

1. Are AI coding assistants used by developers?

   * Yes
   * No
   * Not sure

2. Can AI tools access repositories, local files, or project folders?

   * Yes
   * No
   * Not sure

3. Can AI tools run commands, modify files, create pull requests, or take actions?

   * Yes
   * No
   * Not sure

4. Are MCP servers or connected AI tools used?

   * Yes
   * No
   * Not sure

5. Can AI tools connect to APIs, databases, cloud resources, Slack, Google Drive, internal docs, or other business systems?

   * Yes
   * No
   * Not sure

6. Are AI-generated code changes reviewed before merge or deployment?

   * Always
   * Sometimes
   * No
   * Not sure

7. Could secrets, logs, tokens, credentials, production data, or customer data be exposed through developer AI tools?

   * Yes
   * No
   * Not sure

Helper text:

“Connected AI tools and coding agents can introduce additional risk when they can read files, access repositories, call tools, or act on internal systems. This assessment flags risk signals but does not scan code or MCP servers.”

---

## 16. Scoring Model

The score must be explainable. The final result must not be a random number.

The MVP should calculate the following scores:

1. Overall AI Governance Risk
2. Tool Stack Risk
3. Data Exposure Risk
4. Governance Maturity Gap
5. Auditability and Enforcement Gap
6. Agentic/Coding Risk Flag
7. Lead Qualification Score, internal only

### Score categories

* Low
* Moderate
* High
* Critical
* Unknown / Insufficient Information

### Risk rating principles

The final score must not be a simple average.

A strong AI vendor/tool can still become high risk if:

* Employees use personal accounts
* Sensitive data enters prompts/uploads
* The organization has no AI policy
* There is no audit trail
* There is no vendor review
* The company is regulated
* AI affects customers/employees/decisions
* Developer tools access code, files, secrets, or systems

A tool with limited public documentation may be lower risk if:

* It is used only for public content
* No sensitive data enters it
* It is not used for decisions
* Company-managed accounts are used
* Logs and controls exist
* Usage is approved and reviewed

### Suggested scoring components

| Component                            | Suggested Weight |
| ------------------------------------ | ---------------: |
| Usage Context Risk                   |              25% |
| Data Exposure Risk                   |              25% |
| Governance Maturity Gap              |              20% |
| Tool Profile Risk                    |              15% |
| Auditability/Enforcement Gap         |              10% |
| Industry/Company/Regulatory Modifier |               5% |

Agentic/coding risk should be applied as a flag/modifier, not buried in averages.

If agentic/coding risk is high, the report must include a dedicated risk note even if the overall score is only moderate.

---

## 17. Risk Signals

The scoring engine should convert answers into structured risk signals.

Example signals:

* `unknown_ai_usage`
* `personal_ai_accounts`
* `mixed_account_usage`
* `unapproved_tools`
* `sensitive_customer_data`
* `employee_data`
* `financial_data`
* `claims_data`
* `kyc_identity_data`
* `health_data`
* `legal_contract_data`
* `source_code_exposure`
* `secrets_or_logs_exposure`
* `meeting_transcript_exposure`
* `file_uploads_enabled`
* `no_ai_policy`
* `draft_policy_only`
* `no_approved_tool_list`
* `no_vendor_review`
* `no_human_review`
* `no_ai_owner`
* `no_audit_logs`
* `no_enforcement`
* `no_incident_process`
* `regulated_industry`
* `large_company_low_maturity`
* `agent_file_access`
* `agent_command_execution`
* `mcp_usage`
* `connected_tool_access`
* `no_code_review_gate`

Each signal can trigger:

* risk points
* report finding
* recommendation block
* framework mapping
* Vyken CTA
* internal lead score

---

## 18. Maturity Stages

The report should describe the organization’s AI governance maturity in plain language.

Suggested maturity stages:

### Stage 1: Unknown / Unmapped AI Usage

The organization is not sure which AI tools are being used or where AI is entering workflows.

### Stage 2: Informal AI Usage

Employees use AI tools, but approvals, policies, and data rules are limited or inconsistent.

### Stage 3: Policy-Only Governance

The organization has some AI guidance, but limited visibility, enforcement, or audit evidence.

### Stage 4: Managed AI Governance

The organization has approved tools, policies, vendor review, human review, and some auditability.

### Stage 5: Enforced and Auditable AI Governance

The organization can see, control, log, review, and evidence AI usage across sensitive workflows.

The report should naturally position Vyken Guard as helping organizations move from Stage 2/3 toward Stage 4/5.

---

## 19. Framework Mapping Requirements

The product must include framework-informed language without overwhelming the user.

### Frameworks to include

1. NIST AI RMF

   * Govern
   * Map
   * Measure
   * Manage

2. ISO/IEC 42001-style controls

   * AI management system
   * ownership
   * policy
   * risk management
   * monitoring
   * continual improvement

3. ISO/IEC 23894-style risk thinking

   * risk identification
   * risk analysis
   * risk evaluation
   * risk treatment
   * monitoring

4. EU AI Act-style risk classification

   * unacceptable/prohibited-style concerns
   * high-risk use cases
   * limited-risk transparency concerns
   * low/minimal-risk use cases

5. OWASP LLM Top 10

   * prompt injection
   * insecure output handling
   * sensitive information disclosure
   * supply chain vulnerabilities
   * excessive agency or connected-tool concerns where relevant

6. Privacy/data protection principles

   * personal data
   * sensitive data
   * minimization
   * purpose limitation
   * retention
   * deletion
   * automated decision-making sensitivity
   * auditability/evidence

### Where framework references appear

1. Landing page trust line
2. Selected question helper text
3. PDF report framework-informed findings
4. NIST-style action plan
5. Recommendation blocks
6. Disclaimer

### Framework language rules

Use:

* “informed by”
* “mapped to”
* “aligned with common themes from”
* “uses risk concepts from”
* “framework-informed”

Avoid:

* “certified”
* “compliant”
* “approved by”
* “official assessment”
* “legal determination”
* “audit certification”

---

## 20. Recommendation Engine

The recommendation engine must generate useful, actionable advice based on signals.

Recommendations must be specific enough to help, but not so complete that the user no longer needs a consultation.

### Recommendation block structure

Each recommendation block should include:

* Trigger signals
* Finding title
* Plain-English risk explanation
* Framework logic
* Recommended actions
* Vyken bridge
* CTA category

### Example recommendation block

Trigger:

* personal accounts
* sensitive data
* no audit logs

Finding:

“Personal AI account usage with sensitive data exposure”

Explanation:

“Employees may be using unmanaged AI accounts with customer, internal, or regulated data. This reduces the organization’s ability to control retention, deletion, training use, access, and auditability.”

Framework logic:

* NIST Govern: define roles, policies, and accountability
* NIST Map: identify AI tools, data flows, and context
* ISO 42001-style controls: define AI usage rules and monitoring
* Privacy/data protection: reduce unnecessary exposure of personal or regulated data
* OWASP LLM: sensitive information disclosure risk

Recommended actions:

1. Restrict sensitive work use of personal AI accounts.
2. Define approved AI tools and account types.
3. Create sensitive data rules for prompts/uploads.
4. Require company-managed accounts for business use.
5. Add logging or review capability for sensitive workflows.
6. Evaluate redaction, blocking, or alerting controls.

Vyken bridge:

“Vyken Guard can help teams move from policy-only guidance to practical visibility, redaction, blocking, logging, and audit evidence.”

CTA:

“Review AI visibility and enforcement options”

---

## 21. NIST-Style Action Plan

The PDF report must include a practical action plan structured around:

* Govern
* Map
* Measure
* Manage

### Govern

Purpose: set ownership, rules, and accountability.

Possible actions:

* Assign an AI governance owner.
* Define approved AI tools and account types.
* Create or update an AI acceptable use policy.
* Define rules for personal AI accounts.
* Require review before sensitive AI use.
* Create an AI incident escalation process.

### Map

Purpose: understand where AI is used and what data is involved.

Possible actions:

* Create an AI tool and use-case register.
* Identify departments using AI.
* Document prompts/uploads/transcripts/data flows.
* Separate low-risk use from sensitive workflows.
* Identify AI tools connected to files, code, APIs, or internal systems.

### Measure

Purpose: assess risk and control gaps.

Possible actions:

* Rate use cases by data sensitivity, business impact, account type, vendor controls, and auditability.
* Review vendor policies for training use, retention, deletion, security documentation, admin controls, and subprocessors.
* Identify high-risk workflows involving personal data, claims, KYC, financial records, health records, legal documents, source code, secrets, or decisions affecting people.

### Manage

Purpose: apply controls and monitor improvement.

Possible actions:

* Restrict sensitive data in unmanaged AI tools.
* Require company-managed accounts for business AI use.
* Add human review for sensitive or high-impact use cases.
* Implement controls that warn, block, redact, log, or escalate risky AI activity.
* Review and update AI policy regularly.
* Use audit logs and evidence for governance reporting.

---

## 22. Free Value vs Call-Only Value

The report must provide real value, but it must not give away the full consulting engagement.

### Free report should include

* Overall risk rating
* Top risk drivers
* Selected tool stack summary
* Data exposure concerns
* Governance maturity stage
* Auditability/enforcement gaps
* Agentic/coding risk note, if applicable
* Framework-informed findings
* NIST-style action plan
* Starter AI policy checklist
* Recommended next steps
* Vyken Guard bridge
* CTAs

### Reserve for call/consultation/Vyken Guard

* Full custom AI governance policy
* Full AI use-case register implementation
* Full vendor due diligence review
* Full department-by-department AI inventory
* Full EU AI Act legal classification
* Full ISO 42001 readiness review
* Full technical enforcement design
* Full agentic/MCP security review
* Full board/executive workshop
* Full Vyken Guard deployment planning

---

## 23. Instant Result Page

The result page should show enough value before email capture.

### Required elements

* Overall risk rating
* Short explanation
* Top 3 risk drivers
* Selected AI tool count
* Highest-risk tool categories
* Data exposure indicator
* Governance gap indicator
* Auditability gap indicator
* Agentic/coding flag, if applicable
* Recommended control preview
* Email capture for full PDF
* Book-a-call CTA
* Vyken Guard CTA
* Related AI Risk Index links

### Example result

“High AI Governance Risk”

“This result is mainly driven by possible personal or mixed AI account usage, sensitive data entering AI prompts/uploads, limited auditability, and weak enforcement controls.”

Top risk drivers:

1. Sensitive data may enter AI tools.
2. Employees may use unmanaged or personal AI accounts.
3. Security/compliance may not be able to review activity later.
4. Coding or connected AI tools may introduce additional risk.

CTA:

“Send my full report”

Secondary CTA:

“Book a Vyken AI risk review”

---

## 24. Lead Capture

Lead capture should feel natural.

### Email capture copy

“Where should we send your full report?”

Supporting copy:

“Your summary is ready. Enter your work email and we’ll send the full branded PDF report with the risk breakdown, recommended controls, and next steps.”

### Required field

* Work email

### Optional fields

* Name
* Organization
* Role
* Phone number
* Interest in walkthrough
* Consent checkbox, if needed

Phone number should not be required in MVP.

### Suggested consent copy

“We’ll use your email to send this report and may follow up with relevant AI governance resources. No spam.”

---

## 25. PDF Report Requirements

The PDF report must be branded, polished, and useful enough to forward internally.

### Report sections

1. Cover page
2. Executive summary
3. Company context
4. Selected AI tools
5. Overall risk rating
6. Score breakdown
7. Tool stack risk findings
8. Data exposure findings
9. Governance maturity findings
10. Auditability/enforcement findings
11. Agentic/coding/MCP risk note, if applicable
12. Framework-informed findings
13. NIST-style Govern/Map/Measure/Manage action plan
14. Starter AI policy checklist
15. Recommended next steps
16. Where Vyken Guard fits
17. CTA links
18. Disclaimer

### Report tone

The report should sound like:

* professional
* practical
* security/compliance-aware
* plain English
* not alarmist
* not generic
* not legally overconfident

### Report must include

* Company name if provided
* Date generated
* Assessment ID
* Risk level
* Top risk drivers
* Selected tools
* Tool profile confidence notes
* Last-reviewed dates for tool profiles, where available
* Framework-informed language
* Vyken Guard bridge
* Booking/registration links

### Report must avoid

* Vendor claims without source
* Legal conclusions
* Compliance certification
* “This tool is safe/unsafe”
* Unsupported vulnerability claims
* Hallucinated policy statements

---

## 26. Email Delivery Requirements

After lead capture, the system must send the user the full report.

### Email subject

“Your Vyken AI Risk Assessment Report”

### Email body should include

* Thank you message
* Short result summary
* Link or attachment to PDF report
* Link to book a call
* Link to Vyken Guard
* Link to relevant AI Risk Index content
* Support/contact information
* Disclaimer line

### Internal notification email

Vyken should receive an internal notification for every completed assessment.

Internal email should include:

* Lead email
* Name, if provided
* Company, if provided
* Country/region
* Industry
* Company size
* Role
* Selected AI tools
* Overall risk rating
* Top risk drivers
* Agentic/coding flag
* Main concern
* CTA clicked, if available
* Link to admin assessment record

---

## 27. Vyken Guard CTA Strategy

The product must naturally push users toward Vyken Guard without sounding like a hard sell.

### CTA placements

1. Landing page
2. Result page
3. PDF executive summary
4. PDF recommended actions
5. PDF “Where Vyken Guard fits” section
6. Email
7. Related AI Risk Index content
8. Admin follow-up notes

### CTA types

* “Book a call”
* “Review AI visibility options”
* “Explore Vyken Guard”
* “Register for Vyken”
* “See how Vyken helps enforce AI policy”
* “Request a walkthrough”
* “Discuss your AI governance gaps”

### CTA mapping by risk

| Risk Found              | CTA Direction                                |
| ----------------------- | -------------------------------------------- |
| Personal AI accounts    | Explore AI visibility and account governance |
| Sensitive data exposure | Review redaction/blocking/logging controls   |
| No AI policy            | Book AI governance policy review             |
| No audit logs           | See how Vyken supports audit evidence        |
| Developer/coding risk   | Book agentic AI/developer tooling review     |
| Regulated industry risk | Request AI governance readiness discussion   |
| Unknown tools           | Request AI tool review                       |

### Example CTA copy

“Your assessment suggests that AI policy alone may not be enough if employees can still paste sensitive data into unmanaged tools. Vyken Guard helps organizations add visibility, redaction, blocking, logging, and audit evidence around workplace AI usage.”

---

## 28. Admin Dashboard Requirements

The admin dashboard is required for MVP.

### Admin roles

1. Admin

   * Full access
   * Manage tool profiles
   * View leads
   * Export leads
   * Manage scoring/recommendations later, if supported

2. Analyst

   * View leads and assessments
   * Add notes
   * Update lead status
   * Review unknown tool requests

3. Viewer

   * Read-only access

### Admin features

* View leads
* View completed assessments
* View selected tools
* View company profile
* View score breakdown
* View top risk drivers
* View generated report
* View report/email delivery status
* View CTA events
* View unknown tool requests
* Add internal notes
* Update lead status
* Export leads
* Filter by risk level, industry, company size, selected tool, agentic flag, country, lead status
* Mark lead as:

  * New
  * Contacted
  * Qualified
  * Booked
  * Not ready
  * Closed
  * Ignore/spam

### Lead intelligence fields

* Email
* Name
* Company
* Country/region
* Industry
* Company size
* Role
* Department
* Main concern
* Selected tools
* Tool categories
* Assessment answers
* Overall risk
* Data exposure risk
* Governance gap
* Auditability gap
* Agentic/coding flag
* Top risk drivers
* Recommended CTAs
* Report generated at
* Email sent at
* Report opened/clicked, if trackable
* Book-a-call clicked
* Vyken Guard clicked
* Internal notes
* Owner/assignee
* Lead status

---

## 29. Data Model Requirements

The database must support assessment records, report generation, tool profile versioning, leads, admin notes, and events.

### Suggested tables

* `users_admin`
* `admin_roles`
* `ai_tools`
* `ai_tool_categories`
* `ai_tool_profile_versions`
* `assessment_sessions`
* `assessment_company_profiles`
* `assessment_selected_tools`
* `assessment_answers`
* `assessment_scores`
* `assessment_risk_signals`
* `assessment_findings`
* `assessment_recommendations`
* `reports`
* `leads`
* `lead_events`
* `admin_notes`
* `unknown_tool_requests`
* `cta_events`
* `email_events`
* `audit_logs`

### Data integrity principles

* Store raw answers.
* Store calculated signals.
* Store final score.
* Store report context.
* Store tool profile version used.
* Do not trust client-submitted scores.
* All scoring must run server-side.
* All report generation must use server-side calculated context.
* Avoid storing unnecessary sensitive data.
* Do not ask users to submit confidential documents or prompts.

---

## 30. Suggested Technical Stack

Recommended MVP stack:

* Next.js App Router
* TypeScript
* React Server Components by default
* Client Components only where interactivity is needed
* Tailwind CSS
* shadcn/ui-style component system
* Supabase Postgres
* Drizzle ORM
* Supabase Auth for admin login, if appropriate
* Supabase Row Level Security
* Zod for validation
* Server Actions or Route Handlers for secure server-side operations
* PDF generation library/service
* Email delivery provider such as Resend, Postmark, SendGrid, or equivalent
* Rate limiting for public forms
* Bot/spam protection
* Basic analytics/event tracking

The exact email/PDF packages must be finalized in the module PRD after package/security review.

---

## 31. Architecture Principles

### Core rule

Pages orchestrate. They do not contain business logic.

### Required architecture boundaries

* UI components render screens.
* Question schema defines questions.
* Signal mapping converts answers into signals.
* Scoring engine calculates scores.
* Recommendation engine selects recommendations.
* Report context builder prepares report data.
* PDF service generates reports.
* Email service sends reports.
* Admin service handles internal review.
* Database repository layer handles persistence.

### Suggested folder structure

src/
app/
(public)/
ai-risk-assessment/
assessment/
results/
admin/
leads/
assessments/
tools/
components/
ui/
assessment/
reports/
admin/
features/
assessment/
tool-profiles/
recommendations/
reports/
leads/
admin/
lib/
db/
auth/
validation/
security/
email/
pdf/
utils/
server/
repositories/
services/

### File size rules

* No page file should exceed 250 lines without justification.
* No component should exceed 250 lines without justification.
* No business logic inside JSX.
* Large flows must be split into reusable components and services.
* Question definitions must not be duplicated.
* Scoring logic must not be duplicated.

---

## 32. Security Requirements

Security is non-negotiable.

### Required controls

* Server-side validation for all submissions
* Zod schemas for input validation
* Server-side scoring only
* No client-trusted risk scores
* Admin authentication
* Admin authorization/roles
* Supabase RLS for protected tables
* No service-role key in browser
* Environment variables protected
* Rate limiting on public endpoints
* Bot/spam protection on lead forms
* Audit logs for admin actions
* Safe report links
* Expiring report links if public URLs are used
* No sensitive data in public URLs
* Escape/sanitize user-provided text in PDFs/emails
* Prevent IDOR on report/admin routes
* Restrict report access by secure token or authenticated admin
* Do not log secrets or sensitive payloads
* Dependency vulnerability checks before build completion
* No unnecessary third-party packages

### AI-agent-specific security risks to prevent

Coding agents must not introduce:

* Exposed Supabase service role keys
* Auth checks only in UI
* Missing server-side authorization
* Overbroad database access
* Missing RLS
* Unsafe report URLs
* Unvalidated request bodies
* Client-side score tampering
* Unsafe PDF/email rendering
* Excessive dependencies
* Dead code and unused imports
* Insecure admin routes
* Hidden business logic in components
* Poor error handling
* Missing rate limits

---

## 33. Performance Requirements

The product must work well from LinkedIn/mobile.

### Requirements

* Fast landing page load
* Mobile-responsive UI
* Lightweight assessment wizard
* No heavy unnecessary animations
* Optimized logos/images
* Minimal client JavaScript
* Server Components by default
* Lazy-load non-critical UI
* Do not block instant result on PDF generation
* Email report generation can happen after lead capture
* Save progress after important steps, if practical
* Avoid huge client-side JSON payloads
* Avoid unnecessary re-renders

---

## 34. UX Requirements

The assessment must feel easy.

### UX principles

* Mostly click/tap, not typing
* Multi-step wizard
* Clear progress indicator
* “Not sure” options
* Short helper text
* No long compliance paragraphs inside the flow
* No shame-based language
* No fearmongering
* Risk should feel fixable
* Show useful value before email capture
* CTA should feel like the next step

### UI direction

* Use Vyken visual identity
* Dark navy/deep blue base
* Bright blue/cyan accents
* Clean white text
* Modern cybersecurity SaaS style
* Rounded cards
* Tool logo grid
* Subtle risk chips:

  * Low
  * Moderate
  * High
  * Critical
  * Unknown
* Professional PDF styling
* Mobile-first assessment flow

---

## 35. Required Steering Documents Before Code

Before writing application code, the coding agent must first create the project steering documents.

The agent must not build pages, components, database schemas, or features until these documents exist.

### Required documents

1. `PROJECT_BRIEF.md`
2. `PRODUCT_SCOPE.md`
3. `FRAMEWORK_MAPPING.md`
4. `COMPANY_PROFILE_MODEL.md`
5. `RISK_TAXONOMY.md`
6. `CONTROL_LIBRARY.md`
7. `TOOL_PROFILE_SCHEMA.md`
8. `QUESTION_SCHEMA.md`
9. `SIGNAL_MAPPING.md`
10. `SCORING_MODEL.md`
11. `RECOMMENDATION_LIBRARY.md`
12. `REPORT_ENGINE.md`
13. `DATABASE_SCHEMA.md`
14. `ARCHITECTURE.md`
15. `SECURITY_STANDARD.md`
16. `DESIGN_SYSTEM.md`
17. `COMPONENT_RULES.md`
18. `AI_AGENT_RULES.md`
19. `CODE_REVIEW_CHECKLIST.md`
20. `MODULE_DONE_CRITERIA.md`

### Steering document rule

Every module implementation must reference the relevant steering documents before implementation and after implementation.

---

## 36. Mandatory AI Agent Workflow

The coding agent must follow this process for every module, every edit, and every pass.

### Step 1: Read relevant steering docs

Before coding, the agent must read:

* `PROJECT_BRIEF.md`
* `ARCHITECTURE.md`
* `SECURITY_STANDARD.md`
* `COMPONENT_RULES.md`
* `AI_AGENT_RULES.md`
* the module-specific spec

### Step 2: Produce implementation plan

Before writing code, the agent must state:

* Files to create
* Files to modify
* Why each file is needed
* Server/client boundaries
* Data flow
* Validation approach
* Security considerations
* Performance considerations
* Tests/checks to run

### Step 3: Implement small batch only

The agent must not implement multiple unrelated modules in one pass.

### Step 4: Self-review

After implementation, the agent must review for:

* unnecessary imports
* unnecessary `useEffect`
* unnecessary `useState`
* giant files
* duplicated logic
* business logic inside UI
* weak types
* missing validation
* unsafe database access
* missing authorization
* exposed secrets
* poor error handling
* performance problems
* accessibility issues
* bad mobile behavior
* unused code
* unclear naming

### Step 5: Run checks

The agent must run or prepare:

* TypeScript check
* lint
* format
* build
* unit tests, where available
* scoring tests, where relevant
* security checklist
* dependency check, where relevant

### Step 6: Senior code review mode

The agent must review the final code as if it is a senior engineer reviewing for maintainability, security, performance, and product correctness.

### Step 7: Final summary

The agent must provide:

* What changed
* Why it changed
* Files changed
* Security notes
* Testing notes
* Known limitations
* Next recommended module

---

## 37. Forbidden Coding Patterns

The agent must not:

* Put all logic in one page
* Create 500–1,000 line components
* Duplicate question definitions
* Calculate scores in the browser
* Trust client-submitted scores
* Put service keys in frontend code
* Hide authorization in UI only
* Use random dependencies without justification
* Create unnecessary `useEffect`s
* Create unnecessary `useState`s
* Leave unused imports
* Build admin pages without server-side authorization
* Store confidential user data unnecessarily
* Generate unsupported vendor claims
* Use AI-generated report text without controlled templates
* Mix report logic directly into PDF components
* Mix database access directly into UI components
* Ignore RLS and least privilege
* Ignore mobile responsiveness

---

## 38. Testing Requirements

### Functional tests

* User can start assessment
* User can enter company profile
* User can select multiple tools
* User can select unknown tool
* User can answer all questions
* Conditional agentic section appears when needed
* User sees instant result
* User can submit email
* PDF report is generated
* Email is sent
* Lead appears in admin
* Admin can view assessment
* Admin can update lead status
* Unknown tool request is stored

### Scoring tests

Test scenarios:

1. Low-risk marketing use
2. Small company using AI for public content only
3. Insurance company using AI with claims documents
4. Bank/fintech using AI with KYC/financial data
5. SaaS company using Cursor/GitHub Copilot with source code
6. Healthcare company using AI with patient data
7. Company with no policy and no visibility
8. Company with strong governance and enterprise accounts
9. Unknown tool with sensitive data
10. Agentic/coding tool with repo/file/command access

### Security tests

* Attempt client-side score tampering
* Attempt unauthorized admin access
* Attempt direct report access by ID
* Attempt invalid payload submission
* Attempt spam submissions
* Attempt XSS in company name/tool name
* Attempt oversized input
* Verify no service role key exposure
* Verify RLS policies
* Verify admin role enforcement

### UX tests

* Mobile assessment flow
* Tool search
* Multi-select behavior
* Back/next navigation
* “Not sure” options
* Error states
* Report capture
* PDF readability
* CTA clarity

---

## 39. Edge Cases

### Company profile

* User does not provide company name
* User uses personal email
* User selects “Other” industry
* User is unsure about company size
* User selects regulated industry but says no sensitive data
* User selects small company with advanced controls
* User selects large regulated company with no controls

### Tool selection

* No tools selected
* Too many tools selected
* Unknown tool submitted
* Misspelled tool
* Tool has low-confidence profile
* Tool policies changed since last review
* User selects “not sure what employees use”

### Assessment answers

* User answers “not sure” for most questions
* User selects sensitive data but says no risk controls
* User selects personal accounts and regulated data
* User selects agentic/coding tools but no code review
* User abandons assessment
* User submits duplicate report

### Report/email

* PDF generation fails
* Email delivery fails
* User enters wrong email
* Report link expires
* User refreshes result page
* Long company/tool names affect PDF layout
* Special characters in company/tool names

### Admin

* Duplicate leads
* Same company submits multiple assessments
* High-risk lead needs priority
* Unknown tool requires review
* Admin note contains unsafe characters
* Analyst tries to access admin-only functions

---

## 40. Acceptance Criteria

The MVP is complete when:

1. User can visit landing page.
2. User can start assessment.
3. User can provide company context.
4. User can select multiple AI tools.
5. User can select unknown/not listed tool.
6. User can answer usage, data, governance, visibility, and agentic/coding questions.
7. System calculates server-side risk signals and scores.
8. User sees meaningful instant result.
9. User can enter email for full report.
10. Branded PDF report is generated.
11. Report is emailed to user.
12. Internal Vyken notification is sent.
13. Lead appears in admin.
14. Admin can review assessment and lead details.
15. Admin can update lead status and add notes.
16. CTA links appear on result page, email, and PDF.
17. The product does not overclaim legal/compliance/security certainty.
18. The UI is mobile responsive.
19. The report is useful enough to forward internally.
20. Security checks pass.
21. Code follows steering documents.
22. No major component/page is bloated or unmaintainable.

---

## 41. MVP Build Modules

The build should proceed module by module.

### Module 0: Steering Documents

Create all required project, architecture, security, framework, scoring, report, and agent rule documents.

No app code before this.

### Module 1: Project Foundation

Set up Next.js, TypeScript, styling, linting, formatting, folder structure, environment handling, and base layout.

### Module 2: Design System

Build reusable UI primitives, cards, buttons, risk chips, wizard layout, form controls, tool cards, and responsive page shell.

### Module 3: Database and Schema

Design Supabase Postgres schema with Drizzle, migrations, RLS policies, and seed structure.

### Module 4: Tool Profile Database

Build AI tool categories, tool profiles, seeded MVP tools, profile versioning, confidence levels, and last-reviewed metadata.

### Module 5: Company Profile Step

Build company context collection and validation.

### Module 6: Multi-Tool Selector

Build searchable/autocomplete multi-select AI tool grid with categories and unknown tool flow.

### Module 7: Assessment Wizard

Build multi-step flow for usage, data exposure, governance, visibility, and conditional agentic/coding questions.

### Module 8: Signal and Scoring Engine

Build server-side signal extraction, scoring, risk ratings, maturity stages, and agentic risk flags.

### Module 9: Recommendation Engine

Build recommendation blocks mapped to signals, company context, tool categories, frameworks, and Vyken CTAs.

### Module 10: Result Page

Build instant result page with risk summary, top drivers, recommendation preview, and lead capture CTA.

### Module 11: Lead Capture

Build email capture, consent copy, validation, lead storage, and duplicate handling.

### Module 12: Report Context Builder

Build server-side report context object from company profile, tools, answers, scores, findings, recommendations, and framework mapping.

### Module 13: PDF Report Generation

Build branded PDF generation from controlled templates.

### Module 14: Email Delivery

Send report email to user and internal notification to Vyken.

### Module 15: Admin Dashboard

Build admin authentication, lead table, assessment detail, notes, status updates, filters, and exports.

### Module 16: Tool Profile Admin

Build basic admin ability to view/add/edit tool profiles and unknown tool requests.

### Module 17: CTA and Event Tracking

Track report generation, email delivery, CTA clicks, booking clicks, and Vyken Guard clicks.

### Module 18: Security Hardening

Review auth, authorization, RLS, validation, rate limits, report links, dependency risks, and abuse cases.

### Module 19: Performance and UX Pass

Optimize loading, mobile behavior, component structure, bundle size, and assessment flow polish.

### Module 20: Final QA

Run full functional, scoring, security, UX, and regression testing.

---

## 42. Launch Version Scope

### Must-have MVP

* Landing page
* Company profile
* Multi-tool selector
* AI tool profile database with 15 seeded tools
* Guided assessment wizard
* Data exposure questions
* Governance/control questions
* Visibility/auditability questions
* Agentic/coding risk screen
* Framework-informed helper text
* Server-side scoring
* Instant result page
* Email capture
* Branded PDF report
* Email delivery
* Internal lead notification
* Admin lead dashboard
* Unknown tool request
* Book-a-call CTA
* Vyken Guard CTA
* Basic CTA tracking
* Security baseline
* Mobile responsiveness

### Should-have MVP

* Report resend
* Admin notes
* Lead status management
* CTA click tracking
* Industry-specific report language
* Tool profile confidence display
* Last-reviewed dates
* Basic export
* Related AI Risk Index links

### Not MVP

* Live web scraping
* Full vendor policy scanner
* Full MCP scanner
* GitHub repository scanning
* Browser extension integration
* Customer login/dashboard
* Paid subscription
* Full legal compliance review
* Full ISO 42001 readiness certification
* Full AI policy generator
* Real-time monitoring

---

## 43. Final Product Message

Public message:

“AI risk depends on the tools your team uses, the data entering those tools, and the controls around usage. Vyken’s AI Risk Assessment helps organizations identify governance, data exposure, auditability, and agentic AI risks before they become bigger problems.”

Sales bridge:

“The assessment shows where AI governance risk may exist. Vyken Guard helps organizations move from AI policy to real visibility, enforcement, and audit evidence.”

---

## 44. Definition of Done

The MVP is done when a user can:

1. Visit the assessment page.
2. Provide basic company context.
3. Select multiple AI tools.
4. Answer practical AI usage and governance questions.
5. Receive a meaningful instant risk summary.
6. Enter email for the full report.
7. Receive a branded PDF report.
8. Click to book a call or explore/register for Vyken Guard.
9. Be stored as a lead.
10. Be visible in admin with useful lead intelligence.
11. Be followed up by Vyken with context.

The MVP is not done if it only calculates a score.

The real deliverable is a serious, framework-informed, lead-generating AI governance assessment asset that builds trust, educates the prospect, identifies practical gaps, and naturally moves them toward Vyken.

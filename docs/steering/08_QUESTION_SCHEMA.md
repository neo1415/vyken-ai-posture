# 08 — Question Schema

## Purpose

Define how assessment questions are represented as structured, data-driven configuration — not hardcoded JSX option lists.

## What it controls

- Question definition format in `src/features/assessment/questions/` (or equivalent)
- Wizard section structure
- Conditional visibility
- Signal triggers per answer option

## Question object schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Stable identifier (e.g., `usage_account_type`) |
| `section` | string | Yes | Wizard section key |
| `label` | string | Yes | Primary question text |
| `short_helper_text` | string? | No | Framework-informed helper below label |
| `input_type` | enum | Yes | See input types below |
| `options` | Option[] | Conditional | For select types |
| `allows_multiple_selection` | boolean | Default false | Multi-select behavior |
| `allows_other` | boolean | Default false | Free-text "Other" option |
| `allows_not_sure` | boolean | Default false | "Not sure" option (often triggers visibility signals) |
| `conditional_visibility` | Rule[]? | No | Show when prior answers match |
| `risk_signals_by_option` | Record<optionValue, signal[]> | Yes | Signals fired when option selected |
| `required` | boolean | Yes | Block progress if unanswered |
| `display_order` | number | Yes | Order within section |

### Option object

```typescript
{
  value: string;
  label: string;
  description?: string;  // card_select helper
  icon_key?: string;
}
```

## Input types

| Type | Use case |
|------|----------|
| `single_select` | Radio list |
| `multi_select` | Checkbox list |
| `card_select` | Large tappable cards (industry, tools) |
| `chip_select` | Compact multi-select chips (data types, teams) |
| `text_optional` | Short optional text ("Other" follow-up) |
| `email` | Work email capture (results step) |
| `boolean` | Yes/No toggle |
| `range_select` | Ordered scale (rare in MVP) |

## Sections (MVP)

1. `company_context` — per `04_COMPANY_PROFILE_MODEL.md`
2. `tool_stack` — multi-tool selection
3. `usage_context` — approval, accounts, teams, use cases
4. `data_exposure` — data types, uploads, transcripts, code
5. `governance` — policy, ownership, vendor review, human review
6. `visibility_auditability` — logging, enforcement, incidents
7. `agentic_coding` — coding assistants, MCP, connected tools (conditional)

## Rule: minimal text input

Questions must be **mostly click/tap based**. Text input limited to company name, optional "Other" fields, and email.

## Example question objects

### Company size

```json
{
  "id": "company_size",
  "section": "company_context",
  "label": "How many employees does your organization have?",
  "input_type": "single_select",
  "options": [
    { "value": "1_10", "label": "1–10" },
    { "value": "11_50", "label": "11–50" },
    { "value": "51_200", "label": "51–200" },
    { "value": "201_1000", "label": "201–1,000" },
    { "value": "1001_5000", "label": "1,001–5,000" },
    { "value": "5000_plus", "label": "5,000+" }
  ],
  "risk_signals_by_option": {
    "1001_5000": ["large_org_baseline"],
    "5000_plus": ["large_org_baseline"]
  },
  "required": true,
  "display_order": 4
}
```

### Industry

```json
{
  "id": "industry",
  "section": "company_context",
  "label": "What industry best describes your organization?",
  "short_helper_text": "Industry context helps tailor risk framing. Do not enter confidential details.",
  "input_type": "card_select",
  "options": [
    { "value": "insurance", "label": "Insurance" },
    { "value": "healthcare", "label": "Healthcare" },
    { "value": "fintech", "label": "Fintech" },
    { "value": "saas", "label": "SaaS / Technology" },
    { "value": "legal", "label": "Legal / Professional Services" },
    { "value": "marketing", "label": "Media / Marketing" }
  ],
  "risk_signals_by_option": {
    "insurance": ["regulated_industry"],
    "healthcare": ["regulated_industry"],
    "fintech": ["regulated_industry"],
    "legal": ["regulated_industry"]
  },
  "required": true,
  "display_order": 3
}
```

### Selected tools

```json
{
  "id": "selected_tools",
  "section": "tool_stack",
  "label": "Which AI tools are used or being considered?",
  "short_helper_text": "Select all that apply. If unsure what employees use, select 'Not sure' — that may indicate a visibility gap.",
  "input_type": "card_select",
  "allows_multiple_selection": true,
  "allows_other": true,
  "allows_not_sure": true,
  "risk_signals_by_option": {
    "not_sure": ["unknown_ai_usage"],
    "other": ["unknown_tool_selected"]
  },
  "required": true,
  "display_order": 1
}
```

### Account type

```json
{
  "id": "account_type",
  "section": "usage_context",
  "label": "What account types are employees using?",
  "input_type": "single_select",
  "options": [
    { "value": "company_managed", "label": "Company-managed accounts" },
    { "value": "personal", "label": "Personal accounts" },
    { "value": "both", "label": "Both" },
    { "value": "not_sure", "label": "Not sure" }
  ],
  "risk_signals_by_option": {
    "personal": ["personal_ai_accounts"],
    "both": ["mixed_account_usage"],
    "not_sure": ["unknown_ai_usage"]
  },
  "required": true,
  "display_order": 3
}
```

### Sensitive data types

```json
{
  "id": "sensitive_data_types",
  "section": "data_exposure",
  "label": "What data may enter prompts, uploads, transcripts, or AI workspaces?",
  "short_helper_text": "Data exposure risk depends on what enters the tool and whether your organization can control retention, deletion, and audit logs.",
  "input_type": "chip_select",
  "allows_multiple_selection": true,
  "allows_not_sure": true,
  "options": [
    { "value": "public_only", "label": "Public information only" },
    { "value": "customer_pii", "label": "Customer personal data" },
    { "value": "claims_kyc", "label": "Claims / KYC / identity data" },
    { "value": "health", "label": "Health / medical data" },
    { "value": "source_code", "label": "Source code" },
    { "value": "secrets", "label": "API keys / secrets / tokens" },
    { "value": "legal_contracts", "label": "Legal / contracts" }
  ],
  "risk_signals_by_option": {
    "customer_pii": ["sensitive_customer_data"],
    "claims_kyc": ["claims_kyc_identity_data"],
    "health": ["health_data"],
    "source_code": ["source_code_exposure"],
    "secrets": ["secrets_exposure"],
    "legal_contracts": ["legal_contract_data"]
  },
  "required": true,
  "display_order": 1
}
```

### AI policy status

```json
{
  "id": "ai_policy_status",
  "section": "governance",
  "label": "Does your organization have an AI usage policy?",
  "input_type": "single_select",
  "options": [
    { "value": "approved", "label": "Yes, approved" },
    { "value": "draft", "label": "Draft / in progress" },
    { "value": "no", "label": "No" },
    { "value": "not_sure", "label": "Not sure" }
  ],
  "risk_signals_by_option": {
    "no": ["no_ai_policy"],
    "draft": ["draft_policy_only"],
    "not_sure": ["no_ai_policy"]
  },
  "required": true,
  "display_order": 1
}
```

### Auditability

```json
{
  "id": "ai_audit_logs",
  "section": "visibility_auditability",
  "label": "Can your organization review logs or evidence of AI tool usage?",
  "input_type": "single_select",
  "options": [
    { "value": "yes", "label": "Yes" },
    { "value": "partial", "label": "Partially" },
    { "value": "no", "label": "No" },
    { "value": "not_sure", "label": "Not sure" }
  ],
  "risk_signals_by_option": {
    "no": ["no_audit_logs"],
    "not_sure": ["no_audit_logs"]
  },
  "required": true,
  "display_order": 1
}
```

### Agentic/coding access

```json
{
  "id": "agent_repo_file_access",
  "section": "agentic_coding",
  "label": "Can AI coding tools or agents access repositories, files, or run commands?",
  "short_helper_text": "Connected AI tools can introduce additional risk when they read files, access repos, or act on internal systems. This assessment flags risk signals but does not scan code or MCP servers.",
  "input_type": "single_select",
  "conditional_visibility": [
    { "question_id": "selected_tools", "includes_any": ["github_copilot", "cursor", "zapier_ai"] }
  ],
  "options": [
    { "value": "yes", "label": "Yes" },
    { "value": "limited", "label": "Limited / not sure" },
    { "value": "no", "label": "No" }
  ],
  "risk_signals_by_option": {
    "yes": ["agent_file_access", "coding_assistant_usage"],
    "limited": ["coding_assistant_usage"]
  },
  "required": false,
  "display_order": 2
}
```

## Do / Do not

**Do:**
- Store questions in versioned data files or database seed.
- Render wizard from schema via shared `QuestionCard` component.
- Centralize option → signal mapping in question definitions.

**Do not:**
- Duplicate option arrays in multiple components.
- Add free-text fields for sensitive data.
- Hardcode business rules only in React components.

## Acceptance criteria

- All MVP sections have complete question definitions.
- Every governance/data question maps signals in `risk_signals_by_option`.
- Wizard validates required questions server-side on submission.

## Related documents

- [04_COMPANY_PROFILE_MODEL.md](./04_COMPANY_PROFILE_MODEL.md)
- [09_SIGNAL_MAPPING.md](./09_SIGNAL_MAPPING.md)
- [17_COMPONENT_RULES.md](./17_COMPONENT_RULES.md)

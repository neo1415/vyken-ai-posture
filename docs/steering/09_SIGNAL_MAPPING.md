# 09 — Signal Mapping

## Purpose

Define how assessment answers become structured risk signals — the input to scoring, findings, and recommendations.

## What it controls

- Signal extraction service logic
- `assessment_risk_signals` table content
- Server-side validation that client cannot forge signals

## Core rules

1. **Signals are calculated server-side** from stored answers + company profile + selected tools.
2. **Client-submitted signals cannot be trusted** as final — reject or recompute on server.
3. Signals are **idempotent** for a given answer set.
4. Multiple signals may fire from one answer; one signal may come from multiple sources.

## Signal extraction pipeline

```
answers + company_profile + selected_tools + tool_profiles
  → signalExtractionService.extract()
  → Signal[] (unique, with metadata)
  → scoringService.score(signals)
  → recommendationService.select(signals)
```

## Canonical signal catalog

| Signal ID | Typical trigger |
|-----------|-----------------|
| `personal_ai_accounts` | Account type = personal |
| `mixed_account_usage` | Account type = both |
| `unknown_ai_usage` | Not sure on tools or accounts |
| `unknown_tool_selected` | Other / unlisted tool |
| `unapproved_tools` | Tools not officially approved |
| `sensitive_customer_data` | Customer personal data selected |
| `employee_data` | Employee data selected |
| `financial_data` | Financial records selected |
| `claims_kyc_identity_data` | Claims/KYC/identity selected |
| `health_data` | Health/medical data selected |
| `legal_contract_data` | Legal/contracts selected |
| `source_code_exposure` | Source code selected |
| `secrets_exposure` | API keys/secrets selected |
| `meeting_transcript_exposure` | Transcripts/meetings yes |
| `file_uploads_enabled` | File uploads yes/sometimes |
| `no_ai_policy` | No AI policy |
| `draft_policy_only` | Draft policy only |
| `no_approved_tool_list` | No approved tool list |
| `no_ai_owner` | No governance owner |
| `no_vendor_review` | No vendor review process |
| `no_human_review` | No human review for sensitive use |
| `no_audit_logs` | No audit logs |
| `no_enforcement` | No enforcement controls |
| `no_incident_process` | No incident process |
| `regulated_industry` | Industry modifier from profile |
| `large_company_low_maturity` | Large org + weak governance signals |
| `coding_assistant_usage` | Coding tool selected + dev questions |
| `mcp_usage` | MCP or connected automation selected |
| `agent_file_access` | Agent can access files/repos |
| `agent_command_execution` | Agent can run commands |
| `connected_tool_access` | Connected to APIs/drives/systems |
| `no_code_review_gate` | No code review for AI-generated code |
| `decision_influence` | AI influences people/customer decisions |

## Example mappings (answer → signal)

| Answer | Signal(s) |
|--------|-----------|
| Personal accounts | `personal_ai_accounts` |
| Both personal and company accounts | `mixed_account_usage` |
| Not sure which tools employees use | `unknown_ai_usage` |
| Customer data in prompts/uploads | `sensitive_customer_data` |
| Claims / KYC data | `claims_kyc_identity_data` |
| Source code | `source_code_exposure` |
| API keys / secrets | `secrets_exposure` |
| No AI policy | `no_ai_policy` |
| Draft policy only | `draft_policy_only` |
| No audit logs | `no_audit_logs` |
| No enforcement | `no_enforcement` |
| Coding assistant in tool stack | `coding_assistant_usage` |
| MCP selected or indicated | `mcp_usage` |
| Tool can run commands | `agent_command_execution` |

## Tool-derived signals

Selected tools augment signals:

| Condition | Signal |
|-----------|--------|
| Tool `coding_assistant_relevance` ≥ medium | `coding_assistant_usage` |
| Tool `agentic_or_connected_tool_relevance` ≥ medium | `connected_tool_access` |
| Tool `supports_meeting_transcripts` + user confirms meeting use | `meeting_transcript_exposure` |
| Unknown/low confidence tool + sensitive data signals | Escalation flag in scoring (not separate signal required) |

## Compound escalation (scoring input)

These combinations increase severity in `10_SCORING_MODEL.md` — may add implicit escalation metadata:

- `personal_ai_accounts` + any sensitive data signal
- `no_audit_logs` + `no_enforcement` + sensitive data
- `unknown_tool_selected` + `sensitive_customer_data`
- `regulated_industry` + `no_ai_policy`
- `coding_assistant_usage` + `secrets_exposure` + `no_code_review_gate`

## Signal record shape (persistence)

```typescript
{
  signal_id: string;
  session_id: string;
  source_question_id?: string;
  source_value?: string;
  derived_from: 'answer' | 'profile' | 'tool' | 'compound';
  created_at: timestamp;
}
```

## Do / Do not

**Do:**
- Recompute signals on final submission, not only on client blur.
- Log signal derivation for debugging (admin/server only).
- Unit test mapping tables against `08_QUESTION_SCHEMA.md` examples.

**Do not:**
- Accept `signals[]` from client POST body as authoritative.
- Create signals in React `useEffect` for scoring purposes.
- Add signals without updating `05_RISK_TAXONOMY.md` alignment.

## Acceptance criteria

- 100% of question `risk_signals_by_option` entries have extraction tests.
- Submission endpoint recomputes signals from answers.
- Client preview (if any) labeled non-authoritative.

## Related documents

- [08_QUESTION_SCHEMA.md](./08_QUESTION_SCHEMA.md)
- [10_SCORING_MODEL.md](./10_SCORING_MODEL.md)
- [11_RECOMMENDATION_LIBRARY.md](./11_RECOMMENDATION_LIBRARY.md)
- [15_SECURITY_STANDARD.md](./15_SECURITY_STANDARD.md)

# 02 — Product Scope

## Purpose

Define exactly what ships in MVP, what is deferred, and hard scope boundaries to prevent creep.

## What it controls

- Feature inclusion/exclusion for every module
- Roadmap priorities
- Acceptance boundaries for implementation reviews

## MVP must-have features

| Feature | Description |
|---------|-------------|
| Landing page | Public homepage with value prop, trust line, CTA to start assessment |
| Company profile | Required context fields per `04_COMPANY_PROFILE_MODEL.md` |
| Multi-tool selector | Search, categories, logos, multi-select, "Other," "Not sure" |
| AI tool profile database | Seeded curated tools per `07_TOOL_PROFILE_SCHEMA.md` |
| Assessment wizard | Multi-step, mostly click-based questions per `08_QUESTION_SCHEMA.md` |
| Data exposure questions | Sensitive data types, uploads, transcripts, code/secrets |
| Governance questions | Policy, approved tools, ownership, vendor review, human review |
| Visibility/auditability questions | Logging, enforcement, incident response |
| Agentic/coding risk screen | Coding assistants, MCP, connected tools, command access |
| Server-side scoring | Per `10_SCORING_MODEL.md`; never client-authoritative |
| Instant result page | Risk summary, drivers, maturity, recommendation preview |
| Email capture | Work email required for PDF delivery |
| Branded PDF report | Per `12_REPORT_ENGINE.md` |
| Email delivery | Send report to user; track delivery events |
| Internal lead notification | Notify Vyken when assessment completes |
| Admin lead dashboard | View leads, scores, notes, events |
| Unknown tool request | User can request tools not in database |
| CTA tracking basics | Track clicks on book call, Guard, registration CTAs |

## Should-have features (MVP if time permits)

- Tool profile confidence display on result page
- Lead qualification score visible in admin only
- Basic admin filtering/sorting on leads table
- Retry logic for failed email delivery
- Rate limiting on public submission endpoints

## Not-MVP features

| Feature | Reason deferred |
|---------|-----------------|
| Live AI monitoring | Different product category |
| Browser extension | Integration complexity |
| Full customer dashboard | Enterprise SaaS scope |
| Live AI vendor scraping | Accuracy and legal risk |
| Legal certification output | Product boundary |
| Full ISO 42001 audit | Consulting engagement scope |
| Full EU AI Act classification | Legal determination required |
| MCP scanning | Technical scanning out of scope |
| GitHub scanning | Technical scanning out of scope |
| Subscription/payment | Lead gen first |
| Multi-language reports | English MVP first |
| SSO for admin | Email/password or magic link MVP |
| Public API | Internal use only MVP |

## Future roadmap (post-MVP)

1. Deeper vendor review module
2. MCP/agentic security assessment path
3. GitHub/code repository risk signals
4. Expanded tool database with admin workflow
5. Custom assessment paths by industry
6. Integration with Vyken Guard onboarding
7. AI Risk Index content cross-linking
8. Multi-language support
9. Advanced admin analytics

## Scope boundaries

### In scope for assessment logic

- Self-reported answers → signals → scores → recommendations → report
- Curated tool profiles with versioned, confidence-rated public info
- Framework-informed findings and action plans

### Out of scope for assessment logic

- Proving what employees actually use AI for
- Verifying vendor policy compliance
- Scanning infrastructure, code, or connected systems
- Legal classification under EU AI Act or other regulations

## Do / Do not

**Do:**
- Build MVP must-haves before should-haves.
- Flag scope expansion requests to human review.
- Keep wizard completion under ~10 minutes.

**Do not:**
- Add monitoring, scanning, or payment without explicit module PRD.
- Build admin features beyond lead intelligence in MVP.
- Create a full policy generator (starter checklist only).

## Acceptance criteria

- Every implemented feature maps to must-have or approved should-have.
- No not-MVP feature ships without scope change approval.
- Module completion reports cite which scope items were satisfied.

## Related documents

- [01_PROJECT_BRIEF.md](./01_PROJECT_BRIEF.md)
- [20_MODULE_DONE_CRITERIA.md](./20_MODULE_DONE_CRITERIA.md)
- Master PRD sections 5–6, module breakdown

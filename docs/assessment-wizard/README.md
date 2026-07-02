# Assessment Wizard (Module 7)

The assessment wizard collects structured answers about usage context, data exposure, governance controls, visibility/enforcement, and conditional agentic/coding risk.

## Route

`/ai-risk-assessment/usage?session=<public_token>`

## Sections

1. **Usage context** — 6 questions
2. **Data exposure** — 4 questions
3. **Governance controls** — 6 questions
4. **Visibility & enforcement** — 5 questions
5. **Agentic/coding risk** — 7 questions (conditional)

## Question schema

Questions are defined in `src/features/assessment-wizard/questions.ts`. UI components read from this data — options are not hardcoded in JSX.

## Conditional agentic logic

`agentic-trigger.ts` determines whether section G is required based on:

- Selected tool categories (`coding_assistant`, `automation_agent`)
- Tool profile relevance flags
- Answers to `main_ai_tasks`, `data_entering_ai`, and `developer_workflows_involved`

The client previews section visibility; the server action re-runs the same logic before save.

## Answer persistence

Answers save to `assessment_answers` with `question_id`, `section_id`, `answer_type`, and `answer_value` (JSON). Re-submission replaces all answers for the session in a transaction.

Extra agentic answers submitted when the section is not required are ignored server-side.

## Next step

On success, users redirect to `/ai-risk-assessment/results?session=<token>` (placeholder until Module 8/10).

## Out of scope

Scoring, signals, findings, recommendations, reports, leads, email, PDF, admin, and auth.

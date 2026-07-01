# Tool Selector (Module 6)

The multi-tool selector is the second assessment step after company profile. Users choose workplace AI tools from published profiles, add unknown tools, or indicate they are not sure what employees use.

## Route

`/ai-risk-assessment/tools?session=<public_token>`

## Selection types

### Known tools

- Loaded server-side from active published `ai_tool_profile_versions`.
- Users may select up to 15 tools.
- Stored in `assessment_selected_tools` with `selection_type = known_tool`, including `tool_id` and `tool_profile_version_id` resolved server-side.

### Unknown tools

- Up to 3 not-listed tools with required name and optional URL.
- Stored in `assessment_selected_tools` with `selection_type = unknown_tool`.
- Also creates `unknown_tool_requests` with `status = new` for admin review.

### Not sure

- Optional alongside known/unknown selections.
- Stored as `selection_type = not_sure` with no tool reference.

## Client/server boundary

- The page is a Server Component: validates session token, confirms company profile exists, loads safe `AssessmentToolOption` data.
- `ToolSelectorWizard` is a Client Component for search, filters, and selection state.
- Submission uses a Server Action with Zod validation and DB verification.

## Profile versioning

Known tool selections store the published profile version ID at selection time so later profile updates do not change historical assessment context.

## Re-submission

Submitting again replaces all `assessment_selected_tools` and `unknown_tool_requests` for the session in a single transaction.

## Next step

On success, users redirect to `/ai-risk-assessment/usage?session=<token>` (Module 7 placeholder).

## Out of scope

Scoring, signals, recommendations, reports, leads, email, PDF, admin, and auth are not built in this module.

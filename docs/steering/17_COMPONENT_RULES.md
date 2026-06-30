# 17 — Component Rules

## Purpose

Define component quality standards so UI stays reusable, typed, accessible, and free of misplaced business logic.

## What it controls

- React component structure
- Server vs client component choice
- Props typing and composition
- Code review quality bar

## Component principles

1. **Reusable** — Extract patterns used twice or more.
2. **Typed props** — TypeScript interfaces for all public components.
3. **No business rules in UI** — Scoring, signals, recommendations live in server services.
4. **Schema-driven assessment UI** — `QuestionCard` renders from `08_QUESTION_SCHEMA.md`.
5. **Small client components** — Minimize `"use client"` surface area.

## State and effects

| Rule | Guidance |
|------|----------|
| Avoid unnecessary `useEffect` | Prefer event handlers and server data |
| Avoid unnecessary `useState` | Derive from props where possible |
| Prefer derived state | `useMemo` only when measurably needed |
| No hidden side effects | API calls only in explicit handlers or server actions |

## Structure rules

- No unused imports.
- No dead props (remove or use).
- No massive JSX blocks — extract subcomponents at ~80 lines.
- No duplicated option lists — import from question schema data.
- No magic strings — use constants from `lib/constants/`.

## Server vs client

```tsx
// Good: Server Component page orchestrates
export default async function ResultsPage({ params }) {
  const data = await getResult(params.id); // server
  return <ResultSummaryCard {...data} />;
}

// Good: Client Component for interaction only
"use client";
export function ToolSelector({ tools, onChange }: ToolSelectorProps) { ... }

// Bad: Client Component with scoring logic
"use client";
function Results() {
  const score = calculateScore(answers); // FORBIDDEN — server only
}
```

## Assessment components

| Component | Responsibility |
|-----------|----------------|
| `QuestionRenderer` | Maps `input_type` to correct input component |
| `QuestionCard` | Layout wrapper with label and helper |
| `WizardShell` | Stepper, navigation, progress |
| `ToolGrid` | Search, filter, multi-select |

Must not embed signal or score calculation.

## Component review checklist

Before merging, answer:

| Question | Pass criteria |
|----------|---------------|
| Can this component be reused? | Yes, or justified one-off |
| Is it too large? | < 250 lines |
| Is state necessary? | Every `useState` justified |
| Is effect necessary? | Every `useEffect` justified |
| Is logic misplaced? | Business logic in server layer |
| Are props typed? | Exported interface exists |
| Is accessibility covered? | Focus, labels, headings |

## Do / Do not

**Do:**
- Co-locate component tests only when they test real behavior (if requested).
- Use `children` composition for layout flexibility.
- Forward refs on interactive primitives when needed.

**Do not:**
- Fetch sensitive data in client components without good reason.
- Pass entire database rows as props to UI — map to view models.
- Create `index.tsx` re-export barrels that obscure imports (optional team preference — avoid if circular deps).

## Acceptance criteria

- UI module components pass review checklist.
- No component imports from `server/` directories.
- Question types shared between schema and renderer.

## Related documents

- [14_ARCHITECTURE.md](./14_ARCHITECTURE.md)
- [16_DESIGN_SYSTEM.md](./16_DESIGN_SYSTEM.md)
- [08_QUESTION_SCHEMA.md](./08_QUESTION_SCHEMA.md)
- [19_CODE_REVIEW_CHECKLIST.md](./19_CODE_REVIEW_CHECKLIST.md)

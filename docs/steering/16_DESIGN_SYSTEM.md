# 16 — Design System

## Purpose

Define visual direction, UI primitives, and accessibility baseline for a professional cybersecurity SaaS assessment experience.

## What it controls

- Color, typography, spacing tokens
- Component library scope
- Wizard and PDF visual consistency
- Accessibility requirements

## Visual direction

**Vyken-style cybersecurity SaaS interface:**

| Element | Direction |
|---------|-----------|
| Base | Dark navy / deep blue backgrounds |
| Accents | Cyan / bright blue highlights |
| Text | Clean white primary; muted gray secondary |
| Risk colors | Restrained — amber (moderate), orange (high), red (critical), green (low) — never garish |
| Surfaces | Rounded cards with subtle borders or glow |
| Layout | Multi-step wizard; generous whitespace |
| Tools | Logo cards in grid; recognizable tool branding |
| Mobile | Mobile-first responsive breakpoints |
| PDF | Professional print layout; matches digital brand |

## Design tokens (implementation guidance)

```css
/* Conceptual — implement as CSS variables or Tailwind theme */
--color-bg-primary: #0a1628;      /* deep navy */
--color-bg-card: #111d33;
--color-accent: #00b4d8;          /* cyan */
--color-accent-bright: #48cae4;
--color-text-primary: #f8fafc;
--color-text-muted: #94a3b8;
--color-risk-low: #22c55e;
--color-risk-moderate: #eab308;
--color-risk-high: #f97316;
--color-risk-critical: #ef4444;
--radius-card: 12px;
--radius-button: 8px;
```

## UI primitives

| Component | Purpose |
|-----------|---------|
| `Button` | Primary, secondary, ghost, CTA variants |
| `Card` | Content container with optional header |
| `RiskChip` | Colored rating badge (Low/Moderate/High/Critical) |
| `ToolCard` | Selectable tool with logo, name, category |
| `Stepper` | Wizard step indicator |
| `ProgressIndicator` | Completion percentage bar |
| `QuestionCard` | Question label, helper, input slot |
| `MultiSelectChips` | Chip-based multi-select for data types, teams |
| `ResultSummaryCard` | Overall rating + top drivers on results page |
| `CTAButton` | Prominent Vyken-branded call-to-action |
| `EmptyState` | No tools found, no leads, etc. |
| `ErrorState` | Friendly error with retry |
| `AdminTable` | Sortable lead/tool tables |
| `ReportSection` | PDF section wrapper (digital preview if needed) |

Primitives live in `src/components/ui/` with typed props per `17_COMPONENT_RULES.md`.

## Wizard UX patterns

- One primary question per screen on mobile; grouped on desktop where appropriate.
- Sticky progress stepper at top.
- Back/Continue always visible.
- "Not sure" options styled neutrally — not punitive.
- Helper text collapsible on mobile if long.

## Risk display rules

- Always show **text label** alongside color (not color alone).
- Critical/high findings use icon + label + short description.
- Unknown rating uses neutral gray with explanation.

## Accessibility basics

| Requirement | Implementation |
|-------------|----------------|
| Keyboard reachable controls | All buttons, chips, cards focusable |
| Visible focus states | 2px accent outline, not removed |
| Semantic headings | One h1 per page; logical h2/h3 in wizard |
| Sufficient contrast | WCAG AA minimum for text on backgrounds |
| Screen-reader labels | `aria-label` on icon buttons; `fieldset/legend` for groups |
| No color-only information | Risk labels always include text |

## PDF design

- Cover: Vyken logo, report title, company name, date.
- Body: White background for print; dark header bars for section titles.
- Page numbers and disclaimer footer on each page.
- Charts optional; prefer tables and bullet lists for MVP.

## Do / Do not

**Do:**
- Use design tokens consistently.
- Test wizard on 375px viewport.
- Match result page and PDF rating colors.

**Do not:**
- Use stock "hacker green on black" clichés beyond brand palette.
- Animate excessively (distracts from assessment).
- Rely on tool logos without alt text.

## Acceptance criteria

- All primitives listed exist before assessment UI module ships.
- axe or Lighthouse accessibility scan with no critical issues on wizard.
- Mobile wizard usable without horizontal scroll.

## Related documents

- [17_COMPONENT_RULES.md](./17_COMPONENT_RULES.md)
- [04_COMPANY_PROFILE_MODEL.md](./04_COMPANY_PROFILE_MODEL.md) — UX copy
- [12_REPORT_ENGINE.md](./12_REPORT_ENGINE.md) — PDF sections

# UI Components

Reusable design system primitives for the Vyken AI Risk Assessment Hub.

## Components

| Component                                              | Purpose                                                        | Server-compatible |
| ------------------------------------------------------ | -------------------------------------------------------------- | ----------------- |
| `Button`                                               | Actions (`primary`, `secondary`, `outline`, `ghost`, `danger`) | Yes               |
| `LinkButton`                                           | Navigation styled as buttons; safe external links              | Yes               |
| `Card` (+ Header, Title, Description, Content, Footer) | Content surfaces                                               | Yes               |
| `Badge`                                                | Status labels                                                  | Yes               |
| `RiskChip`                                             | Risk level with text + dot (not color-only)                    | Yes               |
| `SectionHeader`                                        | Page section titles with optional eyebrow/actions              | Yes               |
| `CTAGroup`                                             | Primary/secondary CTA layout                                   | Yes               |
| `Stepper`                                              | Wizard step indicator shell (`aria-current="step"`)            | Yes               |
| `ProgressIndicator`                                    | Accessible progress bar (`role="progressbar"`)                 | Yes               |
| `ToolCard`                                             | AI tool card visual shell (display-only selection)             | Yes               |
| `QuestionCard`                                         | Assessment question shell                                      | Yes               |
| `EmptyState`                                           | Empty data placeholder                                         | Yes               |
| `ErrorState`                                           | Reusable error UI (`role="alert"`)                             | Yes               |

Import from `@/components/ui` or individual files.

## Server / client expectations

- All UI primitives are **Server Components** by default (no `"use client"`).
- Do not add hooks unless interactivity requires a Client Component wrapper in a feature module.
- Do not import `env.server.ts` into UI components.

## Variant conventions

- Button variants: `primary` | `secondary` | `outline` | `ghost` | `danger`
- Button sizes: `sm` | `md` | `lg`
- Badge variants: `default` | `secondary` | `outline` | `success` | `warning` | `danger` | `info`
- Risk levels: `low` | `moderate` | `high` | `critical` | `unknown`

Shared button classes live in `button-variants.ts`.

## Accessibility rules

- Use semantic `<button>` and `<a>` / `Link` — never clickable divs.
- Risk labels always include visible text.
- Stepper uses `<ol>` and `aria-current="step"` on the current step.
- Progress bar includes `aria-valuenow`, `aria-valuemin`, `aria-valuemax`.
- External links use `rel="noopener noreferrer"`.
- Focus-visible ring uses `--focus-ring` token.

## Usage for future modules

- **Landing page:** `SectionHeader`, `Card`, `CTAGroup`, `LinkButton`
- **Wizard:** `Stepper`, `ProgressIndicator`, `QuestionCard`, `Button`
- **Results:** `RiskChip`, `Card`, `CTAGroup`
- **Admin:** `AdminTableShell` (in `components/admin/`), `Badge`, `EmptyState`

## Do not put in UI components

- Scoring, signals, or recommendation logic
- Database access or Server Actions
- Hardcoded Vyken product URLs (pass via props or constants module)
- Fake vendor claims or lead data
- `dangerouslySetInnerHTML`

Design tokens are defined in `src/app/globals.css`.

# Accessibility Notes

## Forms

- All form inputs use `htmlFor`/`id` pairing
- `aria-invalid` set on invalid fields
- `aria-describedby` links inputs to error messages
- Error messages use `role="alert"`
- Required fields marked with `required` and visual indicator
- `autoComplete` attributes on login and lead capture forms

## Tables

- All table headers use `scope="col"`
- Tables wrapped in `overflow-x-auto` for horizontal scroll on narrow screens
- Empty state rows use `colSpan` to fill the table width

## Status Chips / Badges

- `RiskChip` uses `aria-hidden="true"` on decorative color dots
- Risk level always includes text label (never color alone)
- Status badges are inline text — no special aria needs

## Focus States

- Button component: `focus-visible:ring-2 focus-visible:ring-offset-2`
- Admin filter inputs/selects: `focus:ring-2 focus:ring-primary/30`
- Login form inputs: `focus:ring-2 focus:ring-primary/30`
- Root error page button: `focus-visible:ring-2`
- Admin error page button: `focus-visible:ring-2`
- Option cards: `has-[:focus-visible]` outline on wrapper

## Navigation

- `aria-label` on all `<nav>` elements
- `aria-current="page"` on active admin nav links
- Semantic `<header>`, `<main>`, `<footer>` landmarks

## Progress Indicators

- `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- `aria-live="polite"` on step counters
- Screen-reader-only descriptions for meter elements

## Mobile Behavior

- Responsive grids (`sm:grid-cols-2`, `xl:grid-cols-3`)
- `flex-col-reverse` for mobile-first button ordering
- Wizard scroll-to-top on step transitions
- Tables use horizontal scroll (not hidden columns)

## Known Limitations

- No skip-to-content link (acceptable for MVP)
- No focus trap in admin forms (no modals exist)
- No `prefers-reduced-motion` media query on spinner animations (CSS-only, minimal motion)

# Review Notes

## Public Flow UX

- Company profile wizard: multi-step with progress, validation, scroll-to-top on step change
- Tool selector: search/filter with empty states, category buttons with aria-pressed
- Assessment wizard: section-based with progress, validation, scroll-to-top
- Results page: clear hierarchy (hero → categories → findings → recommendations → CTA)
- Lead capture: inline on results page, clear consent, duplicate-submit prevention

## Admin UX

- Login: clear error messages, rate-limited, no email existence leak
- Navigation: active state highlighted with aria-current, role badge visible
- Leads table: sortable filters, status chips, email event detail
- Tool admin: filter bar, status chips, version history, publish warnings
- Empty states: handled for empty lead/tool lists

## Loading/Error States

- `loading.tsx` on public async routes (tools, usage, results) — spinner + message
- `loading.tsx` on admin protected group — spinner
- Admin-specific `error.tsx` with retry + navigation back to dashboard
- Root `error.tsx` as global fallback

## Mobile/Responsive

- All public forms use responsive grids and mobile-first button ordering
- Admin tables use `overflow-x-auto` with minimum widths
- Filters use responsive grid layouts
- Navigation wraps gracefully on narrow screens

## Bundle Review

- Results components are Server Components (no client JS)
- Client Components limited to interactive forms and wizards
- No heavy third-party libraries in client bundles
- Tailwind CSS handles all styling (no runtime CSS-in-JS)

## Security Regression Check

- No new client imports of server modules
- No signed URLs or public bucket access added
- No RBAC changes
- No scoring/recommendation logic changes
- Security headers remain intact from Module 18B

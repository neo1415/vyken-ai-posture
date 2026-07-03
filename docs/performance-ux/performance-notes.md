# Performance Notes

## Bundle Observations

- Public flow pages are Server Components (tools, usage, results) — no client JS for rendering
- Client Components limited to interactive forms: CompanyProfileWizard, ToolSelectorWizard, AssessmentWizard, LeadCaptureForm, TrackedCTA, ResultFollowUpCTA
- Admin filters and action forms are Client Components (necessary for `useActionState`, router push)
- Results display components (FindingCard, RecommendationCard, CategoryScoreCard, etc.) are all Server Components — zero client bundle impact

## Server/Client Component Decisions

| Component | Type | Reason |
|-----------|------|--------|
| CompanyProfileWizard | Client | Multi-step local state, form validation |
| ToolSelectorWizard | Client | Search/filter state, selection state |
| AssessmentWizard | Client | Multi-section navigation, answer state |
| LeadCaptureForm | Client | useActionState for pending UI |
| TrackedCTA / ResultFollowUpCTA | Client | useActionState for tracking |
| AdminLeadFilters / ToolAdminFilters | Client | Router push, search params |
| AdminLeadActions | Client | useActionState for inline actions |
| All results components | Server | Pure presentation, no interactivity |
| All admin tables | Server | Data display only |
| AdminShell | Server | Static layout with session prop |

## Known Limitations

- No streaming/partial rendering within individual pages (all-or-nothing loading)
- In-memory rate limiter does not persist across serverless cold starts
- Admin tables load full dataset per page (pagination exists but no infinite scroll)
- No image optimization needed (no user-uploaded images in current scope)

## What Not to Over-Optimize

- Do not add React.lazy/dynamic imports for small components
- Do not add virtual scrolling for admin tables (pagination is sufficient at MVP scale)
- Do not add service workers or offline support
- Do not add prefetching beyond Next.js default link prefetch

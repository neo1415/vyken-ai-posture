# Leads Feature

Lead capture on the assessment result page (Module 11).

## Belongs here

- Lead capture form UI (`LeadCaptureForm`, `LeadCaptureCard`)
- Server action (`submitLeadCapture`)
- Validation schemas and constants

## Does not belong here

- Lead persistence (use `src/server/repositories/leads.repository.ts`)
- Business orchestration (use `src/server/services/lead-capture.service.ts`)
- Report generation, email delivery, admin dashboard (later modules)

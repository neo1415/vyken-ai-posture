# Module 14 — Email Provider Notes

## Provider abstraction

Email sending goes through `EmailProvider` (`src/server/email/email-provider.ts`):

```typescript
interface EmailProvider {
  readonly name: string;
  sendEmail(input: SendEmailInput): Promise<SendEmailResult>;
}
```

## Development provider

`DevEmailProvider` (`src/server/email/dev-email-provider.ts`) writes outbound messages to:

```
storage/emails-dev/
```

Each send creates:

- `{timestamp}-{recipient}.json` — metadata (subject, attachment filenames)
- `{timestamp}-{recipient}-{filename}` — attachment files when present

This provider has **no** `server-only` import and is safe for verification scripts.

## Production provider

`ResendEmailProvider` (`src/server/email/resend-email-provider.ts`) is selected when:

- `EMAIL_PROVIDER=resend`, or
- `RESEND_API_KEY` is set

## Provider selection

`getEmailProvider()` in `src/server/email/get-email-provider.ts`:

| Environment | Configuration | Provider |
| ----------- | ------------- | -------- |
| Development (default) | No Resend key | `DevEmailProvider` |
| Production | Resend configured | `ResendEmailProvider` |
| Production | No provider | Throws `EmailProviderConfigurationError` |

## Environment variables

| Variable | Purpose |
| -------- | ------- |
| `EMAIL_PROVIDER` | `resend` (optional override) |
| `EMAIL_FROM` | From address (default: `Vyken Security <reports@vyken.security>`) |
| `RESEND_API_KEY` | Resend API key (server-only) |
| `VYKEN_INTERNAL_LEAD_EMAIL` | Internal notification recipient |
| `INTERNAL_NOTIFICATION_EMAIL` | Fallback internal recipient |

## Internal notification recipient

Resolved by `resolveInternalRecipientEmail()`:

1. `VYKEN_INTERNAL_LEAD_EMAIL`
2. `INTERNAL_NOTIFICATION_EMAIL` (from server env)
3. Default: `internal-leads@vyken.security`

## Attachments

Only the user report email includes an attachment:

- Filename: `ai-governance-risk-report.pdf`
- Content-Type: `application/pdf`
- Source: server-side download from Supabase Storage

Internal notification emails are HTML/text only.

## Event logging

Every send attempt creates an `email_events` row with:

- `email_type` — `user_report` or `internal_notification`
- `status` — `sent` or `failed`
- `provider` — provider name (`dev`, `resend`, etc.)
- `provider_message_id` — provider reference when available

## Verification

`pnpm verify:module14` uses `DevEmailProvider` and confirms both emails send, events persist, and duplicate protection works.

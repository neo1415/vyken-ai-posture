import "server-only";

import { z } from "zod";

const optionalNonEmptyString = z
  .string()
  .optional()
  .transform((value) => (value === "" ? undefined : value));

/**
 * Server-only environment variables.
 * Import only from Server Components, Route Handlers, or server services.
 */
const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: optionalNonEmptyString,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalNonEmptyString,
  SUPABASE_SERVICE_ROLE_KEY: optionalNonEmptyString,
  DATABASE_URL: optionalNonEmptyString,
  RESEND_API_KEY: optionalNonEmptyString,
  POSTMARK_API_KEY: optionalNonEmptyString,
  SENDGRID_API_KEY: optionalNonEmptyString,
  REPORT_STORAGE_BUCKET: optionalNonEmptyString,
  INTERNAL_NOTIFICATION_EMAIL: optionalNonEmptyString,
  EMAIL_FROM: optionalNonEmptyString,
  EMAIL_PROVIDER: optionalNonEmptyString,
  VYKEN_INTERNAL_LEAD_EMAIL: optionalNonEmptyString,
  ADMIN_DASHBOARD_KEY: optionalNonEmptyString,
  BOOK_CALL_URL: optionalNonEmptyString,
  VYKEN_GUARD_URL: optionalNonEmptyString,
  VYKEN_REGISTRATION_URL: optionalNonEmptyString,
  AI_RISK_INDEX_URL: optionalNonEmptyString,
});

function parseServerEnv() {
  const parsed = serverEnvSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    POSTMARK_API_KEY: process.env.POSTMARK_API_KEY,
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
    REPORT_STORAGE_BUCKET: process.env.REPORT_STORAGE_BUCKET,
    INTERNAL_NOTIFICATION_EMAIL: process.env.INTERNAL_NOTIFICATION_EMAIL,
    EMAIL_FROM: process.env.EMAIL_FROM,
    EMAIL_PROVIDER: process.env.EMAIL_PROVIDER,
    VYKEN_INTERNAL_LEAD_EMAIL: process.env.VYKEN_INTERNAL_LEAD_EMAIL,
    ADMIN_DASHBOARD_KEY: process.env.ADMIN_DASHBOARD_KEY,
    BOOK_CALL_URL: process.env.BOOK_CALL_URL,
    VYKEN_GUARD_URL: process.env.VYKEN_GUARD_URL,
    VYKEN_REGISTRATION_URL: process.env.VYKEN_REGISTRATION_URL,
    AI_RISK_INDEX_URL: process.env.AI_RISK_INDEX_URL,
  });

  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid server environment configuration:\n${message}`);
  }

  return parsed.data;
}

export const serverEnv = parseServerEnv();

export type ServerEnv = z.infer<typeof serverEnvSchema>;

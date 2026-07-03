import "server-only";

import { serverEnv } from "@/lib/config/env.server";
import { DevEmailProvider } from "@/server/email/dev-email-provider";
import type { EmailProvider } from "@/server/email/email-provider";
import { ResendEmailProvider } from "@/server/email/resend-email-provider";

export class EmailProviderConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailProviderConfigurationError";
  }
}

export function resolveEmailFromAddress(): string {
  return (
    process.env.EMAIL_FROM?.trim() || "Vyken Security <reports@vyken.security>"
  );
}

export function resolveInternalRecipientEmail(): string {
  return (
    process.env.VYKEN_INTERNAL_LEAD_EMAIL?.trim() ||
    serverEnv.INTERNAL_NOTIFICATION_EMAIL?.trim() ||
    "internal-leads@vyken.security"
  );
}

export function getEmailProvider(): EmailProvider {
  const provider = process.env.EMAIL_PROVIDER?.trim().toLowerCase();

  if (provider === "resend" || serverEnv.RESEND_API_KEY) {
    if (!serverEnv.RESEND_API_KEY) {
      throw new EmailProviderConfigurationError(
        "RESEND_API_KEY is required when EMAIL_PROVIDER=resend.",
      );
    }
    return new ResendEmailProvider(
      serverEnv.RESEND_API_KEY,
      resolveEmailFromAddress(),
    );
  }

  if (serverEnv.NODE_ENV === "production") {
    throw new EmailProviderConfigurationError(
      "No production email provider configured. Set EMAIL_PROVIDER and provider credentials.",
    );
  }

  return new DevEmailProvider();
}

import { z } from "zod";

import { isValidPublicTokenFormat } from "@/lib/security/public-token";

import {
  ADMIN_AUDIT_ACTIONS,
  ALLOWED_EVENT_METADATA_KEYS,
  CLIENT_CTA_DESTINATIONS,
  CTA_DESTINATION_TO_EVENT,
  CTA_LABEL_MAX_LENGTH,
  EVENT_METADATA_MAX_BYTES,
  LEAD_EVENT_TYPES,
  PUBLIC_ASSESSMENT_EVENT_ACTIONS,
  SOURCE_PAGE_ALLOWLIST,
  SOURCE_PAGE_MAX_LENGTH,
} from "./constants";
import type { SafeEventMetadata } from "./types";

export class EventTrackingValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EventTrackingValidationError";
  }
}

const publicTokenSchema = z
  .string()
  .trim()
  .refine((value) => isValidPublicTokenFormat(value), {
    message: "Invalid assessment reference.",
  });

const safeLabel = z
  .string()
  .trim()
  .max(CTA_LABEL_MAX_LENGTH)
  .refine((value) => !/<script|javascript:/i.test(value), {
    message: "Invalid characters in label.",
  });

export function sanitizeEventMetadata(
  metadata: Record<string, unknown> | undefined,
): SafeEventMetadata | null {
  if (!metadata) {
    return null;
  }

  const sanitized: SafeEventMetadata = {};

  for (const key of ALLOWED_EVENT_METADATA_KEYS) {
    const value = metadata[key];
    if (value === undefined) {
      continue;
    }
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      if (typeof value === "string" && /<script|javascript:/i.test(value)) {
        throw new EventTrackingValidationError("Invalid metadata value.");
      }
      sanitized[key] = value;
    }
  }

  const serialized = JSON.stringify(sanitized);
  if (serialized.length > EVENT_METADATA_MAX_BYTES) {
    throw new EventTrackingValidationError("Metadata is too large.");
  }

  if (Object.keys(sanitized).length === 0) {
    return null;
  }

  return sanitized;
}

export const trackCtaClickSchema = z.object({
  publicToken: publicTokenSchema,
  destination: z.enum(CLIENT_CTA_DESTINATIONS),
  sourcePage: z.enum(SOURCE_PAGE_ALLOWLIST),
  ctaLabel: safeLabel.optional(),
});

export const trackPublicEventSchema = z.object({
  publicToken: publicTokenSchema,
  action: z.enum(PUBLIC_ASSESSMENT_EVENT_ACTIONS),
});

export function parseTrackCtaClickFormData(formData: FormData) {
  return trackCtaClickSchema.parse({
    publicToken: formData.get("publicToken"),
    destination: formData.get("destination"),
    sourcePage: formData.get("sourcePage"),
    ctaLabel: formData.get("ctaLabel") ?? undefined,
  });
}

export function parseRequestReportEmailFormData(formData: FormData) {
  return z
    .object({
      publicToken: publicTokenSchema,
    })
    .parse({
      publicToken: formData.get("publicToken"),
    });
}

export function mapClientDestinationToCtaEvent(
  destination: z.infer<typeof trackCtaClickSchema>["destination"],
) {
  return CTA_DESTINATION_TO_EVENT[destination];
}

export function validateLeadEventType(
  eventType: string,
): eventType is (typeof LEAD_EVENT_TYPES)[number] {
  return (LEAD_EVENT_TYPES as readonly string[]).includes(eventType);
}

export function validatePublicAssessmentAction(
  action: string,
): action is (typeof PUBLIC_ASSESSMENT_EVENT_ACTIONS)[number] {
  return (PUBLIC_ASSESSMENT_EVENT_ACTIONS as readonly string[]).includes(
    action,
  );
}

export function validateAdminAuditAction(
  action: string,
): action is (typeof ADMIN_AUDIT_ACTIONS)[number] {
  return (ADMIN_AUDIT_ACTIONS as readonly string[]).includes(action);
}

export function validateSourcePage(
  page: string,
): page is (typeof SOURCE_PAGE_ALLOWLIST)[number] {
  return (SOURCE_PAGE_ALLOWLIST as readonly string[]).includes(page);
}

export function validateCtaDestination(
  destination: string,
): destination is (typeof CLIENT_CTA_DESTINATIONS)[number] {
  return (CLIENT_CTA_DESTINATIONS as readonly string[]).includes(destination);
}

export function assertMetadataSize(metadata: SafeEventMetadata | null): void {
  if (!metadata) {
    return;
  }
  if (JSON.stringify(metadata).length > EVENT_METADATA_MAX_BYTES) {
    throw new EventTrackingValidationError("Metadata is too large.");
  }
}

export function validateSourcePageLength(sourcePage: string): void {
  if (sourcePage.length > SOURCE_PAGE_MAX_LENGTH) {
    throw new EventTrackingValidationError("Source page value is too long.");
  }
}

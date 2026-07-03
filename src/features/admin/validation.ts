import { z } from "zod";

import { isValidPublicTokenFormat } from "@/lib/security/public-token";

import {
  ADMIN_DEFAULT_LIMIT,
  ADMIN_DEFAULT_PAGE,
  ADMIN_EMAIL_STATUS_FILTER_OPTIONS,
  ADMIN_LEAD_STATUS_OPTIONS,
  ADMIN_MAX_LIMIT,
  ADMIN_MAX_SEARCH_LENGTH,
  ADMIN_RISK_FILTER_OPTIONS,
} from "./constants";

export class AdminValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminValidationError";
  }
}

const searchSchema = z
  .string()
  .trim()
  .max(ADMIN_MAX_SEARCH_LENGTH, "Search query is too long.")
  .optional()
  .transform((value) => (value === "" ? undefined : value));

const adminLeadListFiltersSchema = z.object({
  search: searchSchema,
  riskLevel: z.enum(ADMIN_RISK_FILTER_OPTIONS).optional(),
  emailStatus: z.enum(ADMIN_EMAIL_STATUS_FILTER_OPTIONS).optional(),
  leadStatus: z.enum(ADMIN_LEAD_STATUS_OPTIONS).optional(),
  page: z.coerce.number().int().min(1).default(ADMIN_DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(ADMIN_MAX_LIMIT)
    .default(ADMIN_DEFAULT_LIMIT),
});

const adminLeadStatusSchema = z.object({
  publicToken: z.string().trim().min(1, "Assessment reference is required."),
  status: z.enum(ADMIN_LEAD_STATUS_OPTIONS),
});

const adminEmailActionSchema = z.object({
  publicToken: z.string().trim().min(1, "Assessment reference is required."),
  force: z.boolean().default(false),
});

const adminAccessSchema = z.object({
  adminKey: z.string().trim().min(1, "Admin key is required."),
});

export function validateAdminLeadListFilters(input: unknown) {
  return adminLeadListFiltersSchema.parse(input);
}

export function validateAdminLeadStatusUpdate(input: unknown) {
  const parsed = adminLeadStatusSchema.parse(input);
  if (!isValidPublicTokenFormat(parsed.publicToken)) {
    throw new AdminValidationError("Assessment reference is invalid.");
  }
  return parsed;
}

export function validateAdminEmailAction(input: unknown) {
  const parsed = adminEmailActionSchema.parse(input);
  if (!isValidPublicTokenFormat(parsed.publicToken)) {
    throw new AdminValidationError("Assessment reference is invalid.");
  }
  return parsed;
}

export function validateAdminAccessKey(input: unknown) {
  return adminAccessSchema.parse(input);
}

export function validatePublicTokenForAdmin(publicToken: string): void {
  const token = publicToken.trim();
  if (!isValidPublicTokenFormat(token)) {
    throw new AdminValidationError("Assessment reference is invalid.");
  }
}

export function parseAdminLeadListSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
) {
  const first = (key: string) => {
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value;
  };

  return validateAdminLeadListFilters({
    search: first("search"),
    riskLevel: first("riskLevel"),
    emailStatus: first("emailStatus"),
    leadStatus: first("leadStatus"),
    page: first("page"),
    limit: first("limit"),
  });
}

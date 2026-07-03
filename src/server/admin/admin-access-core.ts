import { createHmac, timingSafeEqual } from "node:crypto";

/** @deprecated Module 18A — replaced by Supabase Auth session cookies */
export const ADMIN_SESSION_COOKIE = "vyken_admin_session";
const SESSION_SALT = "vyken-admin-v1";

export class AdminAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminAccessError";
  }
}

export function allowLegacyAdminKeyAccess(): boolean {
  return process.env.ALLOW_LEGACY_ADMIN_KEY === "true";
}

export function getConfiguredAdminDashboardKey(): string | undefined {
  return process.env.ADMIN_DASHBOARD_KEY?.trim();
}

export function isAdminDashboardConfigured(): boolean {
  return Boolean(getConfiguredAdminDashboardKey());
}

export function deriveAdminSessionToken(adminKey: string): string {
  return createHmac("sha256", adminKey)
    .update(SESSION_SALT)
    .digest("base64url");
}

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

export type LegacyAdminAccessInput = {
  adminKey?: string | null;
  sessionCookie?: string | null;
};

/** Legacy key gate — disabled unless ALLOW_LEGACY_ADMIN_KEY=true */
export function verifyLegacyAdminAccess(
  input: LegacyAdminAccessInput,
): boolean {
  if (!allowLegacyAdminKeyAccess()) {
    return false;
  }

  const configuredKey = getConfiguredAdminDashboardKey();
  if (!configuredKey) {
    return false;
  }

  const expectedToken = deriveAdminSessionToken(configuredKey);

  if (input.sessionCookie && safeCompare(input.sessionCookie, expectedToken)) {
    return true;
  }

  if (input.adminKey && safeCompare(input.adminKey.trim(), configuredKey)) {
    return true;
  }

  return false;
}

export function buildAdminSessionCookieValue(adminKey: string): string {
  return deriveAdminSessionToken(adminKey);
}

/** @deprecated Use verifyLegacyAdminAccess */
export function verifyAdminAccess(input: LegacyAdminAccessInput): boolean {
  return verifyLegacyAdminAccess(input);
}

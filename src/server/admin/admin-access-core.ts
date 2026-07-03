import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "vyken_admin_session";
const SESSION_SALT = "vyken-admin-v1";

export class AdminAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminAccessError";
  }
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

export type AdminAccessInput = {
  adminKey?: string | null;
  sessionCookie?: string | null;
};

export function verifyAdminAccess(input: AdminAccessInput): boolean {
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

import "server-only";

import { cookies } from "next/headers";

import { serverEnv } from "@/lib/config/env.server";

import {
  getAuthenticatedAdmin,
  requireAuthenticatedAdmin,
  AdminAuthError,
} from "./admin-auth";
import {
  ADMIN_SESSION_COOKIE,
  allowLegacyAdminKeyAccess,
} from "./admin-access-core";
import type { AuthenticatedAdmin } from "./admin-permissions";

export {
  ADMIN_SESSION_COOKIE,
  AdminAccessError,
  allowLegacyAdminKeyAccess,
  buildAdminSessionCookieValue,
  deriveAdminSessionToken,
  isAdminDashboardConfigured,
  verifyLegacyAdminAccess,
} from "./admin-access-core";

export {
  AdminAuthError,
  getAuthenticatedAdmin,
  requireAuthenticatedAdmin,
  mapAuthConfigError,
} from "./admin-auth";

export type { AuthenticatedAdmin } from "./admin-permissions";

export async function getAdminAccessFromRequest(input?: {
  adminKey?: string | null;
}): Promise<boolean> {
  const admin = await getAuthenticatedAdmin(input);
  return admin != null;
}

export async function requireAdminAccess(input?: {
  adminKey?: string | null;
}): Promise<AuthenticatedAdmin> {
  return requireAuthenticatedAdmin(input);
}

export async function getAdminSessionFromRequest(input?: {
  adminKey?: string | null;
}): Promise<AuthenticatedAdmin | null> {
  return getAuthenticatedAdmin(input);
}

export function assertAdminDashboardConfiguredForProduction(): void {
  if (serverEnv.NODE_ENV !== "production") {
    return;
  }

  const hasSupabaseAuth =
    Boolean(serverEnv.NEXT_PUBLIC_SUPABASE_URL?.trim()) &&
    Boolean(serverEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim());

  if (!hasSupabaseAuth && !allowLegacyAdminKeyAccess()) {
    throw new AdminAuthError(
      "Admin authentication is not configured for production.",
    );
  }
}

export async function clearLegacyAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: 0,
  });
}

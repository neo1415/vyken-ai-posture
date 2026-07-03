import "server-only";

import { cookies } from "next/headers";

import { serverEnv } from "@/lib/config/env.server";

import {
  AdminAccessError,
  ADMIN_SESSION_COOKIE,
  getConfiguredAdminDashboardKey,
  isAdminDashboardConfigured,
  verifyAdminAccess,
} from "./admin-access-core";

export {
  ADMIN_SESSION_COOKIE,
  AdminAccessError,
  buildAdminSessionCookieValue,
  deriveAdminSessionToken,
  isAdminDashboardConfigured,
  verifyAdminAccess,
} from "./admin-access-core";

export async function getAdminAccessFromRequest(input?: {
  adminKey?: string | null;
}): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE)?.value ?? null;

  return verifyAdminAccess({
    adminKey: input?.adminKey ?? null,
    sessionCookie,
  });
}

export async function requireAdminAccess(input?: {
  adminKey?: string | null;
}): Promise<void> {
  if (serverEnv.NODE_ENV === "production" && !isAdminDashboardConfigured()) {
    throw new AdminAccessError(
      "Admin dashboard is not configured. Set ADMIN_DASHBOARD_KEY.",
    );
  }

  const allowed = await getAdminAccessFromRequest(input);
  if (!allowed) {
    throw new AdminAccessError("Admin access denied.");
  }
}

export function assertAdminDashboardConfiguredForProduction(): void {
  if (
    serverEnv.NODE_ENV === "production" &&
    !getConfiguredAdminDashboardKey()
  ) {
    throw new AdminAccessError(
      "Admin dashboard is not configured. Set ADMIN_DASHBOARD_KEY.",
    );
  }
}

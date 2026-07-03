import "server-only";

import {
  getSupabaseAuthUser,
  isSupabaseAuthConfigured,
  SupabaseAuthConfigError,
} from "@/lib/supabase/auth-server";
import {
  getActiveAdminUserByEmail,
  touchAdminUserLastLogin,
} from "@/server/repositories/admin-users.repository";

import {
  allowLegacyAdminKeyAccess,
  verifyLegacyAdminAccess,
} from "./admin-access-core";
import type { AuthenticatedAdmin } from "./admin-permissions";

export class AdminAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminAuthError";
  }
}

export async function getAuthenticatedAdmin(input?: {
  adminKey?: string | null;
}): Promise<AuthenticatedAdmin | null> {
  if (allowLegacyAdminKeyAccess() && input?.adminKey) {
    if (verifyLegacyAdminAccess({ adminKey: input.adminKey })) {
      return getLegacyDevAdmin();
    }
  }

  if (!isSupabaseAuthConfigured()) {
    return null;
  }

  const authUser = await getSupabaseAuthUser();
  if (!authUser?.email) {
    return null;
  }

  const admin = await getActiveAdminUserByEmail(authUser.email);
  if (!admin) {
    return null;
  }

  void touchAdminUserLastLogin(admin.id);
  return admin;
}

export async function requireAuthenticatedAdmin(input?: {
  adminKey?: string | null;
}): Promise<AuthenticatedAdmin> {
  if (!isSupabaseAuthConfigured() && !allowLegacyAdminKeyAccess()) {
    throw new AdminAuthError(
      "Admin authentication is not configured. Set Supabase Auth environment variables.",
    );
  }

  const admin = await getAuthenticatedAdmin(input);
  if (!admin) {
    throw new AdminAuthError("Admin access denied.");
  }

  return admin;
}

function getLegacyDevAdmin(): AuthenticatedAdmin {
  return {
    id: "00000000-0000-4000-8000-000000000001",
    email: "legacy-dev@vyken.internal",
    fullName: "Legacy Dev Admin",
    role: "superadmin",
    isActive: true,
  };
}

export function mapAuthConfigError(error: unknown): AdminAuthError | null {
  if (error instanceof SupabaseAuthConfigError) {
    return new AdminAuthError(error.message);
  }
  return null;
}

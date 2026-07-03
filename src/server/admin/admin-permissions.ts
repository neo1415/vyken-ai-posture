import type { AdminUserRecord } from "@/server/repositories/admin-users.repository";

export type AuthenticatedAdmin = AdminUserRecord;

export type AdminSessionView = {
  email: string;
  role: AuthenticatedAdmin["role"];
  displayRole: string;
};

const ROLE_LABELS: Record<AuthenticatedAdmin["role"], string> = {
  viewer: "Reviewer",
  editor: "Admin",
  superadmin: "Owner",
};

export function toAdminSessionView(
  admin: AuthenticatedAdmin,
): AdminSessionView {
  return {
    email: admin.email,
    role: admin.role,
    displayRole: ROLE_LABELS[admin.role],
  };
}

export function canViewAdminDashboard(admin: AuthenticatedAdmin): boolean {
  return admin.isActive;
}

export function canManageLeads(admin: AuthenticatedAdmin): boolean {
  return admin.role === "editor" || admin.role === "superadmin";
}

export function canSendReportEmail(admin: AuthenticatedAdmin): boolean {
  return canManageLeads(admin);
}

export function canManageToolProfiles(admin: AuthenticatedAdmin): boolean {
  return admin.role === "editor" || admin.role === "superadmin";
}

export function canPublishToolProfiles(admin: AuthenticatedAdmin): boolean {
  return canManageToolProfiles(admin);
}

export class AdminPermissionError extends Error {
  constructor(message = "You do not have permission to perform this action.") {
    super(message);
    this.name = "AdminPermissionError";
  }
}

export function isAdminPermissionError(
  error: unknown,
): error is AdminPermissionError {
  return error instanceof AdminPermissionError;
}

export function assertPermission(
  allowed: boolean,
  message?: string,
): asserts allowed {
  if (!allowed) {
    throw new AdminPermissionError(message);
  }
}

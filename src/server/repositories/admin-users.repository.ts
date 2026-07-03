import "server-only";

import { eq } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { adminUsers } from "@/lib/db/schema/admin";

export type AdminUserRecord = {
  id: string;
  email: string;
  fullName: string | null;
  role: "viewer" | "editor" | "superadmin";
  isActive: boolean;
};

export async function getActiveAdminUserByEmail(
  email: string,
): Promise<AdminUserRecord | null> {
  const normalized = email.trim().toLowerCase();
  const db = getDb();

  const [row] = await db
    .select({
      id: adminUsers.id,
      email: adminUsers.email,
      fullName: adminUsers.fullName,
      role: adminUsers.role,
      isActive: adminUsers.isActive,
    })
    .from(adminUsers)
    .where(eq(adminUsers.email, normalized))
    .limit(1);

  if (!row || !row.isActive) {
    return null;
  }

  return row;
}

export async function touchAdminUserLastLogin(
  adminUserId: string,
): Promise<void> {
  const db = getDb();
  await db
    .update(adminUsers)
    .set({ lastLoginAt: new Date() })
    .where(eq(adminUsers.id, adminUserId));
}

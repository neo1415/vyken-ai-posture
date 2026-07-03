import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/features/admin-auth/components/AdminLoginForm";
import { getAuthenticatedAdmin } from "@/server/admin/admin-auth";
import { isSupabaseAuthConfigured } from "@/lib/supabase/auth-server";

export default async function AdminLoginPage() {
  const admin = await getAuthenticatedAdmin();
  if (admin) {
    redirect("/admin/leads");
  }

  if (!isSupabaseAuthConfigured()) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-foreground text-sm font-medium">
          Admin authentication is not configured.
        </p>
        <p className="text-muted-foreground text-sm">
          Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then
          create matching admin users in Supabase Auth and admin_users.
        </p>
      </div>
    );
  }

  return <AdminLoginForm />;
}

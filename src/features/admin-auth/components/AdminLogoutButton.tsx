"use client";

import { useTransition } from "react";

import { logoutAdminAction } from "@/features/admin-auth/actions";
import { Button } from "@/components/ui/Button";

export function AdminLogoutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      disabled={pending}
      onClick={() => {
        startTransition(() => {
          void logoutAdminAction();
        });
      }}
    >
      {pending ? "Signing out…" : "Sign out"}
    </Button>
  );
}

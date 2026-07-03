"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { loginAdminAction } from "@/features/admin-auth/actions";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

const initialState = { status: "idle" as const };

export function AdminLoginForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    loginAdminAction,
    initialState,
  );

  useEffect(() => {
    if (state.status === "success") {
      router.replace("/admin/leads");
      router.refresh();
    }
  }, [state.status, router]);

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>Admin sign in</CardTitle>
        <CardDescription>
          Sign in with your Vyken admin account to access leads, reports, and
          tool profiles.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="adminEmail"
              className="text-foreground text-sm font-medium"
            >
              Email
            </label>
            <input
              id="adminEmail"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="border-border bg-background text-foreground focus:ring-primary/30 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="adminPassword"
              className="text-foreground text-sm font-medium"
            >
              Password
            </label>
            <input
              id="adminPassword"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="border-border bg-background text-foreground focus:ring-primary/30 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
            />
          </div>
          {state.status === "error" && state.message ? (
            <p className="text-danger text-sm" role="alert">
              {state.message}
            </p>
          ) : null}
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

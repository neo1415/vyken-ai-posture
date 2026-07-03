"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";

import { authenticateAdminAction } from "@/features/admin/actions";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

const initialState = { status: "idle" as const };

export function AdminAccessGate() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    authenticateAdminAction,
    initialState,
  );

  if (state.status === "success") {
    router.replace("/admin/leads");
    router.refresh();
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Admin access required</CardTitle>
        <CardDescription>
          Enter the admin dashboard key to review assessment leads. This is a
          temporary gate until full authentication is implemented.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="adminKey"
              className="text-foreground text-sm font-medium"
            >
              Admin key
            </label>
            <input
              id="adminKey"
              name="adminKey"
              type="password"
              autoComplete="off"
              required
              className="border-border bg-background text-foreground focus:ring-primary/30 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
            />
          </div>
          {state.status === "error" && state.message ? (
            <p className="text-danger text-sm" role="alert">
              {state.message}
            </p>
          ) : null}
          <Button type="submit" disabled={pending}>
            {pending ? "Verifying…" : "Continue to dashboard"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

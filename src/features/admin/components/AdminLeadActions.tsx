"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  sendReportEmailAction,
  updateLeadStatusAction,
} from "@/features/admin/actions";
import { ADMIN_LEAD_STATUS_OPTIONS } from "@/features/admin/constants";
import { formatLeadStatus } from "@/features/admin/formatters";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

type AdminLeadActionsProps = {
  publicToken: string;
  currentStatus: string;
  emailDeliveryStatus: string;
  consentToFollowUp: boolean;
  hasPdf: boolean;
  canManageLeads: boolean;
};

const initialState = { status: "idle" as const };

export function AdminLeadActions({
  publicToken,
  currentStatus,
  emailDeliveryStatus,
  consentToFollowUp,
  hasPdf,
  canManageLeads,
}: AdminLeadActionsProps) {
  const router = useRouter();
  const [statusState, statusAction, statusPending] = useActionState(
    updateLeadStatusAction,
    initialState,
  );
  const [emailState, emailAction, emailPending] = useActionState(
    sendReportEmailAction,
    initialState,
  );

  useEffect(() => {
    if (statusState.status === "success" || emailState.status === "success") {
      router.refresh();
    }
  }, [statusState.status, emailState.status, router]);

  const canSend =
    canManageLeads &&
    consentToFollowUp &&
    (hasPdf ||
      emailDeliveryStatus === "not_sent" ||
      emailDeliveryStatus === "failed");

  if (!canManageLeads) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Admin actions</CardTitle>
          <CardDescription>
            Your role can view lead details but cannot update status or send
            emails.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin actions</CardTitle>
        <CardDescription>
          Update lead status or trigger report email delivery.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form
          action={statusAction}
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <input type="hidden" name="publicToken" value={publicToken} />
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground font-medium">
              Lead status
            </span>
            <select
              name="status"
              defaultValue={currentStatus}
              className="border-border bg-background text-foreground w-full min-w-[12rem] rounded-lg border px-3 py-2"
            >
              {ADMIN_LEAD_STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {formatLeadStatus(option)}
                </option>
              ))}
            </select>
          </label>
          <Button type="submit" variant="secondary" disabled={statusPending}>
            {statusPending ? "Saving…" : "Update status"}
          </Button>
        </form>
        {statusState.status !== "idle" && statusState.message ? (
          <p
            className={
              statusState.status === "error"
                ? "text-danger text-sm"
                : "text-success text-sm"
            }
            role="status"
          >
            {statusState.message}
          </p>
        ) : null}

        <div className="border-border space-y-3 border-t pt-4">
          <p className="text-muted-foreground text-sm">
            {emailDeliveryStatus === "sent"
              ? "Report email has been sent. Use resend only when you need to deliver again."
              : "Send the report email to the lead when consent is on and the PDF is ready."}
          </p>
          <div className="flex flex-wrap gap-3">
            <form action={emailAction}>
              <input type="hidden" name="publicToken" value={publicToken} />
              <input type="hidden" name="force" value="false" />
              <Button type="submit" disabled={emailPending || !canSend}>
                {emailPending ? "Sending…" : "Send report email"}
              </Button>
            </form>
            {emailDeliveryStatus === "sent" ||
            emailDeliveryStatus === "partial" ? (
              <form action={emailAction}>
                <input type="hidden" name="publicToken" value={publicToken} />
                <input type="hidden" name="force" value="true" />
                <Button
                  type="submit"
                  variant="secondary"
                  disabled={emailPending || !consentToFollowUp}
                >
                  {emailPending ? "Resending…" : "Resend report email"}
                </Button>
              </form>
            ) : null}
          </div>
          {!consentToFollowUp ? (
            <p className="text-warning text-sm">
              Lead consent is off — email delivery is blocked.
            </p>
          ) : null}
          {emailState.status !== "idle" && emailState.message ? (
            <p
              className={
                emailState.status === "error"
                  ? "text-danger text-sm"
                  : "text-success text-sm"
              }
              role="status"
            >
              {emailState.message}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

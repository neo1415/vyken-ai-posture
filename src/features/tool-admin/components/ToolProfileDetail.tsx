"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  publishToolProfileAction,
  toolAdminActionInitialState,
  unpublishToolProfileAction,
} from "@/features/tool-admin/actions";
import {
  formatCommonUseCases,
  formatConfidenceLevel,
} from "@/features/tool-admin/formatters";
import { ToolProfileImpactNotice } from "@/features/tool-admin/components/ToolProfileImpactNotice";
import { ToolProfileStatusChip } from "@/features/tool-admin/components/ToolProfileStatusChip";
import { ToolProfileVersionTable } from "@/features/tool-admin/components/ToolProfileVersionTable";
import type {
  AdminToolDetail,
  AdminToolProfileData,
} from "@/features/tool-admin/types";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import Link from "next/link";

type ToolProfileDetailProps = {
  detail: AdminToolDetail;
};

function ProfileFieldList({ data }: { data: AdminToolProfileData }) {
  const entries: Array<[string, string]> = [
    ["Use cases", formatCommonUseCases(data.commonUseCases)],
    ["File uploads", data.supportsFileUploads ? "Yes" : "No"],
    ["Meeting transcripts", data.supportsMeetingTranscripts ? "Yes" : "No"],
    [
      "Coding assistant relevance",
      data.codingAssistantRelevance ? "Yes" : "No",
    ],
    [
      "Agentic/connected relevance",
      data.agenticOrConnectedToolRelevance ? "Yes" : "No",
    ],
    ["Training use notes", data.trainingUseNotes ?? "—"],
    ["Data retention notes", data.dataRetentionNotes ?? "—"],
    ["Deletion control notes", data.deletionControlNotes ?? "—"],
    ["Enterprise admin controls", data.enterpriseAdminControlsNotes ?? "—"],
    ["Audit logging notes", data.auditLoggingNotes ?? "—"],
    ["Compliance/security docs", data.complianceSecurityDocsNotes ?? "—"],
    ["Subprocessor notes", data.subprocessorNotes ?? "—"],
    ["Sensitive data concerns", data.sensitiveDataConcerns ?? "—"],
    ["Usage boundaries", data.recommendedUsageBoundaries ?? "—"],
  ];

  return (
    <dl className="grid gap-3 text-sm sm:grid-cols-2">
      {entries.map(([label, value]) => (
        <div key={label} className="sm:col-span-2">
          <dt className="text-muted-foreground font-medium">{label}</dt>
          <dd className="mt-1 whitespace-pre-wrap">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ToolProfileDetail({ detail }: ToolProfileDetailProps) {
  const router = useRouter();
  const [publishState, publishAction, publishPending] = useActionState(
    publishToolProfileAction,
    toolAdminActionInitialState,
  );
  const [unpublishState, unpublishAction, unpublishPending] = useActionState(
    unpublishToolProfileAction,
    toolAdminActionInitialState,
  );

  useEffect(() => {
    if (
      publishState.status === "success" ||
      unpublishState.status === "success"
    ) {
      router.refresh();
    }
  }, [publishState.status, unpublishState.status, router]);

  const profile = detail.publishedProfile;
  const draft = detail.draftProfile;

  return (
    <div className="space-y-8">
      <ToolProfileImpactNotice />

      <Card>
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle>{detail.name}</CardTitle>
            <CardDescription className="font-mono">
              {detail.slug}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/admin/tools/${detail.slug}/edit`}
              className="text-primary text-sm font-medium hover:underline"
            >
              Edit profile
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Category</dt>
              <dd>{detail.category}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Tool status</dt>
              <dd>
                <ToolProfileStatusChip status={detail.status} />
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Website</dt>
              <dd>{detail.websiteUrl ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Last updated</dt>
              <dd>
                {detail.updatedAt
                  ? new Date(detail.updatedAt).toLocaleString()
                  : "—"}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Published profile</CardTitle>
          <CardDescription>
            Active profile used by public tool selection when published.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile ? (
            <>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Version</dt>
                  <dd className="font-mono">{profile.versionLabel}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>
                    <ToolProfileStatusChip status={profile.status} />
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Confidence</dt>
                  <dd>{formatConfidenceLevel(profile.confidenceLevel)}</dd>
                </div>
              </dl>
              {profile.reviewNotes ? (
                <p className="text-muted-foreground text-sm">
                  <span className="text-foreground font-medium">
                    Review notes:{" "}
                  </span>
                  {profile.reviewNotes}
                </p>
              ) : null}
              {profile.sourceNotes ? (
                <p className="text-muted-foreground text-sm">
                  <span className="text-foreground font-medium">
                    Source notes:{" "}
                  </span>
                  {profile.sourceNotes}
                </p>
              ) : null}
              <ProfileFieldList data={profile.profileData} />
              <form action={unpublishAction}>
                <input type="hidden" name="toolSlug" value={detail.slug} />
                <Button
                  type="submit"
                  variant="secondary"
                  disabled={unpublishPending}
                >
                  {unpublishPending ? "Archiving…" : "Unpublish profile"}
                </Button>
              </form>
              {unpublishState.message ? (
                <p
                  className={
                    unpublishState.status === "error"
                      ? "text-danger text-sm"
                      : "text-success text-sm"
                  }
                  role="status"
                >
                  {unpublishState.message}
                </p>
              ) : null}
            </>
          ) : (
            <p className="text-muted-foreground text-sm">
              No published profile. Publish a draft when ready.
            </p>
          )}
        </CardContent>
      </Card>

      {draft ? (
        <Card>
          <CardHeader>
            <CardTitle>Draft profile</CardTitle>
            <CardDescription>
              Version {draft.versionLabel} — not visible in public tool
              selection.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form action={publishAction}>
              <input type="hidden" name="toolSlug" value={detail.slug} />
              <input
                type="hidden"
                name="versionLabel"
                value={draft.versionLabel}
              />
              <Button type="submit" disabled={publishPending}>
                {publishPending ? "Publishing…" : "Publish draft"}
              </Button>
            </form>
            {publishState.message ? (
              <p
                className={
                  publishState.status === "error"
                    ? "text-danger text-sm"
                    : "text-success text-sm"
                }
                role="status"
              >
                {publishState.message}
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <ToolProfileVersionTable versions={detail.versions} />
    </div>
  );
}

"use client";

import { useActionState, useEffect } from "react";

import {
  createToolProfileAction,
  toolAdminActionInitialState,
  updateToolProfileAction,
} from "@/features/tool-admin/actions";
import { commonUseCasesToInput } from "@/features/tool-admin/formatters";
import { ToolProfileImpactNotice } from "@/features/tool-admin/components/ToolProfileImpactNotice";
import type {
  AdminToolCategoryOption,
  AdminToolDetail,
} from "@/features/tool-admin/types";
import { CONFIDENCE_LEVELS } from "@/features/tool-profiles/constants";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

type ToolProfileFormProps = {
  mode: "create" | "edit";
  categories: AdminToolCategoryOption[];
  detail?: AdminToolDetail;
};

function fieldClassName() {
  return "border-border bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm";
}

function labelClassName() {
  return "text-muted-foreground text-sm font-medium";
}

export function ToolProfileForm({
  mode,
  categories,
  detail,
}: ToolProfileFormProps) {
  const action =
    mode === "create" ? createToolProfileAction : updateToolProfileAction;
  const [state, formAction, pending] = useActionState(
    action,
    toolAdminActionInitialState,
  );

  useEffect(() => {
    if (state.status === "success" && mode === "edit") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [state.status, mode]);

  const source =
    detail?.draftProfile?.profileData ??
    detail?.publishedProfile?.profileData ??
    null;

  const defaults = {
    slug: detail?.slug ?? "",
    name: detail?.name ?? "",
    categorySlug: detail?.categorySlug ?? categories[0]?.slug ?? "",
    websiteUrl: detail?.websiteUrl ?? "",
    isActive: detail?.status !== "inactive",
    publicInfoConfidenceLevel:
      detail?.draftProfile?.confidenceLevel ??
      detail?.publishedProfile?.confidenceLevel ??
      "unknown",
    reviewNotes:
      detail?.draftProfile?.reviewNotes ??
      detail?.publishedProfile?.reviewNotes ??
      "",
    sourceConfidenceNotes:
      detail?.draftProfile?.sourceNotes ??
      detail?.publishedProfile?.sourceNotes ??
      "",
    commonUseCases: source ? commonUseCasesToInput(source.commonUseCases) : "",
    supportsFileUploads: source?.supportsFileUploads ?? false,
    supportsMeetingTranscripts: source?.supportsMeetingTranscripts ?? false,
    codingAssistantRelevance: source?.codingAssistantRelevance ?? false,
    agenticOrConnectedToolRelevance:
      source?.agenticOrConnectedToolRelevance ?? false,
    publicPrivacyUrl: source?.publicPrivacyUrl ?? "",
    publicSecurityUrl: source?.publicSecurityUrl ?? "",
    publicTrustUrl: source?.publicTrustUrl ?? "",
    trainingUseNotes: source?.trainingUseNotes ?? "",
    dataRetentionNotes: source?.dataRetentionNotes ?? "",
    deletionControlNotes: source?.deletionControlNotes ?? "",
    enterpriseAdminControlsNotes: source?.enterpriseAdminControlsNotes ?? "",
    auditLoggingNotes: source?.auditLoggingNotes ?? "",
    complianceSecurityDocsNotes: source?.complianceSecurityDocsNotes ?? "",
    subprocessorNotes: source?.subprocessorNotes ?? "",
    sensitiveDataConcerns: source?.sensitiveDataConcerns ?? "",
    recommendedUsageBoundaries: source?.recommendedUsageBoundaries ?? "",
  };

  return (
    <div className="space-y-6">
      <ToolProfileImpactNotice />

      <Card>
        <CardHeader>
          <CardTitle>
            {mode === "create" ? "Create tool profile" : "Edit tool profile"}
          </CardTitle>
          <CardDescription>
            {mode === "edit"
              ? "Saving creates or updates a draft version. Publish from the detail page."
              : "New tools start as a draft profile."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-8">
            {mode === "edit" ? (
              <input type="hidden" name="toolSlug" value={detail?.slug ?? ""} />
            ) : null}

            <section className="space-y-4">
              <h3 className="text-foreground font-medium">Tool basics</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {mode === "create" ? (
                  <label className="space-y-1">
                    <span className={labelClassName()}>Slug</span>
                    <input
                      name="slug"
                      required
                      defaultValue={defaults.slug}
                      className={fieldClassName()}
                      placeholder="my-ai-tool"
                    />
                  </label>
                ) : null}
                <label className="space-y-1">
                  <span className={labelClassName()}>Name</span>
                  <input
                    name="name"
                    required
                    defaultValue={defaults.name}
                    className={fieldClassName()}
                  />
                </label>
                <label className="space-y-1">
                  <span className={labelClassName()}>Category</span>
                  <select
                    name="categorySlug"
                    required
                    defaultValue={defaults.categorySlug}
                    className={fieldClassName()}
                  >
                    {categories.map((category) => (
                      <option key={category.slug} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1 sm:col-span-2">
                  <span className={labelClassName()}>Website URL</span>
                  <input
                    name="websiteUrl"
                    type="url"
                    required
                    defaultValue={defaults.websiteUrl}
                    className={fieldClassName()}
                  />
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    name="isActive"
                    type="checkbox"
                    defaultChecked={defaults.isActive}
                  />
                  Active tool
                </label>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-foreground font-medium">Profile metadata</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1">
                  <span className={labelClassName()}>Confidence level</span>
                  <select
                    name="publicInfoConfidenceLevel"
                    defaultValue={defaults.publicInfoConfidenceLevel}
                    className={fieldClassName()}
                  >
                    {CONFIDENCE_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="block space-y-1">
                <span className={labelClassName()}>Review notes</span>
                <textarea
                  name="reviewNotes"
                  rows={3}
                  defaultValue={defaults.reviewNotes}
                  className={fieldClassName()}
                />
              </label>
              <label className="block space-y-1">
                <span className={labelClassName()}>
                  Source confidence notes
                </span>
                <textarea
                  name="sourceConfidenceNotes"
                  rows={3}
                  defaultValue={defaults.sourceConfidenceNotes}
                  className={fieldClassName()}
                />
              </label>
            </section>

            <section className="space-y-4">
              <h3 className="text-foreground font-medium">Capabilities</h3>
              <label className="block space-y-1">
                <span className={labelClassName()}>
                  Common use cases (one per line)
                </span>
                <textarea
                  name="commonUseCases"
                  required
                  rows={4}
                  defaultValue={defaults.commonUseCases}
                  className={fieldClassName()}
                />
              </label>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  ["supportsFileUploads", "Supports file uploads"],
                  [
                    "supportsMeetingTranscripts",
                    "Supports meeting transcripts",
                  ],
                  ["codingAssistantRelevance", "Coding assistant relevance"],
                  [
                    "agenticOrConnectedToolRelevance",
                    "Agentic/connected tool relevance",
                  ],
                ].map(([name, label]) => (
                  <label key={name} className="flex items-center gap-2 text-sm">
                    <input
                      name={name}
                      type="checkbox"
                      defaultChecked={
                        defaults[name as keyof typeof defaults] as boolean
                      }
                    />
                    {label}
                  </label>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-foreground font-medium">Public URLs</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ["publicPrivacyUrl", "Privacy URL"],
                  ["publicSecurityUrl", "Security URL"],
                  ["publicTrustUrl", "Trust URL"],
                ].map(([name, label]) => (
                  <label key={name} className="space-y-1">
                    <span className={labelClassName()}>{label}</span>
                    <input
                      name={name}
                      type="url"
                      defaultValue={
                        defaults[name as keyof typeof defaults] as string
                      }
                      className={fieldClassName()}
                    />
                  </label>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-foreground font-medium">Governance notes</h3>
              {[
                ["trainingUseNotes", "Training use notes"],
                ["dataRetentionNotes", "Data retention notes"],
                ["deletionControlNotes", "Deletion control notes"],
                [
                  "enterpriseAdminControlsNotes",
                  "Enterprise admin controls notes",
                ],
                ["auditLoggingNotes", "Audit logging notes"],
                [
                  "complianceSecurityDocsNotes",
                  "Compliance/security documentation notes",
                ],
                ["subprocessorNotes", "Subprocessor notes"],
                ["sensitiveDataConcerns", "Sensitive data concerns"],
                ["recommendedUsageBoundaries", "Recommended usage boundaries"],
              ].map(([name, label]) => (
                <label key={name} className="block space-y-1">
                  <span className={labelClassName()}>{label}</span>
                  <textarea
                    name={name}
                    required
                    rows={3}
                    defaultValue={
                      defaults[name as keyof typeof defaults] as string
                    }
                    className={fieldClassName()}
                  />
                </label>
              ))}
            </section>

            {state.message ? (
              <p
                className={
                  state.status === "error"
                    ? "text-danger text-sm"
                    : "text-success text-sm"
                }
                role="alert"
              >
                {state.message}
              </p>
            ) : null}

            <Button type="submit" disabled={pending}>
              {pending
                ? "Saving…"
                : mode === "create"
                  ? "Create tool"
                  : "Save draft"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

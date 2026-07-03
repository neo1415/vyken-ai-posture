import "server-only";

import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  or,
  sql,
} from "drizzle-orm";

import type {
  AdminToolCategoryOption,
  AdminToolDetail,
  AdminToolListFilters,
  AdminToolListItem,
  AdminToolListResult,
  AdminToolProfileData,
  ToolProfileFormInput,
} from "@/features/tool-admin/types";
import { INITIAL_PROFILE_VERSION } from "@/features/tool-admin/constants";
import { parseCommonUseCasesInput } from "@/features/tool-admin/formatters";
import { getDb } from "@/lib/db/client";
import {
  aiToolCategories,
  aiToolProfileVersions,
  aiTools,
} from "@/lib/db/schema/ai-tools";
import { auditLogs } from "@/lib/db/schema/audit";

type ProfileRow = typeof aiToolProfileVersions.$inferSelect;

function mapProfileData(profile: ProfileRow): AdminToolProfileData {
  return {
    commonUseCases: profile.commonUseCases ?? [],
    supportsFileUploads: profile.supportsFileUploads,
    supportsMeetingTranscripts: profile.supportsMeetingTranscripts,
    codingAssistantRelevance: profile.codingAssistantRelevance,
    agenticOrConnectedToolRelevance: profile.agenticOrConnectedToolRelevance,
    publicPrivacyUrl: profile.publicPrivacyUrl,
    publicSecurityUrl: profile.publicSecurityUrl,
    publicTrustUrl: profile.publicTrustUrl,
    trainingUseNotes: profile.trainingUseNotes,
    dataRetentionNotes: profile.dataRetentionNotes,
    deletionControlNotes: profile.deletionControlNotes,
    enterpriseAdminControlsNotes: profile.enterpriseAdminControlsNotes,
    auditLoggingNotes: profile.auditLoggingNotes,
    complianceSecurityDocsNotes: profile.complianceSecurityDocsNotes,
    subprocessorNotes: profile.subprocessorNotes,
    sensitiveDataConcerns: profile.sensitiveDataConcerns,
    recommendedUsageBoundaries: profile.recommendedUsageBoundaries,
  };
}

function profileInputToValues(
  input: ToolProfileFormInput,
  profileVersion: string,
  publishedStatus: "draft" | "published" | "archived",
) {
  return {
    profileVersion,
    commonUseCases: parseCommonUseCasesInput(input.commonUseCases),
    supportsFileUploads: input.supportsFileUploads,
    supportsMeetingTranscripts: input.supportsMeetingTranscripts,
    codingAssistantRelevance: input.codingAssistantRelevance,
    agenticOrConnectedToolRelevance: input.agenticOrConnectedToolRelevance,
    publicPrivacyUrl: input.publicPrivacyUrl || null,
    publicSecurityUrl: input.publicSecurityUrl || null,
    publicTrustUrl: input.publicTrustUrl || null,
    trainingUseNotes: input.trainingUseNotes,
    dataRetentionNotes: input.dataRetentionNotes,
    deletionControlNotes: input.deletionControlNotes,
    enterpriseAdminControlsNotes: input.enterpriseAdminControlsNotes,
    auditLoggingNotes: input.auditLoggingNotes,
    complianceSecurityDocsNotes: input.complianceSecurityDocsNotes,
    subprocessorNotes: input.subprocessorNotes,
    sensitiveDataConcerns: input.sensitiveDataConcerns,
    recommendedUsageBoundaries: input.recommendedUsageBoundaries,
    reviewNotes: input.reviewNotes || null,
    sourceConfidenceNotes: input.sourceConfidenceNotes || null,
    publicInfoConfidenceLevel: input.publicInfoConfidenceLevel as
      "high" | "medium" | "low" | "unknown",
    publishedStatus,
    sources: [],
    reviewedBy: "admin-dashboard",
    lastReviewedAt: new Date(),
  };
}

export function bumpProfileVersion(current: string): string {
  const parts = current.split(".");
  const last = Number.parseInt(parts[parts.length - 1] ?? "", 10);
  if (!Number.isNaN(last)) {
    parts[parts.length - 1] = String(last + 1);
    return parts.join(".");
  }
  return `${current}.1`;
}

async function recordAuditLog(input: {
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, string>;
}) {
  const db = getDb();
  await db.insert(auditLogs).values({
    actorType: "admin",
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    metadata: input.metadata,
  });
}

export async function getAdminToolCategories(): Promise<
  AdminToolCategoryOption[]
> {
  const db = getDb();
  const rows = await db
    .select({ slug: aiToolCategories.slug, name: aiToolCategories.name })
    .from(aiToolCategories)
    .orderBy(asc(aiToolCategories.sortOrder));

  return rows;
}

export async function getAdminToolList(
  filters: AdminToolListFilters,
): Promise<AdminToolListResult> {
  const db = getDb();
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 25;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (filters.search) {
    const pattern = `%${filters.search}%`;
    conditions.push(
      or(ilike(aiTools.name, pattern), ilike(aiTools.slug, pattern)),
    );
  }
  if (filters.categorySlug) {
    conditions.push(eq(aiToolCategories.slug, filters.categorySlug));
  }
  if (filters.status === "active") {
    conditions.push(eq(aiTools.isActive, true));
  }
  if (filters.status === "inactive") {
    conditions.push(eq(aiTools.isActive, false));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db
    .select({
      tool: aiTools,
      categoryName: aiToolCategories.name,
      categorySlug: aiToolCategories.slug,
    })
    .from(aiTools)
    .innerJoin(aiToolCategories, eq(aiTools.categoryId, aiToolCategories.id))
    .where(whereClause)
    .orderBy(desc(aiTools.isActive), asc(aiTools.name))
    .limit(limit)
    .offset(offset);

  const [totalRow] = await db
    .select({ value: count() })
    .from(aiTools)
    .innerJoin(aiToolCategories, eq(aiTools.categoryId, aiToolCategories.id))
    .where(whereClause);

  const toolIds = rows.map((row) => row.tool.id);
  const profiles =
    toolIds.length > 0
      ? await db
          .select()
          .from(aiToolProfileVersions)
          .where(inArray(aiToolProfileVersions.toolId, toolIds))
          .orderBy(desc(aiToolProfileVersions.updatedAt))
      : [];

  const profilesByTool = new Map<string, ProfileRow[]>();
  for (const profile of profiles) {
    const existing = profilesByTool.get(profile.toolId) ?? [];
    existing.push(profile);
    profilesByTool.set(profile.toolId, existing);
  }

  let items: AdminToolListItem[] = rows.map((row) => {
    const toolProfiles = profilesByTool.get(row.tool.id) ?? [];
    const published = toolProfiles.find(
      (p) => p.publishedStatus === "published",
    );
    const latest = toolProfiles[0] ?? null;

    return {
      slug: row.tool.slug,
      name: row.tool.name,
      category: row.categoryName,
      categorySlug: row.categorySlug,
      status: row.tool.isActive ? "active" : "inactive",
      publishedProfileStatus: published?.publishedStatus ?? null,
      confidenceLevel: published?.publicInfoConfidenceLevel ?? null,
      publishedVersionLabel: published?.profileVersion ?? null,
      lastUpdatedAt: (latest?.updatedAt ?? row.tool.updatedAt).toISOString(),
      hasSourceNotes: Boolean(
        published?.sourceConfidenceNotes?.trim() ||
        published?.reviewNotes?.trim(),
      ),
    };
  });

  if (filters.confidenceLevel) {
    items = items.filter(
      (item) => item.confidenceLevel === filters.confidenceLevel,
    );
  }

  return {
    items,
    total: Number(totalRow?.value ?? 0),
    page,
    limit,
  };
}

export async function getAdminToolDetailBySlug(
  toolSlug: string,
): Promise<AdminToolDetail | null> {
  const db = getDb();

  const [row] = await db
    .select({
      tool: aiTools,
      categoryName: aiToolCategories.name,
      categorySlug: aiToolCategories.slug,
    })
    .from(aiTools)
    .innerJoin(aiToolCategories, eq(aiTools.categoryId, aiToolCategories.id))
    .where(eq(aiTools.slug, toolSlug))
    .limit(1);

  if (!row) {
    return null;
  }

  const versions = await db
    .select()
    .from(aiToolProfileVersions)
    .where(eq(aiToolProfileVersions.toolId, row.tool.id))
    .orderBy(desc(aiToolProfileVersions.createdAt));

  const published = versions.find((v) => v.publishedStatus === "published");
  const draft = versions.find((v) => v.publishedStatus === "draft");

  return {
    slug: row.tool.slug,
    name: row.tool.name,
    category: row.categoryName,
    categorySlug: row.categorySlug,
    status: row.tool.isActive ? "active" : "inactive",
    websiteUrl: row.tool.websiteUrl,
    createdAt: row.tool.createdAt.toISOString(),
    updatedAt: row.tool.updatedAt.toISOString(),
    publishedProfile: published
      ? {
          versionLabel: published.profileVersion,
          status: published.publishedStatus,
          confidenceLevel: published.publicInfoConfidenceLevel,
          summary: published.recommendedUsageBoundaries,
          sourceNotes: published.sourceConfidenceNotes,
          reviewNotes: published.reviewNotes,
          profileData: mapProfileData(published),
        }
      : null,
    draftProfile: draft
      ? {
          versionLabel: draft.profileVersion,
          status: draft.publishedStatus,
          confidenceLevel: draft.publicInfoConfidenceLevel,
          profileData: mapProfileData(draft),
          reviewNotes: draft.reviewNotes,
          sourceNotes: draft.sourceConfidenceNotes,
        }
      : null,
    versions: versions.map((version) => ({
      versionLabel: version.profileVersion,
      status: version.publishedStatus,
      confidenceLevel: version.publicInfoConfidenceLevel,
      createdAt: version.createdAt.toISOString(),
      updatedAt: version.updatedAt.toISOString(),
      lastReviewedAt: version.lastReviewedAt?.toISOString() ?? null,
    })),
  };
}

async function getCategoryIdBySlug(
  categorySlug: string,
): Promise<string | null> {
  const db = getDb();
  const [category] = await db
    .select({ id: aiToolCategories.id })
    .from(aiToolCategories)
    .where(eq(aiToolCategories.slug, categorySlug))
    .limit(1);
  return category?.id ?? null;
}

export async function createAdminTool(
  input: ToolProfileFormInput & { slug: string },
): Promise<{ slug: string }> {
  const db = getDb();
  const categoryId = await getCategoryIdBySlug(input.categorySlug);
  if (!categoryId) {
    throw new Error("Category not found.");
  }

  const [existing] = await db
    .select({ id: aiTools.id })
    .from(aiTools)
    .where(eq(aiTools.slug, input.slug))
    .limit(1);
  if (existing) {
    throw new Error("A tool with this slug already exists.");
  }

  const result = await db.transaction(async (tx) => {
    const [tool] = await tx
      .insert(aiTools)
      .values({
        categoryId,
        name: input.name,
        slug: input.slug,
        websiteUrl: input.websiteUrl,
        isActive: input.isActive,
      })
      .returning();

    if (!tool) {
      throw new Error("Failed to create tool.");
    }

    await tx.insert(aiToolProfileVersions).values({
      toolId: tool.id,
      ...profileInputToValues(input, INITIAL_PROFILE_VERSION, "draft"),
    });

    return tool;
  });

  await recordAuditLog({
    action: "tool_created",
    entityType: "ai_tool",
    entityId: result.id,
    metadata: { slug: result.slug },
  });

  return { slug: result.slug };
}

export async function createToolProfileDraft(input: {
  toolSlug: string;
  form: ToolProfileFormInput;
}): Promise<{ slug: string; versionLabel: string }> {
  const db = getDb();

  const [tool] = await db
    .select()
    .from(aiTools)
    .where(eq(aiTools.slug, input.toolSlug))
    .limit(1);
  if (!tool) {
    throw new Error("Tool not found.");
  }

  const categoryId = await getCategoryIdBySlug(input.form.categorySlug);
  if (!categoryId) {
    throw new Error("Category not found.");
  }

  const versions = await db
    .select()
    .from(aiToolProfileVersions)
    .where(eq(aiToolProfileVersions.toolId, tool.id))
    .orderBy(desc(aiToolProfileVersions.createdAt));

  const existingDraft = versions.find((v) => v.publishedStatus === "draft");
  if (existingDraft) {
    throw new Error("A draft profile already exists. Edit the draft instead.");
  }

  const baseVersion =
    versions.find((v) => v.publishedStatus === "published") ??
    versions[0] ??
    null;
  const nextVersion = baseVersion
    ? bumpProfileVersion(baseVersion.profileVersion)
    : INITIAL_PROFILE_VERSION;

  await db.transaction(async (tx) => {
    await tx
      .update(aiTools)
      .set({
        name: input.form.name,
        categoryId,
        websiteUrl: input.form.websiteUrl,
        isActive: input.form.isActive,
        updatedAt: sql`now()`,
      })
      .where(eq(aiTools.id, tool.id));

    await tx.insert(aiToolProfileVersions).values({
      toolId: tool.id,
      ...profileInputToValues(input.form, nextVersion, "draft"),
    });
  });

  await recordAuditLog({
    action: "profile_draft_created",
    entityType: "ai_tool_profile",
    entityId: tool.id,
    metadata: { slug: tool.slug, version: nextVersion },
  });

  return { slug: tool.slug, versionLabel: nextVersion };
}

export async function updateToolProfileDraft(input: {
  toolSlug: string;
  form: ToolProfileFormInput;
}): Promise<{ slug: string; versionLabel: string }> {
  const db = getDb();

  const [tool] = await db
    .select()
    .from(aiTools)
    .where(eq(aiTools.slug, input.toolSlug))
    .limit(1);
  if (!tool) {
    throw new Error("Tool not found.");
  }

  const categoryId = await getCategoryIdBySlug(input.form.categorySlug);
  if (!categoryId) {
    throw new Error("Category not found.");
  }

  const [draft] = await db
    .select()
    .from(aiToolProfileVersions)
    .where(
      and(
        eq(aiToolProfileVersions.toolId, tool.id),
        eq(aiToolProfileVersions.publishedStatus, "draft"),
      ),
    )
    .limit(1);

  if (!draft) {
    return createToolProfileDraft({
      toolSlug: input.toolSlug,
      form: input.form,
    });
  }

  await db.transaction(async (tx) => {
    await tx
      .update(aiTools)
      .set({
        name: input.form.name,
        categoryId,
        websiteUrl: input.form.websiteUrl,
        isActive: input.form.isActive,
        updatedAt: sql`now()`,
      })
      .where(eq(aiTools.id, tool.id));

    await tx
      .update(aiToolProfileVersions)
      .set({
        ...profileInputToValues(input.form, draft.profileVersion, "draft"),
        updatedAt: sql`now()`,
      })
      .where(eq(aiToolProfileVersions.id, draft.id));
  });

  await recordAuditLog({
    action: "profile_draft_updated",
    entityType: "ai_tool_profile",
    entityId: tool.id,
    metadata: { slug: tool.slug, version: draft.profileVersion },
  });

  return { slug: tool.slug, versionLabel: draft.profileVersion };
}

export async function publishToolProfileVersion(input: {
  toolSlug: string;
  versionLabel: string;
}): Promise<{ slug: string; versionLabel: string }> {
  const db = getDb();

  const [tool] = await db
    .select()
    .from(aiTools)
    .where(eq(aiTools.slug, input.toolSlug))
    .limit(1);
  if (!tool) {
    throw new Error("Tool not found.");
  }

  const [target] = await db
    .select()
    .from(aiToolProfileVersions)
    .where(
      and(
        eq(aiToolProfileVersions.toolId, tool.id),
        eq(aiToolProfileVersions.profileVersion, input.versionLabel),
      ),
    )
    .limit(1);

  if (!target) {
    throw new Error("Profile version not found.");
  }
  if (target.publishedStatus === "published") {
    throw new Error("Profile version is already published.");
  }
  if (target.publishedStatus === "archived") {
    throw new Error("Archived profile versions cannot be published.");
  }

  await db.transaction(async (tx) => {
    await tx
      .update(aiToolProfileVersions)
      .set({ publishedStatus: "archived", updatedAt: sql`now()` })
      .where(
        and(
          eq(aiToolProfileVersions.toolId, tool.id),
          eq(aiToolProfileVersions.publishedStatus, "published"),
        ),
      );

    await tx
      .update(aiToolProfileVersions)
      .set({
        publishedStatus: "published",
        lastReviewedAt: new Date(),
        updatedAt: sql`now()`,
      })
      .where(eq(aiToolProfileVersions.id, target.id));
  });

  await recordAuditLog({
    action: "profile_published",
    entityType: "ai_tool_profile",
    entityId: tool.id,
    metadata: { slug: tool.slug, version: input.versionLabel },
  });

  return { slug: tool.slug, versionLabel: input.versionLabel };
}

export async function unpublishToolProfileVersion(input: {
  toolSlug: string;
}): Promise<{ slug: string }> {
  const db = getDb();

  const [tool] = await db
    .select()
    .from(aiTools)
    .where(eq(aiTools.slug, input.toolSlug))
    .limit(1);
  if (!tool) {
    throw new Error("Tool not found.");
  }

  const [published] = await db
    .select()
    .from(aiToolProfileVersions)
    .where(
      and(
        eq(aiToolProfileVersions.toolId, tool.id),
        eq(aiToolProfileVersions.publishedStatus, "published"),
      ),
    )
    .limit(1);

  if (!published) {
    throw new Error("No published profile to unpublish.");
  }

  await db
    .update(aiToolProfileVersions)
    .set({ publishedStatus: "archived", updatedAt: sql`now()` })
    .where(eq(aiToolProfileVersions.id, published.id));

  await recordAuditLog({
    action: "profile_unpublished",
    entityType: "ai_tool_profile",
    entityId: tool.id,
    metadata: { slug: tool.slug, version: published.profileVersion },
  });

  return { slug: tool.slug };
}

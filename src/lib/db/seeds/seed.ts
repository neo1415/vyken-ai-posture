import { eq } from "drizzle-orm";

import { validateAllToolProfileSeeds } from "@/features/tool-profiles/validation";
import { createScriptDb } from "../script-db";
import {
  aiToolCategories,
  aiToolProfileVersions,
  aiTools,
} from "../schema/ai-tools";
import { TOOL_PROFILE_SEEDS } from "./tool-profiles";

/**
 * Minimal seed: tool categories only.
 * Tool identities and profile versions are seeded in Module 4.
 */
const CATEGORY_SEED = [
  {
    slug: "general_assistant",
    name: "General AI Assistant",
    description: "General-purpose conversational AI tools",
    sortOrder: 1,
  },
  {
    slug: "ai_search_research",
    name: "AI Search / Research",
    description: "AI-powered search and research tools",
    sortOrder: 2,
  },
  {
    slug: "workplace_copilot",
    name: "Workplace Copilot",
    description: "Embedded workplace AI copilots",
    sortOrder: 3,
  },
  {
    slug: "coding_assistant",
    name: "Coding Assistant",
    description: "AI tools for software development",
    sortOrder: 4,
  },
  {
    slug: "meeting_assistant",
    name: "Meeting Assistant",
    description: "AI meeting transcription and notes",
    sortOrder: 5,
  },
  {
    slug: "writing_productivity",
    name: "Writing / Productivity",
    description: "Writing and productivity AI features",
    sortOrder: 6,
  },
  {
    slug: "design_media",
    name: "Design / Media",
    description: "AI design and media tools",
    sortOrder: 7,
  },
  {
    slug: "automation_agent",
    name: "Automation / Agent",
    description: "Workflow automation and agentic AI tools",
    sortOrder: 8,
  },
  {
    slug: "unknown_other",
    name: "Unknown / Other",
    description: "Unlisted or uncategorized tools",
    sortOrder: 99,
  },
] as const;

async function seedCategories(
  db: ReturnType<typeof createScriptDb>["db"],
): Promise<Map<string, string>> {
  for (const category of CATEGORY_SEED) {
    await db
      .insert(aiToolCategories)
      .values({
        slug: category.slug,
        name: category.name,
        description: category.description,
        sortOrder: category.sortOrder,
      })
      .onConflictDoNothing({ target: aiToolCategories.slug });
  }

  const rows = await db
    .select({ id: aiToolCategories.id, slug: aiToolCategories.slug })
    .from(aiToolCategories);

  return new Map(rows.map((row) => [row.slug, row.id]));
}

async function seedToolsAndProfiles(
  db: ReturnType<typeof createScriptDb>["db"],
  categoryIds: Map<string, string>,
  profiles: ReturnType<typeof validateAllToolProfileSeeds>,
): Promise<void> {
  for (const profile of profiles) {
    const categoryId = categoryIds.get(profile.categorySlug);
    if (!categoryId) {
      throw new Error(
        `Missing category "${profile.categorySlug}" for tool "${profile.toolSlug}".`,
      );
    }

    await db
      .insert(aiTools)
      .values({
        slug: profile.toolSlug,
        name: profile.toolName,
        categoryId,
        websiteUrl: profile.websiteUrl,
        isActive: true,
      })
      .onConflictDoNothing({ target: aiTools.slug });

    const [tool] = await db
      .select({ id: aiTools.id })
      .from(aiTools)
      .where(eq(aiTools.slug, profile.toolSlug))
      .limit(1);

    if (!tool) {
      throw new Error(
        `Failed to resolve tool id for slug "${profile.toolSlug}".`,
      );
    }

    await db
      .insert(aiToolProfileVersions)
      .values({
        toolId: tool.id,
        profileVersion: profile.profileVersion,
        commonUseCases: profile.commonUseCases,
        supportsFileUploads: profile.supportsFileUploads,
        supportsMeetingTranscripts: profile.supportsMeetingTranscripts,
        codingAssistantRelevance: profile.codingAssistantRelevance,
        agenticOrConnectedToolRelevance:
          profile.agenticOrConnectedToolRelevance,
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
        sources: profile.sources,
        reviewNotes: profile.reviewNotes ?? null,
        sourceConfidenceNotes: profile.sourceConfidenceNotes ?? null,
        publicInfoConfidenceLevel: profile.publicInfoConfidenceLevel,
        lastReviewedAt: new Date(`${profile.lastReviewedAt}T00:00:00.000Z`),
        reviewedBy: profile.reviewedBy,
        publishedStatus: profile.publishedStatus,
      })
      .onConflictDoNothing({
        target: [
          aiToolProfileVersions.toolId,
          aiToolProfileVersions.profileVersion,
        ],
      });
  }
}

async function main() {
  const { db, client } = createScriptDb();

  console.log("Validating tool profile seed data...");
  const validatedProfiles = validateAllToolProfileSeeds(TOOL_PROFILE_SEEDS);

  console.log("Seeding categories...");
  const categoryIds = await seedCategories(db);

  console.log(
    `Seeding ${validatedProfiles.length} tools and profile versions...`,
  );
  await seedToolsAndProfiles(db, categoryIds, validatedProfiles);

  await client.end();
  console.log("Seed complete.");
}

main().catch((error: unknown) => {
  console.error("Seed failed:", error);
  process.exitCode = 1;
});

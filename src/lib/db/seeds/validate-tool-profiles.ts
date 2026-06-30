import { and, eq, sql } from "drizzle-orm";

import { MVP_TOOL_SLUGS } from "@/features/tool-profiles/constants";
import { validateAllToolProfileSeeds } from "@/features/tool-profiles/validation";
import { createScriptDb } from "../script-db";
import {
  aiToolCategories,
  aiToolProfileVersions,
  aiTools,
} from "../schema/ai-tools";
import { TOOL_PROFILE_SEEDS } from "./tool-profiles";

async function main() {
  console.log("Validating in-memory seed definitions...");
  validateAllToolProfileSeeds(TOOL_PROFILE_SEEDS);

  const { db, client } = createScriptDb();

  const [categoryCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(aiToolCategories);

  const [toolCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(aiTools)
    .where(eq(aiTools.isActive, true));

  const [profileCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(aiToolProfileVersions)
    .where(eq(aiToolProfileVersions.publishedStatus, "published"));

  console.log(`Categories: ${categoryCount?.count ?? 0}`);
  console.log(`Active tools: ${toolCount?.count ?? 0}`);
  console.log(`Published profiles: ${profileCount?.count ?? 0}`);

  const missingTools: string[] = [];
  for (const slug of MVP_TOOL_SLUGS) {
    const [tool] = await db
      .select({ id: aiTools.id })
      .from(aiTools)
      .where(and(eq(aiTools.slug, slug), eq(aiTools.isActive, true)))
      .limit(1);

    if (!tool) {
      missingTools.push(slug);
      continue;
    }

    const [profile] = await db
      .select({
        id: aiToolProfileVersions.id,
        confidence: aiToolProfileVersions.publicInfoConfidenceLevel,
        sources: aiToolProfileVersions.sources,
        reviewedBy: aiToolProfileVersions.reviewedBy,
        lastReviewedAt: aiToolProfileVersions.lastReviewedAt,
      })
      .from(aiToolProfileVersions)
      .where(
        and(
          eq(aiToolProfileVersions.toolId, tool.id),
          eq(aiToolProfileVersions.publishedStatus, "published"),
        ),
      )
      .limit(1);

    if (!profile) {
      missingTools.push(`${slug} (no published profile)`);
      continue;
    }

    if (!profile.reviewedBy) {
      throw new Error(`Profile for "${slug}" is missing reviewed_by.`);
    }
    if (!profile.lastReviewedAt) {
      throw new Error(`Profile for "${slug}" is missing last_reviewed_at.`);
    }
    if (!profile.confidence) {
      throw new Error(`Profile for "${slug}" is missing confidence level.`);
    }
    if (!profile.sources || profile.sources.length === 0) {
      throw new Error(`Profile for "${slug}" has no sources.`);
    }
  }

  if (missingTools.length > 0) {
    throw new Error(
      `Missing MVP tools or published profiles: ${missingTools.join(", ")}`,
    );
  }

  if ((toolCount?.count ?? 0) < MVP_TOOL_SLUGS.length) {
    throw new Error(
      `Expected at least ${MVP_TOOL_SLUGS.length} active tools, found ${toolCount?.count ?? 0}.`,
    );
  }

  if ((profileCount?.count ?? 0) < MVP_TOOL_SLUGS.length) {
    throw new Error(
      `Expected at least ${MVP_TOOL_SLUGS.length} published profiles, found ${profileCount?.count ?? 0}.`,
    );
  }

  await client.end();
  console.log("Tool profile validation passed.");
}

main().catch((error: unknown) => {
  console.error("Validation failed:", error);
  process.exitCode = 1;
});

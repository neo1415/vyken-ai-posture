import "server-only";

import { and, asc, eq, inArray } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import {
  aiToolCategories,
  aiToolProfileVersions,
  aiTools,
} from "@/lib/db/schema/ai-tools";

export type PublishedToolCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sortOrder: number;
};

export type ActiveToolRow = {
  id: string;
  slug: string;
  name: string;
  websiteUrl: string | null;
  categoryId: string;
  isActive: boolean;
};

export type PublishedToolProfileRow = {
  tool: ActiveToolRow;
  category: PublishedToolCategory;
  profile: typeof aiToolProfileVersions.$inferSelect;
};

export async function getPublishedToolCategories(): Promise<
  PublishedToolCategory[]
> {
  const db = getDb();
  return db
    .select({
      id: aiToolCategories.id,
      slug: aiToolCategories.slug,
      name: aiToolCategories.name,
      description: aiToolCategories.description,
      sortOrder: aiToolCategories.sortOrder,
    })
    .from(aiToolCategories)
    .orderBy(asc(aiToolCategories.sortOrder));
}

export async function getActiveTools(): Promise<ActiveToolRow[]> {
  const db = getDb();
  return db
    .select({
      id: aiTools.id,
      slug: aiTools.slug,
      name: aiTools.name,
      websiteUrl: aiTools.websiteUrl,
      categoryId: aiTools.categoryId,
      isActive: aiTools.isActive,
    })
    .from(aiTools)
    .where(eq(aiTools.isActive, true))
    .orderBy(asc(aiTools.name));
}

async function queryPublishedProfiles(
  toolSlugs?: string[],
): Promise<PublishedToolProfileRow[]> {
  const db = getDb();

  const conditions = [
    eq(aiTools.isActive, true),
    eq(aiToolProfileVersions.publishedStatus, "published"),
  ];

  if (toolSlugs && toolSlugs.length > 0) {
    conditions.push(inArray(aiTools.slug, toolSlugs));
  }

  const rows = await db
    .select({
      tool: {
        id: aiTools.id,
        slug: aiTools.slug,
        name: aiTools.name,
        websiteUrl: aiTools.websiteUrl,
        categoryId: aiTools.categoryId,
        isActive: aiTools.isActive,
      },
      category: {
        id: aiToolCategories.id,
        slug: aiToolCategories.slug,
        name: aiToolCategories.name,
        description: aiToolCategories.description,
        sortOrder: aiToolCategories.sortOrder,
      },
      profile: aiToolProfileVersions,
    })
    .from(aiToolProfileVersions)
    .innerJoin(aiTools, eq(aiToolProfileVersions.toolId, aiTools.id))
    .innerJoin(aiToolCategories, eq(aiTools.categoryId, aiToolCategories.id))
    .where(and(...conditions))
    .orderBy(asc(aiTools.name));

  return rows;
}

export async function getPublishedToolProfiles(): Promise<
  PublishedToolProfileRow[]
> {
  return queryPublishedProfiles();
}

export async function getPublishedToolProfileBySlug(
  slug: string,
): Promise<PublishedToolProfileRow | null> {
  const rows = await queryPublishedProfiles([slug]);
  return rows[0] ?? null;
}

export async function getPublishedToolProfilesBySlugs(
  slugs: string[],
): Promise<PublishedToolProfileRow[]> {
  if (slugs.length === 0) {
    return [];
  }
  return queryPublishedProfiles(slugs);
}

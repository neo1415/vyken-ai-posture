import "server-only";

import { eq } from "drizzle-orm";

import type { CompanyProfileInput } from "@/features/company-profile/types";
import { getDb } from "@/lib/db/client";
import { assessmentCompanyProfiles } from "@/lib/db/schema/assessments";

export type UpsertCompanyProfileInput = CompanyProfileInput & {
  assessmentSessionId: string;
};

export async function upsertCompanyProfile(
  input: UpsertCompanyProfileInput,
): Promise<void> {
  const db = getDb();

  await db
    .insert(assessmentCompanyProfiles)
    .values({
      assessmentSessionId: input.assessmentSessionId,
      companyName: input.companyName,
      countryRegion: input.countryRegion,
      industry: input.industry,
      companySize: input.companySize,
      respondentRole: input.respondentRole,
      departmentFunction: input.departmentFunction,
      handlesSensitiveOrRegulatedData: input.handlesSensitiveOrRegulatedData,
      mainAiConcerns: input.mainAiConcerns,
    })
    .onConflictDoUpdate({
      target: assessmentCompanyProfiles.assessmentSessionId,
      set: {
        companyName: input.companyName,
        countryRegion: input.countryRegion,
        industry: input.industry,
        companySize: input.companySize,
        respondentRole: input.respondentRole,
        departmentFunction: input.departmentFunction,
        handlesSensitiveOrRegulatedData: input.handlesSensitiveOrRegulatedData,
        mainAiConcerns: input.mainAiConcerns,
      },
    });
}

export async function getCompanyProfileBySessionId(
  assessmentSessionId: string,
): Promise<typeof assessmentCompanyProfiles.$inferSelect | null> {
  const db = getDb();

  const [profile] = await db
    .select()
    .from(assessmentCompanyProfiles)
    .where(
      eq(assessmentCompanyProfiles.assessmentSessionId, assessmentSessionId),
    )
    .limit(1);

  return profile ?? null;
}

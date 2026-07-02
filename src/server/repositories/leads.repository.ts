import "server-only";

import { and, count, eq } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { leads } from "@/lib/db/schema/leads";

export type UpsertLeadForAssessmentInput = {
  assessmentSessionId: string;
  email: string;
  name: string | null;
  companyName: string | null;
  role: string | null;
  mainAiConcern: string | null;
  consentToFollowUp: boolean;
  leadScore: number | null;
};

export type LeadRow = typeof leads.$inferSelect;

export async function getLeadByAssessmentSessionAndEmail(
  assessmentSessionId: string,
  email: string,
): Promise<LeadRow | null> {
  const db = getDb();
  const normalizedEmail = email.trim().toLowerCase();

  const [lead] = await db
    .select()
    .from(leads)
    .where(
      and(
        eq(leads.assessmentSessionId, assessmentSessionId),
        eq(leads.email, normalizedEmail),
      ),
    )
    .limit(1);

  return lead ?? null;
}

export async function upsertLeadForAssessment(
  input: UpsertLeadForAssessmentInput,
): Promise<LeadRow> {
  const db = getDb();
  const normalizedEmail = input.email.trim().toLowerCase();

  const existing = await getLeadByAssessmentSessionAndEmail(
    input.assessmentSessionId,
    normalizedEmail,
  );

  if (existing) {
    const [updated] = await db
      .update(leads)
      .set({
        name: input.name,
        companyName: input.companyName,
        role: input.role,
        mainAiConcern: input.mainAiConcern,
        consentToFollowUp: input.consentToFollowUp,
        leadScore: input.leadScore,
        status: existing.status === "ignore_spam" ? "new" : existing.status,
      })
      .where(eq(leads.id, existing.id))
      .returning();

    if (!updated) {
      throw new Error("Failed to update lead.");
    }

    return updated;
  }

  const [created] = await db
    .insert(leads)
    .values({
      assessmentSessionId: input.assessmentSessionId,
      email: normalizedEmail,
      name: input.name,
      companyName: input.companyName,
      role: input.role,
      mainAiConcern: input.mainAiConcern,
      consentToFollowUp: input.consentToFollowUp,
      leadScore: input.leadScore,
      status: "new",
    })
    .returning();

  if (!created) {
    throw new Error("Failed to create lead.");
  }

  return created;
}

export async function getLeadCountForAssessment(
  assessmentSessionId: string,
): Promise<number> {
  const db = getDb();

  const [result] = await db
    .select({ value: count() })
    .from(leads)
    .where(eq(leads.assessmentSessionId, assessmentSessionId));

  return Number(result?.value ?? 0);
}

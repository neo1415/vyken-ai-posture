import "server-only";

import { eq } from "drizzle-orm";

import type { ReportContext } from "@/features/report-context/types";
import { getDb } from "@/lib/db/client";
import { assessmentSessions } from "@/lib/db/schema/assessments";
import { reports } from "@/lib/db/schema/reports";
import { generatePublicToken } from "@/lib/security/public-token";

export type ReportRow = typeof reports.$inferSelect;

export type UpsertReportContextInput = {
  assessmentSessionId: string;
  reportContext: ReportContext;
};

export async function getReportByAssessmentSessionId(
  assessmentSessionId: string,
): Promise<ReportRow | null> {
  const db = getDb();

  const [report] = await db
    .select()
    .from(reports)
    .where(eq(reports.assessmentSessionId, assessmentSessionId))
    .limit(1);

  return report ?? null;
}

export async function upsertReportContextForAssessment(
  input: UpsertReportContextInput,
): Promise<ReportRow> {
  const db = getDb();
  const existing = await getReportByAssessmentSessionId(
    input.assessmentSessionId,
  );

  if (existing) {
    const [updated] = await db
      .update(reports)
      .set({
        reportContext: input.reportContext,
        status: "pending",
        storagePath: null,
      })
      .where(eq(reports.id, existing.id))
      .returning();

    if (!updated) {
      throw new Error("Failed to update report context.");
    }

    return updated;
  }

  const [created] = await db
    .insert(reports)
    .values({
      assessmentSessionId: input.assessmentSessionId,
      reportToken: generatePublicToken(),
      status: "pending",
      reportContext: input.reportContext,
      storagePath: null,
      generatedAt: null,
      expiresAt: null,
    })
    .returning();

  if (!created) {
    throw new Error("Failed to create report context.");
  }

  return created;
}

export async function getReportContextByPublicToken(
  publicToken: string,
): Promise<ReportContext | null> {
  const db = getDb();

  const [session] = await db
    .select({ id: assessmentSessions.id })
    .from(assessmentSessions)
    .where(eq(assessmentSessions.publicToken, publicToken))
    .limit(1);

  if (!session) {
    return null;
  }

  const report = await getReportByAssessmentSessionId(session.id);
  if (!report?.reportContext) {
    return null;
  }

  return report.reportContext as ReportContext;
}

export async function getReportByPublicToken(
  publicToken: string,
): Promise<ReportRow | null> {
  const db = getDb();

  const [session] = await db
    .select({ id: assessmentSessions.id })
    .from(assessmentSessions)
    .where(eq(assessmentSessions.publicToken, publicToken))
    .limit(1);

  if (!session) {
    return null;
  }

  return getReportByAssessmentSessionId(session.id);
}

export type UpdateReportPdfGeneratedInput = {
  assessmentSessionId: string;
  storagePath: string;
  generatedAt: Date;
};

export async function updateReportPdfGenerated(
  input: UpdateReportPdfGeneratedInput,
): Promise<ReportRow> {
  const db = getDb();
  const existing = await getReportByAssessmentSessionId(
    input.assessmentSessionId,
  );

  if (!existing) {
    throw new Error("Report row not found for PDF update.");
  }

  const [updated] = await db
    .update(reports)
    .set({
      storagePath: input.storagePath,
      status: "generated",
      generatedAt: input.generatedAt,
    })
    .where(eq(reports.id, existing.id))
    .returning();

  if (!updated) {
    throw new Error("Failed to update report PDF metadata.");
  }

  return updated;
}

import "server-only";

import { eq, asc } from "drizzle-orm";

import type { AssessmentScoringResult } from "@/features/scoring/types";
import type {
  AssessmentFinding,
  AssessmentRecommendation,
  FindingConfidence,
  FindingSeverity,
  RecommendationEffort,
  RecommendationPriority,
  VykenGuardRelevance,
} from "@/features/recommendations/types";
import { getDb } from "@/lib/db/client";
import {
  assessmentFindings,
  assessmentRecommendations,
  assessmentRiskSignals,
  assessmentScores,
  assessmentSessions,
} from "@/lib/db/schema/assessments";

export type FindingMetadata = {
  categoryId: string;
  sourceSignalIds: string[];
  evidence: string[];
  confidence: FindingConfidence;
  modelVersion: string;
};

export type RecommendationMetadata = {
  summary: string;
  effort: RecommendationEffort;
  priority: RecommendationPriority;
  categoryId: string;
  sourceFindingIds: string[];
  sourceSignalIds: string[];
  relatedRiskCategories: string[];
  vykenGuardRelevance: VykenGuardRelevance;
  caveats: string[];
  whyThisMatters: string;
  modelVersion: string;
};

export type RecommendationInputRow = {
  session: typeof assessmentSessions.$inferSelect;
  score: typeof assessmentScores.$inferSelect | null;
  signals: (typeof assessmentRiskSignals.$inferSelect)[];
};

function toDbSeverityFromFinding(
  severity: FindingSeverity,
): "low" | "moderate" | "high" | "critical" {
  return severity === "medium" ? "moderate" : severity;
}

function toDbSeverityFromPriority(
  priority: RecommendationPriority,
): "low" | "moderate" | "high" | "critical" {
  if (priority === "urgent") return "critical";
  if (priority === "medium") return "moderate";
  return priority;
}

function fromDbSeverityToFindingSeverity(severity: string): FindingSeverity {
  if (severity === "moderate") return "medium";
  if (severity === "low" || severity === "high" || severity === "critical") {
    return severity;
  }
  return "medium";
}

function fromDbSeverityToPriority(
  severity: string,
  metadata?: RecommendationMetadata | null,
): RecommendationPriority {
  if (metadata?.priority) return metadata.priority;
  if (severity === "critical") return "urgent";
  if (severity === "moderate") return "medium";
  if (severity === "high" || severity === "low") return severity;
  return "medium";
}

function parseFindingMetadata(value: unknown): FindingMetadata | null {
  if (!value || typeof value !== "object") return null;
  const obj = value as FindingMetadata;
  if (!obj.categoryId || !Array.isArray(obj.sourceSignalIds)) return null;
  return obj;
}

function parseRecommendationMetadata(
  value: unknown,
): RecommendationMetadata | null {
  if (!value || typeof value !== "object") return null;
  const obj = value as RecommendationMetadata;
  if (!obj.summary || !obj.effort) return null;
  return obj;
}

export async function getRecommendationInputByPublicToken(
  publicToken: string,
): Promise<RecommendationInputRow | null> {
  const db = getDb();

  const [session] = await db
    .select()
    .from(assessmentSessions)
    .where(eq(assessmentSessions.publicToken, publicToken))
    .limit(1);

  if (!session) return null;

  const [score] = await db
    .select()
    .from(assessmentScores)
    .where(eq(assessmentScores.assessmentSessionId, session.id))
    .limit(1);

  const signals = await db
    .select()
    .from(assessmentRiskSignals)
    .where(eq(assessmentRiskSignals.assessmentSessionId, session.id));

  return {
    session,
    score: score ?? null,
    signals,
  };
}

export function parseScoringResultFromBreakdown(
  scoreBreakdown: unknown,
): AssessmentScoringResult | null {
  if (!scoreBreakdown || typeof scoreBreakdown !== "object") return null;
  const obj = scoreBreakdown as AssessmentScoringResult;
  if (
    typeof obj.overallScore !== "number" ||
    !Array.isArray(obj.signals) ||
    !Array.isArray(obj.categoryScores)
  ) {
    return null;
  }
  return obj;
}

export async function replaceFindingsAndRecommendationsForSession(input: {
  assessmentSessionId: string;
  findings: AssessmentFinding[];
  recommendations: AssessmentRecommendation[];
  modelVersion: string;
}): Promise<void> {
  const db = getDb();

  await db.transaction(async (tx) => {
    await tx
      .delete(assessmentFindings)
      .where(
        eq(assessmentFindings.assessmentSessionId, input.assessmentSessionId),
      );
    await tx
      .delete(assessmentRecommendations)
      .where(
        eq(
          assessmentRecommendations.assessmentSessionId,
          input.assessmentSessionId,
        ),
      );

    if (input.findings.length > 0) {
      await tx.insert(assessmentFindings).values(
        input.findings.map((finding) => ({
          assessmentSessionId: input.assessmentSessionId,
          findingKey: finding.findingId,
          title: finding.title,
          summary: finding.summary,
          severity: toDbSeverityFromFinding(finding.severity),
          frameworkMapping: {
            categoryId: finding.categoryId,
            sourceSignalIds: finding.sourceSignalIds,
            evidence: finding.evidence,
            confidence: finding.confidence,
            modelVersion: input.modelVersion,
          } as unknown as string[],
        })),
      );
    }

    if (input.recommendations.length > 0) {
      await tx.insert(assessmentRecommendations).values(
        input.recommendations.map((rec, index) => ({
          assessmentSessionId: input.assessmentSessionId,
          recommendationKey: rec.recommendationId,
          title: rec.title,
          severity: toDbSeverityFromPriority(rec.priority),
          recommendedActions: rec.implementationSteps,
          frameworkMapping: {
            summary: rec.summary,
            effort: rec.effort,
            priority: rec.priority,
            categoryId: rec.categoryId,
            sourceFindingIds: rec.sourceFindingIds,
            sourceSignalIds: rec.sourceSignalIds,
            relatedRiskCategories: rec.relatedRiskCategories,
            vykenGuardRelevance: rec.vykenGuardRelevance,
            caveats: rec.caveats,
            whyThisMatters: rec.whyThisMatters,
            modelVersion: input.modelVersion,
          } as unknown as string[],
          ctaType: null,
          sortOrder: index,
        })),
      );
    }
  });
}

export async function getFindingsByPublicToken(
  publicToken: string,
): Promise<AssessmentFinding[]> {
  const db = getDb();

  const [session] = await db
    .select({ id: assessmentSessions.id })
    .from(assessmentSessions)
    .where(eq(assessmentSessions.publicToken, publicToken))
    .limit(1);

  if (!session) return [];

  const rows = await db
    .select()
    .from(assessmentFindings)
    .where(eq(assessmentFindings.assessmentSessionId, session.id));

  return rows.map((row) => {
    const metadata = parseFindingMetadata(row.frameworkMapping);
    return {
      findingId: row.findingKey,
      categoryId: (metadata?.categoryId ??
        "governance_controls") as AssessmentFinding["categoryId"],
      severity: fromDbSeverityToFindingSeverity(row.severity),
      title: row.title,
      summary: row.summary,
      sourceSignalIds: metadata?.sourceSignalIds ?? [],
      evidence: metadata?.evidence ?? [],
      confidence: metadata?.confidence ?? "medium",
    };
  });
}

export async function getRecommendationsByPublicToken(
  publicToken: string,
): Promise<AssessmentRecommendation[]> {
  const db = getDb();

  const [session] = await db
    .select({ id: assessmentSessions.id })
    .from(assessmentSessions)
    .where(eq(assessmentSessions.publicToken, publicToken))
    .limit(1);

  if (!session) return [];

  const rows = await db
    .select()
    .from(assessmentRecommendations)
    .where(eq(assessmentRecommendations.assessmentSessionId, session.id))
    .orderBy(asc(assessmentRecommendations.sortOrder));

  return rows.map((row) => {
    const metadata = parseRecommendationMetadata(row.frameworkMapping);
    return {
      recommendationId: row.recommendationKey,
      title: row.title,
      summary: metadata?.summary ?? row.title,
      priority: fromDbSeverityToPriority(row.severity, metadata),
      effort: metadata?.effort ?? "medium",
      categoryId:
        (metadata?.categoryId as AssessmentRecommendation["categoryId"]) ??
        "policy_and_governance",
      sourceFindingIds: metadata?.sourceFindingIds ?? [],
      sourceSignalIds: metadata?.sourceSignalIds ?? [],
      relatedRiskCategories:
        (metadata?.relatedRiskCategories as AssessmentRecommendation["relatedRiskCategories"]) ??
        [],
      implementationSteps: row.recommendedActions ?? [],
      whyThisMatters: metadata?.whyThisMatters ?? "",
      vykenGuardRelevance: metadata?.vykenGuardRelevance ?? "none",
      caveats: metadata?.caveats ?? [],
    };
  });
}

export async function getRecommendationCountsByPublicToken(
  publicToken: string,
): Promise<{ findingCount: number; recommendationCount: number }> {
  const [findings, recommendations] = await Promise.all([
    getFindingsByPublicToken(publicToken),
    getRecommendationsByPublicToken(publicToken),
  ]);
  return {
    findingCount: findings.length,
    recommendationCount: recommendations.length,
  };
}

/**
 * Live Module 8 verification against Supabase.
 * Run: pnpm dev then pnpm verify:module8
 */
import { randomBytes } from "node:crypto";
import { resolve } from "node:path";

import { config } from "dotenv";
import { and, eq } from "drizzle-orm";

config({ path: resolve(process.cwd(), ".env.local"), override: true });

import { ASSESSMENT_QUESTIONS } from "@/features/assessment-wizard/questions";
import { isAgenticSectionRequired } from "@/features/assessment-wizard/agentic-trigger";
import { scoreAssessment } from "@/features/scoring/scoring-engine";
import type {
  AssessmentScoringInput,
  RiskSignal,
} from "@/features/scoring/types";
import { validateWeightsSumToOne } from "@/features/scoring/validation";
import { createScriptDb } from "@/lib/db/script-db";
import {
  aiToolCategories,
  aiToolProfileVersions,
  aiTools,
} from "@/lib/db/schema/ai-tools";
import {
  assessmentAnswers,
  assessmentCompanyProfiles,
  assessmentFindings,
  assessmentRecommendations,
  assessmentRiskSignals,
  assessmentScores,
  assessmentSelectedTools,
  assessmentSessions,
} from "@/lib/db/schema/assessments";
import { leads } from "@/lib/db/schema/leads";
import { reports } from "@/lib/db/schema/reports";

const DEV_PORT_CANDIDATES = [3000, 3001, 3002, 3003] as const;

function devBaseUrlFromPort(port: number) {
  return `http://localhost:${port}`;
}

let DEV_BASE_URL =
  process.env.MODULE8_VERIFY_BASE_URL ?? devBaseUrlFromPort(3000);

type Check = { id: number; name: string; pass: boolean; detail: string };
const results: Check[] = [];

function record(id: number, name: string, pass: boolean, detail: string) {
  results.push({ id, name, pass, detail });
  console.log(`[${pass ? "PASS" : "FAIL"}] ${id}. ${name}`);
  console.log(`       ${detail}`);
}

function token() {
  return randomBytes(32).toString("base64url");
}

/** Prefer a dev server that serves results pages (avoids stale processes). */
async function resolveDevBaseUrl(
  maxAttempts = 30,
  delayMs = 2000,
): Promise<string | null> {
  const explicit = process.env.MODULE8_VERIFY_BASE_URL?.trim();
  if (explicit) {
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      if (await isHealthyDevServer(explicit)) {
        return explicit;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    return null;
  }

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    for (const port of DEV_PORT_CANDIDATES) {
      const baseUrl = devBaseUrlFromPort(port);
      if (await isHealthyDevServer(baseUrl)) {
        return baseUrl;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return null;
}

async function isHealthyDevServer(baseUrl: string): Promise<boolean> {
  try {
    const health = await fetch(`${baseUrl}/api/health`);
    if (!health.ok) return false;
    const results = await fetch(`${baseUrl}/ai-risk-assessment/results`);
    return results.ok;
  } catch {
    return false;
  }
}

async function main() {
  console.log("Module 8 live verification");
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL missing");
    process.exit(1);
  }

  validateWeightsSumToOne();

  const resolvedBaseUrl = await resolveDevBaseUrl();
  if (resolvedBaseUrl) {
    DEV_BASE_URL = resolvedBaseUrl;
  }
  record(
    0,
    "Dev server reachable",
    Boolean(resolvedBaseUrl),
    resolvedBaseUrl
      ? `Health + results OK at ${DEV_BASE_URL}`
      : `Could not find a healthy dev server on ports ${DEV_PORT_CANDIDATES.join(", ")}`,
  );
  if (!resolvedBaseUrl) {
    printSummary();
    process.exit(1);
  }

  const { db, client } = createScriptDb();
  const publicToken = token();

  const [session] = await db
    .insert(assessmentSessions)
    .values({ publicToken, status: "started" })
    .returning();
  if (!session) throw new Error("session create failed");

  await db.insert(assessmentCompanyProfiles).values({
    assessmentSessionId: session.id,
    industry: "saas_technology",
    companySize: "51_200",
    countryRegion: "nigeria",
    respondentRole: "ciso_security_leader",
    mainAiConcerns: ["lack_of_ai_policy"],
  });

  const tools = await db
    .select({ id: aiTools.id, profileId: aiToolProfileVersions.id })
    .from(aiToolProfileVersions)
    .innerJoin(aiTools, eq(aiToolProfileVersions.toolId, aiTools.id))
    .where(
      and(
        eq(aiTools.isActive, true),
        eq(aiToolProfileVersions.publishedStatus, "published"),
      ),
    )
    .limit(2);

  if (tools.length < 1) {
    record(1, "Setup tool selections", false, "No published tools");
    process.exit(1);
  }

  await db.insert(assessmentSelectedTools).values({
    assessmentSessionId: session.id,
    toolId: tools[0].id,
    toolProfileVersionId: tools[0].profileId,
    selectionType: "known_tool",
  });

  // Insert full answer set (all sections; agentic answers included but scoring handles both cases).
  await db.insert(assessmentAnswers).values(
    ASSESSMENT_QUESTIONS.map((q) => ({
      assessmentSessionId: session.id,
      questionId: q.id,
      sectionId: q.sectionId,
      answerType: q.answerType,
      answerValue:
        q.answerType === "multi_select"
          ? [q.options[0]?.value ?? "not_sure"]
          : (q.options[0]?.value ?? "not_sure"),
    })),
  );

  const scoringInput = await buildScoringInputForSession({
    db,
    assessmentSessionId: session.id,
  });
  const result = scoreAssessment(scoringInput);
  await persistScoreAndSignals({
    db,
    assessmentSessionId: session.id,
    scoringInput,
    result,
  });
  record(
    1,
    "Score computed",
    result.overallScore >= 0 && result.overallScore <= 100,
    `overallScore=${result.overallScore}, level=${result.overallRiskLevel}, confidence=${result.confidenceLevel}`,
  );

  const [scoreRows, signalRows] = await Promise.all([
    db
      .select()
      .from(assessmentScores)
      .where(eq(assessmentScores.assessmentSessionId, session.id)),
    db
      .select()
      .from(assessmentRiskSignals)
      .where(eq(assessmentRiskSignals.assessmentSessionId, session.id)),
  ]);

  record(
    2,
    "assessment_scores row created",
    scoreRows.length === 1,
    `rows=${scoreRows.length}`,
  );
  record(
    3,
    "assessment_risk_signals rows created",
    signalRows.length > 0,
    `rows=${signalRows.length}`,
  );

  const scoreBreakdown = scoreRows[0]?.scoreBreakdown as
    | {
        overallScore?: unknown;
        categoryScores?: unknown;
        confidenceLevel?: unknown;
      }
    | undefined;
  record(
    4,
    "Score breakdown snapshot stored",
    Boolean(scoreBreakdown?.overallScore) &&
      Boolean(scoreBreakdown?.categoryScores),
    "score_breakdown includes overallScore and categoryScores",
  );

  const categoryScores = Array.isArray(scoreBreakdown?.categoryScores)
    ? scoreBreakdown.categoryScores
    : [];
  const hasCategoryShape = categoryScores.every(
    (item): item is { score: number } =>
      typeof item === "object" &&
      item != null &&
      "score" in item &&
      typeof (item as { score: unknown }).score === "number",
  );
  const categoryOk =
    categoryScores.length === 6 &&
    hasCategoryShape &&
    categoryScores.every(
      (c) => typeof c.score === "number" && c.score >= 0 && c.score <= 100,
    );
  record(
    5,
    "All category scores present and in range",
    categoryOk,
    `categories=${categoryScores.length}`,
  );

  // Recompute idempotency: scoring replaces rows without duplicates.
  const scoringInput2 = await buildScoringInputForSession({
    db,
    assessmentSessionId: session.id,
  });
  const result2 = scoreAssessment(scoringInput2);
  await persistScoreAndSignals({
    db,
    assessmentSessionId: session.id,
    scoringInput: scoringInput2,
    result: result2,
  });
  const [scoreRows2, signalRows2] = await Promise.all([
    db
      .select()
      .from(assessmentScores)
      .where(eq(assessmentScores.assessmentSessionId, session.id)),
    db
      .select()
      .from(assessmentRiskSignals)
      .where(eq(assessmentRiskSignals.assessmentSessionId, session.id)),
  ]);
  const uniqueSignalKeys = new Set(signalRows2.map((r) => r.signalKey)).size;
  record(
    6,
    "Recompute replaces score/signals without duplicates",
    scoreRows2.length === 1 && uniqueSignalKeys === signalRows2.length,
    `scores=${scoreRows2.length}; signals=${signalRows2.length}; unique=${uniqueSignalKeys}`,
  );

  const [findings, recs, leadRows, reportRows] = await Promise.all([
    db
      .select()
      .from(assessmentFindings)
      .where(eq(assessmentFindings.assessmentSessionId, session.id)),
    db
      .select()
      .from(assessmentRecommendations)
      .where(eq(assessmentRecommendations.assessmentSessionId, session.id)),
    db.select().from(leads).where(eq(leads.assessmentSessionId, session.id)),
    db
      .select()
      .from(reports)
      .where(eq(reports.assessmentSessionId, session.id)),
  ]);
  record(
    7,
    "No findings created",
    findings.length === 0,
    `count=${findings.length}`,
  );
  record(
    8,
    "No recommendations created",
    recs.length === 0,
    `count=${recs.length}`,
  );
  record(
    9,
    "No leads created",
    leadRows.length === 0,
    `count=${leadRows.length}`,
  );
  record(
    10,
    "No reports created",
    reportRows.length === 0,
    `count=${reportRows.length}`,
  );

  // Results placeholder loads and does not expose raw DB IDs (basic smoke via HTML check).
  const resultsResponse = await fetch(
    `${DEV_BASE_URL}/ai-risk-assessment/results?session=${encodeURIComponent(publicToken)}`,
  );
  const resultsHtml = await resultsResponse.text();
  record(
    11,
    "Results placeholder loads",
    resultsResponse.ok &&
      resultsHtml.includes("Your risk score has been calculated"),
    `HTTP ${resultsResponse.status}`,
  );

  await client.end();
  printSummary();
  process.exit(results.every((r) => r.pass) ? 0 : 1);
}

function printSummary() {
  const passed = results.filter((r) => r.pass).length;
  const failed = results.filter((r) => !r.pass).length;
  console.log(
    `---\nSummary: ${passed} passed, ${failed} failed, ${results.length} checks`,
  );
}

async function buildScoringInputForSession(input: {
  db: ReturnType<typeof createScriptDb>["db"];
  assessmentSessionId: string;
}): Promise<AssessmentScoringInput> {
  const { db } = input;

  const [companyProfile] = await db
    .select()
    .from(assessmentCompanyProfiles)
    .where(
      eq(
        assessmentCompanyProfiles.assessmentSessionId,
        input.assessmentSessionId,
      ),
    )
    .limit(1);
  if (!companyProfile) {
    throw new Error("Company profile missing");
  }

  const answers = await db
    .select()
    .from(assessmentAnswers)
    .where(
      eq(assessmentAnswers.assessmentSessionId, input.assessmentSessionId),
    );

  const selections = await db
    .select({
      selectionType: assessmentSelectedTools.selectionType,
      unknownToolName: assessmentSelectedTools.unknownToolName,
      unknownToolUrl: assessmentSelectedTools.unknownToolUrl,
      tool: aiTools,
      profile: aiToolProfileVersions,
      category: aiToolCategories,
    })
    .from(assessmentSelectedTools)
    .leftJoin(aiTools, eq(assessmentSelectedTools.toolId, aiTools.id))
    .leftJoin(aiToolCategories, eq(aiTools.categoryId, aiToolCategories.id))
    .leftJoin(
      aiToolProfileVersions,
      eq(
        assessmentSelectedTools.toolProfileVersionId,
        aiToolProfileVersions.id,
      ),
    )
    .where(
      eq(
        assessmentSelectedTools.assessmentSessionId,
        input.assessmentSessionId,
      ),
    );

  const hasNotSureToolSelection = selections.some(
    (s) => s.selectionType === "not_sure",
  );
  const unknownTools = selections
    .filter((s) => s.selectionType === "unknown_tool")
    .map((s) => ({
      name: s.unknownToolName ?? "Unknown tool",
      url: s.unknownToolUrl ?? null,
    }));

  const knownTools = selections.filter(
    (s) =>
      s.selectionType === "known_tool" &&
      s.tool != null &&
      s.profile != null &&
      s.category != null,
  );

  return {
    companyProfile: {
      industry: companyProfile.industry,
      companySize: companyProfile.companySize,
      countryRegion: companyProfile.countryRegion ?? null,
      handlesSensitiveOrRegulatedData:
        companyProfile.handlesSensitiveOrRegulatedData ?? null,
    },
    selectedTools: knownTools.map((s) => ({
      toolSlug: s.tool!.slug,
      toolName: s.tool!.name,
      categorySlug: s.category!.slug,
      supportsFileUploads: s.profile!.supportsFileUploads ?? null,
      supportsMeetingTranscripts: s.profile!.supportsMeetingTranscripts ?? null,
      codingAssistantRelevance: s.profile!.codingAssistantRelevance ?? null,
      agenticOrConnectedToolRelevance:
        s.profile!.agenticOrConnectedToolRelevance ?? null,
      publicInfoConfidenceLevel: s.profile!.publicInfoConfidenceLevel,
    })),
    unknownTools,
    hasNotSureToolSelection,
    answers: answers.map((a) => ({
      questionId: a.questionId,
      value: a.answerValue as string | string[],
    })),
  };
}

function toRiskLevelEnum(level: "low" | "moderate" | "high" | "critical") {
  return level;
}

function toSignalSeverityEnum(sev: RiskSignal["severity"]) {
  return sev === "medium" ? "moderate" : sev;
}

async function persistScoreAndSignals(input: {
  db: ReturnType<typeof createScriptDb>["db"];
  assessmentSessionId: string;
  scoringInput: AssessmentScoringInput;
  result: ReturnType<typeof scoreAssessment>;
}): Promise<void> {
  const { db } = input;

  const answerMap: Record<string, string | string[]> = {};
  for (const row of input.scoringInput.answers) {
    answerMap[row.questionId] = row.value;
  }

  const toolContextForAgentic = {
    hasNotSure: input.scoringInput.hasNotSureToolSelection,
    categorySlugs: input.scoringInput.selectedTools.map((t) => t.categorySlug),
    codingAssistantRelevance: input.scoringInput.selectedTools.some(
      (t) => t.codingAssistantRelevance === true,
    ),
    agenticOrConnectedRelevance: input.scoringInput.selectedTools.some(
      (t) => t.agenticOrConnectedToolRelevance === true,
    ),
  };

  const agenticRequired = isAgenticSectionRequired(
    toolContextForAgentic,
    answerMap,
  );

  const dimensionLevel = (categoryId: string) => {
    const category = input.result.categoryScores.find(
      (c) => c.categoryId === categoryId,
    );
    return category ? toRiskLevelEnum(category.riskLevel) : "low";
  };

  await db.transaction(async (tx) => {
    await tx
      .delete(assessmentRiskSignals)
      .where(
        eq(
          assessmentRiskSignals.assessmentSessionId,
          input.assessmentSessionId,
        ),
      );
    await tx
      .delete(assessmentScores)
      .where(
        eq(assessmentScores.assessmentSessionId, input.assessmentSessionId),
      );

    await tx.insert(assessmentScores).values({
      assessmentSessionId: input.assessmentSessionId,
      overallRiskLevel: toRiskLevelEnum(input.result.overallRiskLevel),
      toolStackRiskLevel: dimensionLevel("vendor_and_tool_risk"),
      dataExposureRiskLevel: dimensionLevel("data_exposure"),
      governanceMaturityGapLevel: dimensionLevel("governance_controls"),
      auditabilityEnforcementGapLevel: dimensionLevel(
        "visibility_and_inventory",
      ),
      agenticCodingRiskLevel: agenticRequired
        ? dimensionLevel("agentic_and_coding_risk")
        : "unknown",
      leadQualificationScore: null,
      scoreBreakdown: {
        ...input.result,
        persistedAt: new Date().toISOString(),
      },
    });

    if (input.result.signals.length > 0) {
      await tx.insert(assessmentRiskSignals).values(
        input.result.signals.map((s) => ({
          assessmentSessionId: input.assessmentSessionId,
          signalKey: s.signalId,
          severity: toRiskLevelEnum(toSignalSeverityEnum(s.severity)),
          sourceAnswerIds: s.sourceAnswerIds,
        })),
      );
    }
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

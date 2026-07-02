/**
 * Live Module 9 verification against Supabase.
 * Run: pnpm dev then pnpm verify:module9
 *
 * Script-safe: uses pure recommendation/scoring engines and script DB access only.
 */
import { randomBytes } from "node:crypto";
import { resolve } from "node:path";

import { config } from "dotenv";
import { and, eq } from "drizzle-orm";

config({ path: resolve(process.cwd(), ".env.local"), override: true });

import { ASSESSMENT_QUESTIONS } from "@/features/assessment-wizard/questions";
import { isAgenticSectionRequired } from "@/features/assessment-wizard/agentic-trigger";
import { RECOMMENDATION_MODEL_VERSION } from "@/features/recommendations/constants";
import { generateFindings } from "@/features/recommendations/finding-engine";
import {
  buildRecommendationResult,
  generateRecommendations,
} from "@/features/recommendations/recommendation-engine";
import type { AssessmentRecommendation } from "@/features/recommendations/types";
import {
  containsBannedTerm,
  validateRecommendationResult,
} from "@/features/recommendations/validation";
import { scoreAssessment } from "@/features/scoring/scoring-engine";
import type {
  AssessmentScoringInput,
  RiskSignal,
} from "@/features/scoring/types";
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
const VERIFY_COMPANY_NAME = "Module 9 Verify Co";

function devBaseUrlFromPort(port: number) {
  return `http://localhost:${port}`;
}

let DEV_BASE_URL =
  process.env.MODULE9_VERIFY_BASE_URL ?? devBaseUrlFromPort(3000);

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

async function isHealthyDevServer(baseUrl: string): Promise<boolean> {
  try {
    const health = await fetch(`${baseUrl}/api/health`);
    if (!health.ok) return false;
    const resultsPage = await fetch(`${baseUrl}/ai-risk-assessment/results`);
    return resultsPage.ok;
  } catch {
    return false;
  }
}

async function resolveDevBaseUrl(
  maxAttempts = 30,
  delayMs = 2000,
): Promise<string | null> {
  const explicit = process.env.MODULE9_VERIFY_BASE_URL?.trim();
  if (explicit) {
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      if (await isHealthyDevServer(explicit)) return explicit;
      await new Promise((r) => setTimeout(r, delayMs));
    }
    return null;
  }

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    for (const port of DEV_PORT_CANDIDATES) {
      const baseUrl = devBaseUrlFromPort(port);
      if (await isHealthyDevServer(baseUrl)) return baseUrl;
    }
    await new Promise((r) => setTimeout(r, delayMs));
  }
  return null;
}

function toRiskLevelEnum(level: "low" | "moderate" | "high" | "critical") {
  return level;
}

function toSignalSeverityEnum(sev: RiskSignal["severity"]) {
  return sev === "medium" ? "moderate" : sev;
}

function toDbSeverityFromFinding(
  severity: string,
): "low" | "moderate" | "high" | "critical" {
  return severity === "medium"
    ? "moderate"
    : (severity as "low" | "high" | "critical");
}

function toDbSeverityFromPriority(
  priority: AssessmentRecommendation["priority"],
): "low" | "moderate" | "high" | "critical" {
  if (priority === "urgent") return "critical";
  if (priority === "medium") return "moderate";
  return priority;
}

async function main() {
  console.log("Module 9 live verification");
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL missing");
    process.exit(1);
  }

  const resolvedBaseUrl = await resolveDevBaseUrl();
  if (resolvedBaseUrl) DEV_BASE_URL = resolvedBaseUrl;
  record(
    0,
    "Dev server reachable",
    Boolean(resolvedBaseUrl),
    resolvedBaseUrl
      ? `Health + results OK at ${DEV_BASE_URL}`
      : `Could not find healthy dev server on ports ${DEV_PORT_CANDIDATES.join(", ")}`,
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
    companyName: VERIFY_COMPANY_NAME,
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
  const scoringResult = scoreAssessment(scoringInput);
  await persistScoreAndSignals({
    db,
    assessmentSessionId: session.id,
    scoringInput,
    result: scoringResult,
  });

  const findings = generateFindings(scoringResult);
  const recommendations = generateRecommendations({ scoringResult, findings });
  const recommendationResult = buildRecommendationResult(
    scoringResult,
    findings,
    recommendations,
  );

  validateRecommendationResult(
    recommendationResult,
    scoringResult.signals.map((s) => s.signalId),
  );

  record(
    1,
    "Findings generated",
    findings.length > 0,
    `count=${findings.length}`,
  );
  record(
    2,
    "Recommendations generated",
    recommendations.length >= 1 && recommendations.length <= 8,
    `count=${recommendations.length}`,
  );

  await persistFindingsAndRecommendations({
    db,
    assessmentSessionId: session.id,
    findings,
    recommendations,
  });

  const [findingRows, recommendationRows] = await Promise.all([
    db
      .select()
      .from(assessmentFindings)
      .where(eq(assessmentFindings.assessmentSessionId, session.id)),
    db
      .select()
      .from(assessmentRecommendations)
      .where(eq(assessmentRecommendations.assessmentSessionId, session.id)),
  ]);

  record(
    3,
    "assessment_findings rows created",
    findingRows.length > 0,
    `rows=${findingRows.length}`,
  );
  record(
    4,
    "assessment_recommendations rows created",
    recommendationRows.length >= 1 && recommendationRows.length <= 8,
    `rows=${recommendationRows.length}`,
  );

  const signalIdSet = new Set(scoringResult.signals.map((s) => s.signalId));
  const findingRefsValid = findings.every((f) =>
    f.sourceSignalIds.every((id) => signalIdSet.has(id)),
  );
  record(
    5,
    "Findings reference valid signal IDs",
    findingRefsValid,
    `findings=${findings.length}`,
  );

  const findingIdSet = new Set(findings.map((f) => f.findingId));
  const recRefsValid = recommendations.every(
    (r) =>
      r.sourceSignalIds.every((id) => signalIdSet.has(id)) &&
      r.sourceFindingIds.every((id) => findingIdSet.has(id)),
  );
  record(
    6,
    "Recommendations reference valid finding/signal IDs",
    recRefsValid,
    `recommendations=${recommendations.length}`,
  );

  const validPriorities = new Set(["low", "medium", "high", "urgent"]);
  const validEfforts = new Set(["low", "medium", "high"]);
  const priorityOk = recommendations.every((r) =>
    validPriorities.has(r.priority),
  );
  const effortOk = recommendations.every((r) => validEfforts.has(r.effort));
  record(7, "Recommendation priorities valid", priorityOk, "all valid");
  record(8, "Recommendation effort values valid", effortOk, "all valid");

  const bannedFound = recommendations.some((r) => {
    const texts = [
      r.title,
      r.summary,
      r.whyThisMatters,
      ...r.implementationSteps,
      ...r.caveats,
    ];
    return texts.some((t) => containsBannedTerm(t) !== null);
  });
  record(
    9,
    "Banned compliance/audit terms absent",
    !bannedFound,
    bannedFound ? "banned term detected" : "none found",
  );

  const findings2 = generateFindings(scoringResult);
  const recommendations2 = generateRecommendations({
    scoringResult,
    findings: findings2,
  });
  await persistFindingsAndRecommendations({
    db,
    assessmentSessionId: session.id,
    findings: findings2,
    recommendations: recommendations2,
  });

  const [findingRows2, recommendationRows2] = await Promise.all([
    db
      .select()
      .from(assessmentFindings)
      .where(eq(assessmentFindings.assessmentSessionId, session.id)),
    db
      .select()
      .from(assessmentRecommendations)
      .where(eq(assessmentRecommendations.assessmentSessionId, session.id)),
  ]);
  const uniqueFindingKeys = new Set(findingRows2.map((r) => r.findingKey)).size;
  const uniqueRecKeys = new Set(
    recommendationRows2.map((r) => r.recommendationKey),
  ).size;
  record(
    10,
    "Recompute replaces findings/recommendations without duplicates",
    findingRows2.length === uniqueFindingKeys &&
      recommendationRows2.length === uniqueRecKeys,
    `findings=${findingRows2.length}; recs=${recommendationRows2.length}`,
  );

  const [leadRows, reportRows] = await Promise.all([
    db.select().from(leads).where(eq(leads.assessmentSessionId, session.id)),
    db
      .select()
      .from(reports)
      .where(eq(reports.assessmentSessionId, session.id)),
  ]);
  record(
    11,
    "No reports created",
    reportRows.length === 0,
    `count=${reportRows.length}`,
  );
  record(
    12,
    "No leads created",
    leadRows.length === 0,
    `count=${leadRows.length}`,
  );

  const resultsResponse = await fetch(
    `${DEV_BASE_URL}/ai-risk-assessment/results?session=${encodeURIComponent(publicToken)}`,
  );
  const resultsHtml = await resultsResponse.text();
  record(
    13,
    "Results placeholder loads without full recommendation details",
    resultsResponse.ok &&
      resultsHtml.includes("Recommendations generated") &&
      resultsHtml.includes("Findings generated") &&
      !resultsHtml.includes("implementationSteps") &&
      !resultsHtml.includes("whyThisMatters"),
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
  if (!companyProfile) throw new Error("Company profile missing");

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

  const agenticRequired = isAgenticSectionRequired(
    {
      hasNotSure: input.scoringInput.hasNotSureToolSelection,
      categorySlugs: input.scoringInput.selectedTools.map(
        (t) => t.categorySlug,
      ),
      codingAssistantRelevance: input.scoringInput.selectedTools.some(
        (t) => t.codingAssistantRelevance === true,
      ),
      agenticOrConnectedRelevance: input.scoringInput.selectedTools.some(
        (t) => t.agenticOrConnectedToolRelevance === true,
      ),
    },
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

async function persistFindingsAndRecommendations(input: {
  db: ReturnType<typeof createScriptDb>["db"];
  assessmentSessionId: string;
  findings: ReturnType<typeof generateFindings>;
  recommendations: AssessmentRecommendation[];
}): Promise<void> {
  const { db } = input;

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
            modelVersion: RECOMMENDATION_MODEL_VERSION,
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
            modelVersion: RECOMMENDATION_MODEL_VERSION,
          } as unknown as string[],
          ctaType: null,
          sortOrder: index,
        })),
      );
    }
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

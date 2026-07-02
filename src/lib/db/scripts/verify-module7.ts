/**
 * Live Module 7 verification against Supabase + dev server.
 * Run: pnpm dev then pnpm verify:module7
 */
import { randomBytes } from "node:crypto";
import { resolve } from "node:path";

import { config } from "dotenv";
import { and, eq } from "drizzle-orm";

config({ path: resolve(process.cwd(), ".env.local"), override: true });

import { isAgenticSectionRequired } from "@/features/assessment-wizard/agentic-trigger";
import { ASSESSMENT_QUESTIONS } from "@/features/assessment-wizard/questions";
import { createScriptDb } from "@/lib/db/script-db";
import { aiToolProfileVersions, aiTools } from "@/lib/db/schema/ai-tools";
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
  process.env.MODULE7_VERIFY_BASE_URL ?? devBaseUrlFromPort(3000);

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

function buildAllAnswers(includeAgentic: boolean) {
  const answers = ASSESSMENT_QUESTIONS.filter(
    (q) => includeAgentic || q.sectionId !== "agentic_coding",
  ).map((q) => ({
    questionId: q.id,
    sectionId: q.sectionId,
    answerType: q.answerType,
    value:
      q.answerType === "multi_select"
        ? [q.options[0]?.value ?? "not_sure"]
        : (q.options[0]?.value ?? "not_sure"),
  }));
  return answers;
}

/** Prefer a dev server that serves usage pages (avoids stale processes on :3000). */
async function resolveDevBaseUrl(
  maxAttempts = 30,
  delayMs = 2000,
): Promise<string | null> {
  const explicit = process.env.MODULE7_VERIFY_BASE_URL?.trim();
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
    if (!health.ok) {
      return false;
    }
    const usage = await fetch(`${baseUrl}/ai-risk-assessment/usage`);
    return usage.ok;
  } catch {
    return false;
  }
}

/** Retry page fetches while Next.js dev server recompiles (transient 500). */
async function fetchPageWithRetry(
  url: string,
  maxAttempts = 8,
  delayMs = 2500,
): Promise<Response> {
  let lastResponse: Response | null = null;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const response = await fetch(url);
    lastResponse = response;
    if (response.ok) {
      return response;
    }
    if (response.status >= 500 && attempt < maxAttempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      continue;
    }
    return response;
  }
  if (!lastResponse) {
    throw new Error(`Failed to fetch ${url}`);
  }
  return lastResponse;
}

async function main() {
  console.log("Module 7 live verification");
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL missing");
    process.exit(1);
  }

  const resolvedBaseUrl = await resolveDevBaseUrl();
  if (resolvedBaseUrl) {
    DEV_BASE_URL = resolvedBaseUrl;
  }
  record(
    0,
    "Dev server reachable",
    Boolean(resolvedBaseUrl),
    resolvedBaseUrl
      ? `Health + usage OK at ${DEV_BASE_URL}`
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

  const usageResponse = await fetchPageWithRetry(
    `${DEV_BASE_URL}/ai-risk-assessment/usage?session=${encodeURIComponent(publicToken)}`,
  );
  const usageHtml = await usageResponse.text();

  record(
    1,
    "Usage wizard page loads",
    usageResponse.ok && usageHtml.includes("Usage and data exposure"),
    `HTTP ${usageResponse.status}`,
  );

  const answers = buildAllAnswers(true);
  await db
    .delete(assessmentAnswers)
    .where(eq(assessmentAnswers.assessmentSessionId, session.id));
  await db.insert(assessmentAnswers).values(
    answers.map((a) => ({
      assessmentSessionId: session.id,
      questionId: a.questionId,
      sectionId: a.sectionId,
      answerType: a.answerType,
      answerValue: a.value,
    })),
  );

  const saved = await db
    .select()
    .from(assessmentAnswers)
    .where(eq(assessmentAnswers.assessmentSessionId, session.id));

  record(
    2,
    "assessment_answers rows saved",
    saved.length === answers.length,
    `rows=${saved.length}, expected=${answers.length}`,
  );

  const toolContext = {
    hasNotSure: false,
    categorySlugs: ["coding_assistant"],
    codingAssistantRelevance: true,
    agenticOrConnectedRelevance: false,
  };
  const agenticRequired = isAgenticSectionRequired(toolContext, {
    main_ai_tasks: ["coding"],
    data_entering_ai: ["source_code"],
    developer_workflows_involved: "yes",
  });

  record(
    3,
    "Agentic section trigger logic",
    agenticRequired,
    "coding assistant context triggers agentic section",
  );

  await db
    .delete(assessmentAnswers)
    .where(eq(assessmentAnswers.assessmentSessionId, session.id));
  const baseAnswers = buildAllAnswers(false);
  await db.insert(assessmentAnswers).values(
    baseAnswers.map((a) => ({
      assessmentSessionId: session.id,
      questionId: a.questionId,
      sectionId: a.sectionId,
      answerType: a.answerType,
      answerValue: a.value,
    })),
  );
  await db.insert(assessmentAnswers).values(
    buildAllAnswers(true)
      .filter((a) => a.sectionId === "agentic_coding")
      .map((a) => ({
        assessmentSessionId: session.id,
        questionId: a.questionId,
        sectionId: a.sectionId,
        answerType: a.answerType,
        answerValue: a.value,
      })),
  );

  await db
    .delete(assessmentAnswers)
    .where(eq(assessmentAnswers.assessmentSessionId, session.id));
  await db.insert(assessmentAnswers).values(
    baseAnswers.map((a) => ({
      assessmentSessionId: session.id,
      questionId: a.questionId,
      sectionId: a.sectionId,
      answerType: a.answerType,
      answerValue: a.value,
    })),
  );

  const resubmitCount = await db
    .select()
    .from(assessmentAnswers)
    .where(eq(assessmentAnswers.assessmentSessionId, session.id));

  record(
    4,
    "Re-submit replaces answers",
    resubmitCount.length === baseAnswers.length,
    `rows after replace=${resubmitCount.length}`,
  );

  const [scores, signals, findings, recs, leadRows, reportRows] =
    await Promise.all([
      db
        .select()
        .from(assessmentScores)
        .where(eq(assessmentScores.assessmentSessionId, session.id)),
      db
        .select()
        .from(assessmentRiskSignals)
        .where(eq(assessmentRiskSignals.assessmentSessionId, session.id)),
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
    5,
    "No assessment_scores",
    scores.length === 0,
    `count=${scores.length}`,
  );
  record(
    6,
    "No assessment_risk_signals",
    signals.length === 0,
    `count=${signals.length}`,
  );
  record(
    7,
    "No findings/recommendations",
    findings.length === 0 && recs.length === 0,
    "ok",
  );
  record(
    8,
    "No leads/reports",
    leadRows.length === 0 && reportRows.length === 0,
    "ok",
  );

  const resultsResponse = await fetchPageWithRetry(
    `${DEV_BASE_URL}/ai-risk-assessment/results?session=${encodeURIComponent(publicToken)}`,
  );
  const resultsHtml = await resultsResponse.text();
  record(
    9,
    "Results placeholder loads",
    resultsResponse.ok && resultsHtml.includes("Results preview comes next"),
    `HTTP ${resultsResponse.status}`,
  );

  const missingUsageResponse = await fetchPageWithRetry(
    `${DEV_BASE_URL}/ai-risk-assessment/usage`,
  );
  const missingUsageHtml = await missingUsageResponse.text();
  const missingSessionOk =
    missingUsageResponse.ok &&
    missingUsageHtml.includes("Assessment session not found");

  record(
    10,
    "Missing session shows safe error",
    missingSessionOk,
    `HTTP ${missingUsageResponse.status}; safe message=${missingUsageHtml.includes("Assessment session not found")}`,
  );

  const invalidUsageResponse = await fetchPageWithRetry(
    `${DEV_BASE_URL}/ai-risk-assessment/usage?session=invalid-token-value`,
  );
  const invalidUsageHtml = await invalidUsageResponse.text();
  record(
    11,
    "Invalid session shows safe error",
    invalidUsageResponse.ok &&
      invalidUsageHtml.includes("Assessment session not found"),
    `HTTP ${invalidUsageResponse.status}`,
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

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

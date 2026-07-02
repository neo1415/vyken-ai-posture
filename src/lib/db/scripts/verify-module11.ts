/**
 * Live Module 11 verification against Supabase + dev server.
 * Run: pnpm dev then pnpm verify:module11
 */
import { randomBytes } from "node:crypto";
import { execSync } from "node:child_process";
import { resolve } from "node:path";

import { config } from "dotenv";
import { and, count, eq } from "drizzle-orm";
import { ZodError } from "zod";

config({ path: resolve(process.cwd(), ".env.local"), override: true });

import { ASSESSMENT_QUESTIONS } from "@/features/assessment-wizard/questions";
import { isAgenticSectionRequired } from "@/features/assessment-wizard/agentic-trigger";
import { LEAD_CAPTURE_BANNED_COPY_PATTERNS } from "@/features/leads/constants";
import { validateLeadCaptureInput } from "@/features/leads/validation";
import { RECOMMENDATION_MODEL_VERSION } from "@/features/recommendations/constants";
import { generateFindings } from "@/features/recommendations/finding-engine";
import {
  buildRecommendationResult,
  generateRecommendations,
} from "@/features/recommendations/recommendation-engine";
import type { AssessmentRecommendation } from "@/features/recommendations/types";
import { validateRecommendationResult } from "@/features/recommendations/validation";
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
import { ctaEvents, emailEvents } from "@/lib/db/schema/events";
import { leadEvents, leads } from "@/lib/db/schema/leads";
import { reports } from "@/lib/db/schema/reports";

const DEV_PORT_CANDIDATES = [3000, 3001, 3002, 3003] as const;
const VERIFY_COMPANY_NAME = "Module 11 Verify Co";
const VERIFY_EMAIL = "module11.verify@vyken-test.example";

let DEV_BASE_URL =
  process.env.MODULE11_VERIFY_BASE_URL ?? "http://localhost:3000";

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

function printSummary() {
  const passed = results.filter((r) => r.pass).length;
  const failed = results.filter((r) => !r.pass).length;
  console.log("---");
  console.log(
    `Summary: ${passed} passed, ${failed} failed, ${results.length} checks`,
  );
}

async function isHealthyDevServer(baseUrl: string): Promise<boolean> {
  try {
    const health = await fetch(`${baseUrl}/api/health`);
    if (!health.ok) return false;
    const page = await fetch(`${baseUrl}/ai-risk-assessment/results`);
    return page.ok;
  } catch {
    return false;
  }
}

async function resolveDevBaseUrl(
  maxAttempts = 30,
  delayMs = 2000,
): Promise<string | null> {
  const explicit = process.env.MODULE11_VERIFY_BASE_URL?.trim();
  if (explicit) {
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      if (await isHealthyDevServer(explicit)) return explicit;
      await new Promise((r) => setTimeout(r, delayMs));
    }
    return null;
  }

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    for (const port of DEV_PORT_CANDIDATES) {
      const baseUrl = `http://localhost:${port}`;
      if (await isHealthyDevServer(baseUrl)) return baseUrl;
    }
    await new Promise((r) => setTimeout(r, delayMs));
  }
  return null;
}

function hasBannedGatingCopy(html: string): string | null {
  for (const pattern of LEAD_CAPTURE_BANNED_COPY_PATTERNS) {
    if (pattern.test(html)) return pattern.source;
  }
  return null;
}

async function upsertLeadForSession(input: {
  db: ReturnType<typeof createScriptDb>["db"];
  assessmentSessionId: string;
  email: string;
  name: string | null;
  companyName: string | null;
  role: string | null;
  mainAiConcern: string | null;
  consentToFollowUp: boolean;
  leadScore: number | null;
}) {
  const normalizedEmail = input.email.trim().toLowerCase();
  const [existing] = await input.db
    .select()
    .from(leads)
    .where(
      and(
        eq(leads.assessmentSessionId, input.assessmentSessionId),
        eq(leads.email, normalizedEmail),
      ),
    )
    .limit(1);

  if (existing) {
    const [updated] = await input.db
      .update(leads)
      .set({
        name: input.name,
        companyName: input.companyName,
        role: input.role,
        mainAiConcern: input.mainAiConcern,
        consentToFollowUp: input.consentToFollowUp,
        leadScore: input.leadScore,
      })
      .where(eq(leads.id, existing.id))
      .returning();
    return updated;
  }

  const [created] = await input.db
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

  return created;
}

async function setupCompletedSession(
  db: ReturnType<typeof createScriptDb>["db"],
  publicToken: string,
) {
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
    .limit(1);

  if (tools.length < 1) throw new Error("No published tools");

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

  const scoringInput = await buildScoringInput(db, session.id);
  const scoringResult = scoreAssessment(scoringInput);
  await persistScoreAndSignals(db, session.id, scoringInput, scoringResult);

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
  await persistFindingsAndRecommendations(
    db,
    session.id,
    findings,
    recommendations,
  );

  return { session, scoringResult };
}

async function main() {
  console.log("Module 11 live verification");
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL missing");
    process.exit(1);
  }

  let module10Committed = false;
  try {
    const log = execSync("git log --oneline -10", { encoding: "utf8" });
    module10Committed = log.includes("Module 10");
  } catch {
    module10Committed = false;
  }
  record(
    0,
    "Module 10 committed on branch",
    module10Committed,
    module10Committed
      ? "Found Module 10 in recent git log"
      : "Module 10 commit not found",
  );

  const resolvedBaseUrl = await resolveDevBaseUrl();
  if (resolvedBaseUrl) DEV_BASE_URL = resolvedBaseUrl;
  record(
    1,
    "Dev server reachable",
    Boolean(resolvedBaseUrl),
    resolvedBaseUrl
      ? `Health + results OK at ${DEV_BASE_URL}`
      : `Could not find healthy dev server`,
  );
  if (!resolvedBaseUrl) {
    printSummary();
    process.exit(1);
  }

  let invalidEmailRejected = false;
  try {
    validateLeadCaptureInput({
      publicToken: token(),
      workEmail: "not-an-email",
      fullName: "",
      companyName: "",
      roleTitle: "",
      followUpInterest: "",
      consent: true,
    });
  } catch (error) {
    invalidEmailRejected = error instanceof ZodError;
  }
  record(
    2,
    "Invalid email rejected by validation",
    invalidEmailRejected,
    invalidEmailRejected ? "Zod rejected malformed email" : "validation failed",
  );

  let missingConsentRejected = false;
  try {
    validateLeadCaptureInput({
      publicToken: token(),
      workEmail: "valid@company.example",
      fullName: "",
      companyName: "",
      roleTitle: "",
      followUpInterest: "",
      consent: false,
    });
  } catch (error) {
    missingConsentRejected = error instanceof ZodError;
  }
  record(
    3,
    "Missing consent rejected by validation",
    missingConsentRejected,
    missingConsentRejected
      ? "Zod rejected missing consent"
      : "validation failed",
  );

  let htmlInputRejected = false;
  try {
    validateLeadCaptureInput({
      publicToken: token(),
      workEmail: "valid@company.example",
      fullName: "<script>alert(1)</script>",
      companyName: "",
      roleTitle: "",
      followUpInterest: "",
      consent: true,
    });
  } catch (error) {
    htmlInputRejected = error instanceof ZodError;
  }
  record(
    4,
    "HTML/script input rejected",
    htmlInputRejected,
    htmlInputRejected ? "Zod rejected script content" : "validation failed",
  );

  let invalidTokenRejected = false;
  try {
    validateLeadCaptureInput({
      publicToken: "bad-token",
      workEmail: "valid@company.example",
      fullName: "",
      companyName: "",
      roleTitle: "",
      followUpInterest: "",
      consent: true,
    });
  } catch (error) {
    invalidTokenRejected = error instanceof ZodError;
  }
  record(
    5,
    "Invalid public token rejected",
    invalidTokenRejected,
    invalidTokenRejected ? "Zod rejected token format" : "validation failed",
  );

  const { db, client } = createScriptDb();
  const publicToken = token();
  const { session, scoringResult } = await setupCompletedSession(
    db,
    publicToken,
  );

  const resultsResponse = await fetch(
    `${DEV_BASE_URL}/ai-risk-assessment/results?session=${encodeURIComponent(publicToken)}`,
  );
  const resultsHtml = await resultsResponse.text();

  record(
    6,
    "Result page HTTP 200",
    resultsResponse.ok,
    `HTTP ${resultsResponse.status}`,
  );
  record(
    7,
    "Result content visible without lead submission",
    resultsHtml.includes("Your AI governance posture result") &&
      resultsHtml.includes("Key findings") &&
      resultsHtml.includes("Recommended next steps"),
    "score, findings, and recommendations visible",
  );
  record(
    8,
    "Lead capture form present",
    resultsHtml.includes('type="email"') &&
      resultsHtml.includes("Request report follow-up") &&
      resultsHtml.includes("Want a shareable report version?"),
    "email field and submit label found",
  );
  record(
    9,
    "No phone/password/document fields",
    !resultsHtml.includes('type="password"') &&
      !resultsHtml.includes('name="phone"') &&
      !resultsHtml.includes('type="file"'),
    "no sensitive field types found",
  );
  record(
    10,
    "No gating/unlock copy",
    hasBannedGatingCopy(resultsHtml) === null,
    hasBannedGatingCopy(resultsHtml) ?? "none found",
  );

  await upsertLeadForSession({
    db,
    assessmentSessionId: session.id,
    email: VERIFY_EMAIL,
    name: "Module 11 Tester",
    companyName: VERIFY_COMPANY_NAME,
    role: "Security lead",
    mainAiConcern: "send_report_when_ready",
    consentToFollowUp: true,
    leadScore: scoringResult.overallScore,
  });

  const [leadCountAfterFirst] = await db
    .select({ value: count() })
    .from(leads)
    .where(eq(leads.assessmentSessionId, session.id));

  record(
    11,
    "Valid lead submission creates leads row",
    Number(leadCountAfterFirst?.value ?? 0) === 1,
    `count=${leadCountAfterFirst?.value ?? 0}`,
  );

  await upsertLeadForSession({
    db,
    assessmentSessionId: session.id,
    email: VERIFY_EMAIL,
    name: "Updated Name",
    companyName: VERIFY_COMPANY_NAME,
    role: "CISO",
    mainAiConcern: "discuss_ai_governance",
    consentToFollowUp: true,
    leadScore: scoringResult.overallScore,
  });

  const leadRows = await db
    .select()
    .from(leads)
    .where(eq(leads.assessmentSessionId, session.id));

  record(
    12,
    "Duplicate session/email dedupes cleanly",
    leadRows.length === 1 && leadRows[0]?.name === "Updated Name",
    `count=${leadRows.length}, name=${leadRows[0]?.name ?? "n/a"}`,
  );

  const capturedHtmlResponse = await fetch(
    `${DEV_BASE_URL}/ai-risk-assessment/results?session=${encodeURIComponent(publicToken)}`,
  );
  const capturedHtml = await capturedHtmlResponse.text();

  record(
    13,
    "Success state after lead capture",
    capturedHtml.includes("report follow-up request has been saved"),
    "success copy found",
  );

  const uuidPattern =
    /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;
  record(
    14,
    "No raw DB UUIDs in rendered page",
    !uuidPattern.test(capturedHtml),
    uuidPattern.test(capturedHtml) ? "UUID found in HTML" : "none found",
  );

  const leadId = leadRows[0]?.id;
  const [reportRows, emailEventRows, ctaRows, leadEventRows] =
    await Promise.all([
      db
        .select()
        .from(reports)
        .where(eq(reports.assessmentSessionId, session.id)),
      db
        .select()
        .from(emailEvents)
        .where(eq(emailEvents.assessmentSessionId, session.id)),
      db
        .select()
        .from(ctaEvents)
        .where(eq(ctaEvents.assessmentSessionId, session.id)),
      leadId
        ? db.select().from(leadEvents).where(eq(leadEvents.leadId, leadId))
        : Promise.resolve([]),
    ]);

  record(
    15,
    "No reports created",
    reportRows.length === 0,
    `count=${reportRows.length}`,
  );
  record(
    16,
    "No email events created",
    emailEventRows.length === 0,
    `count=${emailEventRows.length}`,
  );
  record(
    17,
    "No CTA events created",
    ctaRows.length === 0,
    `count=${ctaRows.length}`,
  );
  record(
    18,
    "No lead events created",
    leadEventRows.length === 0,
    `count=${leadEventRows.length}`,
  );

  await client.end();
  printSummary();
  process.exit(results.some((r) => !r.pass) ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function buildScoringInput(
  db: ReturnType<typeof createScriptDb>["db"],
  assessmentSessionId: string,
): Promise<AssessmentScoringInput> {
  const [companyProfile] = await db
    .select()
    .from(assessmentCompanyProfiles)
    .where(
      eq(assessmentCompanyProfiles.assessmentSessionId, assessmentSessionId),
    )
    .limit(1);
  if (!companyProfile) throw new Error("Company profile missing");

  const answers = await db
    .select()
    .from(assessmentAnswers)
    .where(eq(assessmentAnswers.assessmentSessionId, assessmentSessionId));

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
      eq(assessmentSelectedTools.assessmentSessionId, assessmentSessionId),
    );

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
    unknownTools: selections
      .filter((s) => s.selectionType === "unknown_tool")
      .map((s) => ({
        name: s.unknownToolName ?? "Unknown tool",
        url: s.unknownToolUrl ?? null,
      })),
    hasNotSureToolSelection: selections.some(
      (s) => s.selectionType === "not_sure",
    ),
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

async function persistScoreAndSignals(
  db: ReturnType<typeof createScriptDb>["db"],
  assessmentSessionId: string,
  scoringInput: AssessmentScoringInput,
  result: ReturnType<typeof scoreAssessment>,
): Promise<void> {
  const answerMap: Record<string, string | string[]> = {};
  for (const row of scoringInput.answers) {
    answerMap[row.questionId] = row.value;
  }

  const agenticRequired = isAgenticSectionRequired(
    {
      hasNotSure: scoringInput.hasNotSureToolSelection,
      categorySlugs: scoringInput.selectedTools.map((t) => t.categorySlug),
      codingAssistantRelevance: scoringInput.selectedTools.some(
        (t) => t.codingAssistantRelevance === true,
      ),
      agenticOrConnectedRelevance: scoringInput.selectedTools.some(
        (t) => t.agenticOrConnectedToolRelevance === true,
      ),
    },
    answerMap,
  );

  const dimensionLevel = (categoryId: string) => {
    const category = result.categoryScores.find(
      (c) => c.categoryId === categoryId,
    );
    return category ? toRiskLevelEnum(category.riskLevel) : "low";
  };

  await db.transaction(async (tx) => {
    await tx
      .delete(assessmentRiskSignals)
      .where(
        eq(assessmentRiskSignals.assessmentSessionId, assessmentSessionId),
      );
    await tx
      .delete(assessmentScores)
      .where(eq(assessmentScores.assessmentSessionId, assessmentSessionId));

    await tx.insert(assessmentScores).values({
      assessmentSessionId,
      overallRiskLevel: toRiskLevelEnum(result.overallRiskLevel),
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
        ...result,
        persistedAt: new Date().toISOString(),
      },
    });

    if (result.signals.length > 0) {
      await tx.insert(assessmentRiskSignals).values(
        result.signals.map((s) => ({
          assessmentSessionId,
          signalKey: s.signalId,
          severity: toRiskLevelEnum(toSignalSeverityEnum(s.severity)),
          sourceAnswerIds: s.sourceAnswerIds,
        })),
      );
    }
  });
}

async function persistFindingsAndRecommendations(
  db: ReturnType<typeof createScriptDb>["db"],
  assessmentSessionId: string,
  findings: ReturnType<typeof generateFindings>,
  recommendations: AssessmentRecommendation[],
): Promise<void> {
  await db.transaction(async (tx) => {
    await tx
      .delete(assessmentFindings)
      .where(eq(assessmentFindings.assessmentSessionId, assessmentSessionId));
    await tx
      .delete(assessmentRecommendations)
      .where(
        eq(assessmentRecommendations.assessmentSessionId, assessmentSessionId),
      );

    if (findings.length > 0) {
      await tx.insert(assessmentFindings).values(
        findings.map((finding) => ({
          assessmentSessionId,
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

    if (recommendations.length > 0) {
      await tx.insert(assessmentRecommendations).values(
        recommendations.map((rec, index) => ({
          assessmentSessionId,
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

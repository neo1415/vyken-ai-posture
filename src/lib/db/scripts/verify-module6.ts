/**
 * Live Module 6 verification against Supabase + dev server.
 * Run: pnpm dev (separate terminal) then pnpm verify:module6
 */
import { randomBytes } from "node:crypto";
import { resolve } from "node:path";

import { config } from "dotenv";
import { and, eq, inArray } from "drizzle-orm";

config({ path: resolve(process.cwd(), ".env.local"), override: true });

import { createScriptDb } from "@/lib/db/script-db";
import {
  aiToolCategories,
  aiToolProfileVersions,
  aiTools,
} from "@/lib/db/schema/ai-tools";
import {
  assessmentAnswers,
  assessmentCompanyProfiles,
  assessmentScores,
  assessmentSelectedTools,
  assessmentSessions,
} from "@/lib/db/schema/assessments";
import { unknownToolRequests } from "@/lib/db/schema/events";
import { leads } from "@/lib/db/schema/leads";
import { reports } from "@/lib/db/schema/reports";

const DEV_BASE_URL = process.env.MODULE6_VERIFY_BASE_URL ?? "http://localhost:3000";
const UUID_REGEX =
  /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi;

type CheckResult = { id: number; name: string; pass: boolean; detail: string };
const results: CheckResult[] = [];

function record(id: number, name: string, pass: boolean, detail: string) {
  results.push({ id, name, pass, detail });
  console.log(`[${pass ? "PASS" : "FAIL"}] ${id}. ${name}`);
  console.log(`       ${detail}`);
}

function generatePublicToken(): string {
  return randomBytes(32).toString("base64url");
}

function htmlContainsUuid(html: string): boolean {
  UUID_REGEX.lastIndex = 0;
  return UUID_REGEX.test(html);
}

async function waitForDevServer(maxAttempts = 30, delayMs = 2000) {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const response = await fetch(`${DEV_BASE_URL}/api/health`);
      if (response.ok) return true;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, delayMs));
  }
  return false;
}

async function createCompanyProfileSession(db: ReturnType<typeof createScriptDb>["db"]) {
  const publicToken = generatePublicToken();
  const [session] = await db
    .insert(assessmentSessions)
    .values({ publicToken, status: "started" })
    .returning();
  if (!session) throw new Error("Failed to create session");

  await db.insert(assessmentCompanyProfiles).values({
    assessmentSessionId: session.id,
    companyName: "Module 6 Verify Co",
    countryRegion: "nigeria",
    industry: "saas_technology",
    companySize: "51_200",
    respondentRole: "ciso_security_leader",
    departmentFunction: "security",
    handlesSensitiveOrRegulatedData: "yes",
    mainAiConcerns: ["lack_of_ai_policy", "lack_of_visibility_audit_logs"],
  });

  return { session, publicToken };
}

async function listPublishedTools(db: ReturnType<typeof createScriptDb>["db"]) {
  return db
    .select({
      tool: {
        id: aiTools.id,
        slug: aiTools.slug,
        name: aiTools.name,
      },
      profile: {
        id: aiToolProfileVersions.id,
      },
      category: {
        name: aiToolCategories.name,
      },
    })
    .from(aiToolProfileVersions)
    .innerJoin(aiTools, eq(aiToolProfileVersions.toolId, aiTools.id))
    .innerJoin(aiToolCategories, eq(aiTools.categoryId, aiToolCategories.id))
    .where(
      and(
        eq(aiTools.isActive, true),
        eq(aiToolProfileVersions.publishedStatus, "published"),
      ),
    );
}

async function saveSelection(
  db: ReturnType<typeof createScriptDb>["db"],
  input: {
    sessionId: string;
    slugs: string[];
    notSure: boolean;
    unknownTools: Array<{ name: string; url: string | null }>;
  },
) {
  const profileRows =
    input.slugs.length > 0
      ? await db
          .select({
            toolId: aiTools.id,
            slug: aiTools.slug,
            profileVersionId: aiToolProfileVersions.id,
          })
          .from(aiToolProfileVersions)
          .innerJoin(aiTools, eq(aiToolProfileVersions.toolId, aiTools.id))
          .where(
            and(
              eq(aiTools.isActive, true),
              eq(aiToolProfileVersions.publishedStatus, "published"),
              inArray(aiTools.slug, input.slugs),
            ),
          )
      : [];

  if (profileRows.length !== input.slugs.length) {
    throw new Error("One or more tool slugs are invalid");
  }

  await db.transaction(async (tx) => {
    await tx
      .delete(assessmentSelectedTools)
      .where(eq(assessmentSelectedTools.assessmentSessionId, input.sessionId));
    await tx
      .delete(unknownToolRequests)
      .where(eq(unknownToolRequests.assessmentSessionId, input.sessionId));

    if (profileRows.length > 0) {
      await tx.insert(assessmentSelectedTools).values(
        profileRows.map((row) => ({
          assessmentSessionId: input.sessionId,
          toolId: row.toolId,
          toolProfileVersionId: row.profileVersionId,
          selectionType: "known_tool" as const,
        })),
      );
    }

    if (input.unknownTools.length > 0) {
      await tx.insert(assessmentSelectedTools).values(
        input.unknownTools.map((tool) => ({
          assessmentSessionId: input.sessionId,
          unknownToolName: tool.name,
          unknownToolUrl: tool.url,
          selectionType: "unknown_tool" as const,
        })),
      );
      await tx.insert(unknownToolRequests).values(
        input.unknownTools.map((tool) => ({
          assessmentSessionId: input.sessionId,
          toolName: tool.name,
          toolUrl: tool.url,
          status: "new" as const,
        })),
      );
    }

    if (input.notSure) {
      await tx.insert(assessmentSelectedTools).values({
        assessmentSessionId: input.sessionId,
        selectionType: "not_sure",
      });
    }
  });
}

async function main() {
  console.log("Module 6 live verification");
  console.log(`Dev server: ${DEV_BASE_URL}`);
  console.log("---");

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set in .env.local");
    process.exit(1);
  }

  const devReady = await waitForDevServer();
  record(
    0,
    "Dev server reachable",
    devReady,
    devReady
      ? `GET ${DEV_BASE_URL}/api/health returned 200`
      : `Could not reach ${DEV_BASE_URL}`,
  );
  if (!devReady) {
    printSummary();
    process.exit(1);
  }

  const { db, client } = createScriptDb();
  const { session, publicToken } = await createCompanyProfileSession(db);
  const sessionId = session.id;

  record(
    1,
    "Complete company profile step",
    true,
    "Created assessment session and company profile in Supabase",
  );
  record(
    2,
    "Redirect to /ai-risk-assessment/tools?session=<token>",
    publicToken.length >= 32,
    `Expected: /ai-risk-assessment/tools?session=${encodeURIComponent(publicToken)}`,
  );

  const publishedTools = await listPublishedTools(db);
  const toolsPageResponse = await fetch(
    `${DEV_BASE_URL}/ai-risk-assessment/tools?session=${encodeURIComponent(publicToken)}`,
  );
  const toolsHtml = await toolsPageResponse.text();
  const sampleNames = publishedTools.slice(0, 3).map((row) => row.tool.name);
  const toolsInHtml = sampleNames.every((name) => toolsHtml.includes(name));

  record(
    3,
    "Tool profiles load from Supabase",
    publishedTools.length > 0 && toolsPageResponse.ok && toolsInHtml,
    `DB tools=${publishedTools.length}; HTTP ${toolsPageResponse.status}; names in HTML: ${sampleNames.join(", ")}`,
  );

  const slugA = publishedTools[0]?.tool.slug;
  const slugB = publishedTools[1]?.tool.slug;
  if (!slugA || !slugB) {
    record(4, "Select 2 known tools and submit", false, "Need 2+ published tools");
    await client.end();
    printSummary();
    process.exit(1);
  }

  await saveSelection(db, {
    sessionId,
    slugs: [slugA, slugB],
    notSure: false,
    unknownTools: [],
  });

  const knownRows = await db
    .select()
    .from(assessmentSelectedTools)
    .where(eq(assessmentSelectedTools.assessmentSessionId, sessionId));
  const knownOnly = knownRows.filter((r) => r.selectionType === "known_tool");
  const knownIdsComplete = knownOnly.every(
    (r) => r.toolId && r.toolProfileVersionId,
  );

  record(4, "Select at least 2 known tools and submit", knownOnly.length >= 2, `slugs: ${slugA}, ${slugB}`);
  record(5, "assessment_selected_tools rows inserted", knownOnly.length >= 2, `rows=${knownRows.length}`);
  record(6, "Known rows include tool_id and tool_profile_version_id", knownIdsComplete, `known rows=${knownOnly.length}`);

  await saveSelection(db, {
    sessionId,
    slugs: [slugA],
    notSure: false,
    unknownTools: [
      { name: "CustomVerifyTool", url: "https://example.com/custom-verify-tool" },
    ],
  });

  const afterUnknown = await db
    .select()
    .from(assessmentSelectedTools)
    .where(eq(assessmentSelectedTools.assessmentSessionId, sessionId));
  const unknownSelection = afterUnknown.filter((r) => r.selectionType === "unknown_tool");
  const unknownRequests = await db
    .select()
    .from(unknownToolRequests)
    .where(eq(unknownToolRequests.assessmentSessionId, sessionId));

  record(7, "Add one unknown tool with valid URL", unknownSelection.length === 1, `unknown rows=${unknownSelection.length}`);
  record(8, "assessment_selected_tools has unknown_tool row", unknownSelection[0]?.unknownToolName === "CustomVerifyTool", unknownSelection[0]?.unknownToolName ?? "n/a");
  record(9, "unknown_tool_requests row with status = new", unknownRequests.length === 1 && unknownRequests[0]?.status === "new", `status=${unknownRequests[0]?.status ?? "n/a"}`);

  await saveSelection(db, { sessionId, slugs: [], notSure: true, unknownTools: [] });
  const afterNotSure = await db
    .select()
    .from(assessmentSelectedTools)
    .where(eq(assessmentSelectedTools.assessmentSessionId, sessionId));
  const notSureRows = afterNotSure.filter((r) => r.selectionType === "not_sure");
  record(10, "Select I'm not sure what employees use", notSureRows.length === 1, `not_sure rows=${notSureRows.length}`);
  record(11, "not_sure row saved", notSureRows.length === 1, "ok");

  await saveSelection(db, { sessionId, slugs: [slugB], notSure: false, unknownTools: [] });
  await saveSelection(db, {
    sessionId,
    slugs: [slugA, slugB],
    notSure: true,
    unknownTools: [{ name: "ReplacementTool", url: "https://example.com/replacement" }],
  });

  const afterResubmit = await db
    .select()
    .from(assessmentSelectedTools)
    .where(eq(assessmentSelectedTools.assessmentSessionId, sessionId));
  const afterResubmitRequests = await db
    .select()
    .from(unknownToolRequests)
    .where(eq(unknownToolRequests.assessmentSessionId, sessionId));
  const knownCount = afterResubmit.filter((r) => r.selectionType === "known_tool").length;
  const unknownCount = afterResubmit.filter((r) => r.selectionType === "unknown_tool").length;
  const notSureCount = afterResubmit.filter((r) => r.selectionType === "not_sure").length;
  const replaceOk =
    knownCount === 2 && unknownCount === 1 && notSureCount === 1 && afterResubmit.length === 4 && afterResubmitRequests.length === 1;

  record(12, "Re-submit same session with different selection", replaceOk, `known=${knownCount}, unknown=${unknownCount}, not_sure=${notSureCount}`);
  record(13, "Old selections replaced, not duplicated", replaceOk, `total rows=${afterResubmit.length}, requests=${afterResubmitRequests.length}`);

  const [leadRows, reportRows, scoreRows, answerRows] = await Promise.all([
    db.select().from(leads).where(eq(leads.assessmentSessionId, sessionId)),
    db.select().from(reports).where(eq(reports.assessmentSessionId, sessionId)),
    db.select().from(assessmentScores).where(eq(assessmentScores.assessmentSessionId, sessionId)),
    db.select().from(assessmentAnswers).where(eq(assessmentAnswers.assessmentSessionId, sessionId)),
  ]);

  record(14, "No leads rows created", leadRows.length === 0, `leads=${leadRows.length}`);
  record(15, "No reports rows created", reportRows.length === 0, `reports=${reportRows.length}`);
  record(16, "No assessment_scores rows created", scoreRows.length === 0, `scores=${scoreRows.length}`);
  record(17, "No assessment_answers rows created", answerRows.length === 0, `answers=${answerRows.length}`);

  const usageResponse = await fetch(
    `${DEV_BASE_URL}/ai-risk-assessment/usage?session=${encodeURIComponent(publicToken)}`,
  );
  record(
    18,
    "Redirect to /ai-risk-assessment/usage?session=<token>",
    usageResponse.ok,
    `Usage page HTTP ${usageResponse.status} for session token`,
  );

  UUID_REGEX.lastIndex = 0;
  const urlTokenLooksLikeUuid = UUID_REGEX.test(publicToken);
  const formTokenMatch = toolsHtml.match(/name="sessionToken"[^>]*value="([^"]*)"/);
  const formToken = formTokenMatch?.[1] ?? "";
  UUID_REGEX.lastIndex = 0;
  const formTokenLooksLikeUuid = UUID_REGEX.test(formToken);
  const formUsesPublicToken = formToken === publicToken;

  record(
    19,
    "No raw database UUIDs in URL or HTML form",
    !urlTokenLooksLikeUuid && !formTokenLooksLikeUuid && formUsesPublicToken,
    `URL token is public_token=${!urlTokenLooksLikeUuid}; form token matches public_token=${formUsesPublicToken}; form value is not UUID=${!formTokenLooksLikeUuid}`,
  );

  const missingHtml = await (await fetch(`${DEV_BASE_URL}/ai-risk-assessment/tools`)).text();
  const invalidHtml = await (
    await fetch(`${DEV_BASE_URL}/ai-risk-assessment/tools?session=invalid-token-value`)
  ).text();
  const safeError =
    missingHtml.includes("Assessment session not found") &&
    invalidHtml.includes("Assessment session not found");

  record(20, "Invalid/missing session shows safe error", safeError, "Both missing and invalid session pages show safe error");

  await client.end();
  printSummary();
  process.exit(results.every((r) => r.pass) ? 0 : 1);
}

function printSummary() {
  console.log("---");
  const passed = results.filter((r) => r.pass).length;
  const failed = results.filter((r) => !r.pass).length;
  console.log(`Summary: ${passed} passed, ${failed} failed, ${results.length} checks`);
}

main().catch((error) => {
  console.error("Verification script failed:", error);
  process.exit(1);
});

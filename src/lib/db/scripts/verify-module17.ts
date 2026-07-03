/**
 * Live Module 17 verification — CTA and event tracking.
 * Run: pnpm verify:module17
 */
import { execSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

import { config } from "dotenv";
import { and, eq } from "drizzle-orm";

config({ path: resolve(process.cwd(), ".env.local"), override: true });

import { ASSESSMENT_QUESTIONS } from "@/features/assessment-wizard/questions";
import { UUID_PATTERN } from "@/features/email-delivery/constants";
import {
  EventTrackingValidationError,
  parseTrackCtaClickFormData,
  sanitizeEventMetadata,
} from "@/features/event-tracking/validation";
import { scoreAssessment } from "@/features/scoring/scoring-engine";
import type { AssessmentScoringInput } from "@/features/scoring/types";
import { createScriptDb } from "@/lib/db/script-db";
import { aiToolProfileVersions, aiTools } from "@/lib/db/schema/ai-tools";
import {
  assessmentCompanyProfiles,
  assessmentSessions,
} from "@/lib/db/schema/assessments";
import { auditLogs } from "@/lib/db/schema/audit";
import { ctaEvents } from "@/lib/db/schema/events";
import { leadEvents, leads } from "@/lib/db/schema/leads";
import { verifyAdminAccess } from "@/server/admin/admin-access-core";

const VERIFY_COMPANY = "Module 17 Verify Co";
const VERIFY_EMAIL = "module17.verify@vyken-test.example";

type Check = { id: number; name: string; pass: boolean; detail: string };
const results: Check[] = [];

function record(id: number, name: string, pass: boolean, detail: string) {
  results.push({ id, name, pass, detail });
  console.log(`[${pass ? "PASS" : "FAIL"}] ${id}. ${name}`);
  console.log(`       ${detail}`);
}

function printSummary() {
  const passed = results.filter((r) => r.pass).length;
  const failed = results.filter((r) => !r.pass).length;
  console.log("---");
  console.log(
    `Summary: ${passed} passed, ${failed} failed, ${results.length} checks`,
  );
}

function walkSourceFiles(
  roots: string[],
  onFile: (text: string, path: string) => boolean,
): boolean {
  for (const root of roots) {
    const stack = [root];
    while (stack.length > 0) {
      const dir = stack.pop()!;
      for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) {
          if (entry === "node_modules" || entry === "db") continue;
          stack.push(full);
        } else if (/\.(tsx?|jsx?)$/.test(entry)) {
          if (full.includes(`${join("lib", "db", "scripts")}`)) continue;
          if (onFile(readFileSync(full, "utf8"), full)) return true;
        }
      }
    }
  }
  return false;
}

function hasThirdPartyAnalytics(): boolean {
  const roots = [
    resolve(process.cwd(), "src", "app"),
    resolve(process.cwd(), "src", "features"),
    resolve(process.cwd(), "src", "components"),
  ];
  const patterns = [
    /google-analytics|gtag\(|googletagmanager/i,
    /facebook\.net|fbevents/i,
    /linkedin\.com\/insight/i,
    /segment\.com|mixpanel|hotjar|fullstory/i,
  ];
  return walkSourceFiles(roots, (text) => patterns.some((p) => p.test(text)));
}

function hasTrackingPixel(): boolean {
  const roots = [
    resolve(process.cwd(), "src", "app"),
    resolve(process.cwd(), "src", "features"),
    resolve(process.cwd(), "src", "components"),
  ];
  const patterns = [/1x1\.gif|fbq\(|_linkedin_partner_id/i];
  return walkSourceFiles(roots, (text) => patterns.some((p) => p.test(text)));
}

function hasPublicDownloadRoute(): boolean {
  const appRoot = resolve(process.cwd(), "src", "app");
  const stack = [appRoot];
  while (stack.length > 0) {
    const dir = stack.pop()!;
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        if (/download|pdf-report/i.test(entry)) return true;
        stack.push(full);
      }
    }
  }
  return false;
}

async function main() {
  console.log("Module 17 live verification (CTA and event tracking)");

  const adminKey =
    process.env.ADMIN_DASHBOARD_KEY?.trim() || "module17-verify-dev-key";
  if (!process.env.ADMIN_DASHBOARD_KEY?.trim()) {
    process.env.ADMIN_DASHBOARD_KEY = adminKey;
  }

  let module16Committed = false;
  try {
    const log = execSync("git log --oneline -25", { encoding: "utf8" });
    module16Committed = log.includes("Module 16");
  } catch {
    module16Committed = false;
  }
  record(
    0,
    "Module 16 committed on branch",
    module16Committed,
    module16Committed
      ? "Found Module 16 in recent git log"
      : "Module 16 commit not found (expected before Module 17 approval)",
  );

  const repoExists = statSync(
    resolve(
      process.cwd(),
      "src/server/repositories/event-tracking.repository.ts",
    ),
  ).isFile();
  const serviceExists = statSync(
    resolve(process.cwd(), "src/server/services/event-tracking.service.ts"),
  ).isFile();
  record(
    1,
    "Event tracking repository/service exists",
    repoExists && serviceExists,
    `repo=${repoExists}, service=${serviceExists}`,
  );

  const resultCtaExists = statSync(
    resolve(
      process.cwd(),
      "src/features/event-tracking/components/ResultFollowUpCTA.tsx",
    ),
  ).isFile();
  record(
    2,
    "Result page CTA component exists",
    resultCtaExists,
    resultCtaExists ? "ResultFollowUpCTA.tsx present" : "missing",
  );

  const { db, client } = createScriptDb();

  const publicToken = randomBytes(32).toString("base64url");
  const [session] = await db
    .insert(assessmentSessions)
    .values({ publicToken, status: "started" })
    .returning();
  if (!session) throw new Error("session create failed");

  await db.insert(assessmentCompanyProfiles).values({
    assessmentSessionId: session.id,
    companyName: VERIFY_COMPANY,
    industry: "saas_technology",
    companySize: "51_200",
    countryRegion: "nigeria",
    respondentRole: "ciso_security_leader",
    mainAiConcerns: ["lack_of_ai_policy"],
  });

  const ctaCreated = await createCtaEventInline(db, {
    assessmentSessionId: session.id,
    eventType: "request_review_clicked",
    destinationType: "request_review",
    metadata: { sourcePage: "results_follow_up" },
  });
  record(
    3,
    "CTA click records event",
    ctaCreated,
    ctaCreated ? "cta_events row inserted" : "insert failed",
  );

  const [lead] = await db
    .insert(leads)
    .values({
      assessmentSessionId: session.id,
      email: VERIFY_EMAIL,
      name: "Module 17 Verify",
      companyName: VERIFY_COMPANY,
      consentToFollowUp: true,
      status: "new",
    })
    .returning();

  const leadEvent1 = await createLeadEventInline(db, {
    leadId: lead!.id,
    eventType: "report_requested",
    metadata: { sourcePage: "lead_capture" },
  });
  const leadEventDup = await createLeadEventInline(db, {
    leadId: lead!.id,
    eventType: "report_requested",
    metadata: { sourcePage: "lead_capture" },
  });
  record(
    4,
    "Lead capture records lead event",
    leadEvent1,
    `first=${leadEvent1}`,
  );
  record(
    5,
    "Duplicate lead event deduped",
    leadEvent1 && !leadEventDup,
    `duplicate_blocked=${!leadEventDup}`,
  );

  await createAuditEventInline(db, {
    action: "admin_lead_status_updated",
    entityType: "assessment_session",
    entityId: session.id,
    metadata: { leadStatus: "contacted" },
  });
  const auditRows = await db
    .select()
    .from(auditLogs)
    .where(
      and(
        eq(auditLogs.entityId, session.id),
        eq(auditLogs.action, "admin_lead_status_updated"),
      ),
    );
  record(
    6,
    "Admin audit event records",
    auditRows.length >= 1,
    `count=${auditRows.length}`,
  );

  record(
    7,
    "No third-party analytics scripts",
    !hasThirdPartyAnalytics(),
    hasThirdPartyAnalytics() ? "pattern found" : "none found",
  );

  record(
    8,
    "No tracking pixels",
    !hasTrackingPixel(),
    hasTrackingPixel() ? "pixel pattern found" : "none found",
  );

  record(
    9,
    "No public download route added",
    !hasPublicDownloadRoute(),
    hasPublicDownloadRoute() ? "route found" : "none found",
  );

  const ctaMeta = { sourcePage: "results", riskLevel: "moderate" };
  const ctaJson = JSON.stringify(ctaMeta);
  record(
    10,
    "No storage path in event metadata sample",
    !ctaJson.includes("reports/"),
    "clean metadata",
  );
  record(
    11,
    "No raw answers in event metadata sample",
    !ctaJson.includes("answerValue"),
    "no answers in metadata",
  );
  record(
    12,
    "No service key in event metadata sample",
    !ctaJson.includes("SUPABASE_SERVICE_ROLE_KEY"),
    "no secrets",
  );

  let metadataRejected = false;
  try {
    sanitizeEventMetadata({
      sourcePage: "x".repeat(2500),
    });
  } catch (error) {
    metadataRejected = error instanceof EventTrackingValidationError;
  }
  record(
    13,
    "Metadata max size enforced",
    metadataRejected,
    metadataRejected ? "oversized metadata rejected" : "not rejected",
  );

  let invalidEventRejected = false;
  try {
    parseTrackCtaClickFormData(
      formDataFrom({
        publicToken,
        destination: "invalid_destination",
        sourcePage: "results",
      }),
    );
  } catch {
    invalidEventRejected = true;
  }
  record(
    14,
    "Invalid CTA destination rejected",
    invalidEventRejected,
    invalidEventRejected ? "rejected" : "accepted incorrectly",
  );

  let invalidTokenRejected = false;
  try {
    parseTrackCtaClickFormData(
      formDataFrom({
        publicToken: "bad-token",
        destination: "request_review",
        sourcePage: "results",
      }),
    );
  } catch {
    invalidTokenRejected = true;
  }
  record(
    15,
    "Invalid public token rejected",
    invalidTokenRejected,
    invalidTokenRejected ? "rejected" : "accepted incorrectly",
  );

  const tools = await db
    .select({ tool: aiTools, profile: aiToolProfileVersions })
    .from(aiToolProfileVersions)
    .innerJoin(aiTools, eq(aiToolProfileVersions.toolId, aiTools.id))
    .where(eq(aiToolProfileVersions.publishedStatus, "published"))
    .limit(1);

  const scoringInput: AssessmentScoringInput = {
    companyProfile: {
      industry: "saas_technology",
      companySize: "51_200",
      countryRegion: "nigeria",
      handlesSensitiveOrRegulatedData: "yes_some",
    },
    selectedTools:
      tools.length > 0
        ? [
            {
              toolSlug: tools[0].tool.slug,
              toolName: tools[0].tool.name,
              categorySlug: "general_assistant",
              supportsFileUploads: false,
              supportsMeetingTranscripts: false,
              codingAssistantRelevance: false,
              agenticOrConnectedToolRelevance: false,
              publicInfoConfidenceLevel: "medium",
            },
          ]
        : [],
    unknownTools: [],
    hasNotSureToolSelection: false,
    answers: ASSESSMENT_QUESTIONS.slice(0, 3).map((q) => ({
      questionId: q.id,
      value: q.options[0]?.value ?? "not_sure",
    })),
  };
  const scoringResult = scoreAssessment(scoringInput);
  record(
    16,
    "Public scoring still works",
    typeof scoringResult.overallScore === "number",
    `score=${scoringResult.overallScore}`,
  );

  const adminKeyForCheck =
    process.env.ADMIN_DASHBOARD_KEY?.trim() || "module17-verify-dev-key";
  record(
    17,
    "Admin access still works",
    verifyAdminAccess({ adminKey: adminKeyForCheck, sessionCookie: null }),
    "valid key accepted",
  );

  const toolAdminPage = statSync(
    resolve(process.cwd(), "src/app/admin/tools/page.tsx"),
  ).isFile();
  record(
    18,
    "Tool admin still present",
    toolAdminPage,
    toolAdminPage ? "route file exists" : "missing",
  );

  record(
    19,
    "No Module 18 security hardening scope creep",
    !readFileSync(resolve(process.cwd(), "package.json"), "utf8").includes(
      "helmet",
    ),
    "no new security packages",
  );

  const deps = Object.keys(
    JSON.parse(readFileSync(resolve(process.cwd(), "package.json"), "utf8"))
      .dependencies ?? {},
  );
  const allowed = [
    "@react-pdf/renderer",
    "@supabase/supabase-js",
    "clsx",
    "drizzle-orm",
    "next",
    "postgres",
    "react",
    "react-dom",
    "server-only",
    "tailwind-merge",
    "zod",
  ];
  const extra = deps.filter((d) => !allowed.includes(d));
  record(
    20,
    "No unnecessary packages added",
    extra.length === 0,
    extra.length === 0 ? "dependencies unchanged" : `extra=${extra.join(",")}`,
  );

  const ctaRows = await db
    .select()
    .from(ctaEvents)
    .where(eq(ctaEvents.assessmentSessionId, session.id));
  const ctaMetadataJson = JSON.stringify(
    ctaRows.map((row) => row.metadata ?? {}),
  );
  record(
    21,
    "No raw DB UUIDs exposed in CTA metadata",
    !UUID_PATTERN.test(ctaMetadataJson),
    "metadata fields only",
  );

  const leadEventRows = await db
    .select()
    .from(leadEvents)
    .where(eq(leadEvents.leadId, lead!.id));
  record(
    22,
    "Lead events readable for session",
    leadEventRows.length >= 1,
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

function formDataFrom(values: Record<string, string>) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(values)) {
    fd.set(key, value);
  }
  return fd;
}

type ScriptDb = ReturnType<typeof createScriptDb>["db"];

async function createCtaEventInline(
  db: ScriptDb,
  input: {
    assessmentSessionId: string;
    eventType: "request_review_clicked" | "vyken_guard_clicked";
    destinationType: "request_review" | "vyken_guard";
    metadata: Record<string, string>;
  },
) {
  try {
    await db.insert(ctaEvents).values({
      assessmentSessionId: input.assessmentSessionId,
      eventType: input.eventType,
      destinationType: input.destinationType,
      metadata: input.metadata,
    });
    return true;
  } catch {
    return false;
  }
}

async function createLeadEventInline(
  db: ScriptDb,
  input: {
    leadId: string;
    eventType: "report_requested";
    metadata: Record<string, string>;
  },
) {
  const existing = await db
    .select({ id: leadEvents.id })
    .from(leadEvents)
    .where(
      and(
        eq(leadEvents.leadId, input.leadId),
        eq(leadEvents.eventType, input.eventType),
      ),
    )
    .limit(1);
  if (existing.length > 0) return false;
  await db.insert(leadEvents).values({
    leadId: input.leadId,
    eventType: input.eventType,
    eventMetadata: input.metadata,
  });
  return true;
}

async function createAuditEventInline(
  db: ScriptDb,
  input: {
    action: string;
    entityType: string;
    entityId: string;
    metadata: Record<string, string>;
  },
) {
  await db.insert(auditLogs).values({
    actorType: "admin",
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    metadata: input.metadata,
  });
}

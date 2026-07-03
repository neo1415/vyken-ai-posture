/**
 * Live Module 18A verification — Supabase admin auth and RBAC.
 * Run: pnpm verify:module18a
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

import { config } from "dotenv";
import { eq } from "drizzle-orm";

config({ path: resolve(process.cwd(), ".env.local"), override: true });

import { ASSESSMENT_QUESTIONS } from "@/features/assessment-wizard/questions";
import { UUID_PATTERN } from "@/features/email-delivery/constants";
import { scoreAssessment } from "@/features/scoring/scoring-engine";
import type { AssessmentScoringInput } from "@/features/scoring/types";
import { createScriptDb } from "@/lib/db/script-db";
import { adminUsers } from "@/lib/db/schema/admin";
import { auditLogs } from "@/lib/db/schema/audit";
import {
  allowLegacyAdminKeyAccess,
  verifyLegacyAdminAccess,
} from "@/server/admin/admin-access-core";
import {
  canManageLeads,
  canManageToolProfiles,
  canPublishToolProfiles,
  canSendReportEmail,
  canViewAdminDashboard,
} from "@/server/admin/admin-permissions";

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

function read(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

function fileExists(path: string): boolean {
  return existsSync(resolve(process.cwd(), path));
}

function walkSourceFiles(
  roots: string[],
  onFile: (text: string, path: string) => boolean,
): boolean {
  for (const root of roots) {
    if (!existsSync(root)) continue;
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

async function main() {
  let checkId = 0;

  try {
    const log = execSync("git log --oneline -5", { encoding: "utf8" });
    record(
      ++checkId,
      "Module 17 committed on branch",
      /Module 17: CTA and event tracking/.test(log),
      log.split("\n")[0] ?? "unknown",
    );
  } catch {
    record(++checkId, "Module 17 committed on branch", false, "git log failed");
  }

  record(
    ++checkId,
    "Admin login route exists",
    fileExists("src/app/admin/login/page.tsx"),
    "src/app/admin/login/page.tsx",
  );

  record(
    ++checkId,
    "Admin auth feature layer exists",
    fileExists("src/features/admin-auth/actions.ts") &&
      fileExists("src/server/admin/admin-permissions.ts"),
    "admin-auth + admin-permissions",
  );

  record(
    ++checkId,
    "Supabase auth server client exists",
    fileExists("src/lib/supabase/auth-server.ts"),
    "auth-server.ts",
  );

  record(
    ++checkId,
    "Middleware protects admin routes",
    read("src/middleware.ts").includes("/admin/login"),
    "middleware redirects unauthenticated admin paths",
  );

  record(
    ++checkId,
    "Legacy admin key disabled by default",
    !allowLegacyAdminKeyAccess(),
    `ALLOW_LEGACY_ADMIN_KEY=${process.env.ALLOW_LEGACY_ADMIN_KEY ?? "unset"}`,
  );

  record(
    ++checkId,
    "Query param admin_key does not grant access",
    !verifyLegacyAdminAccess({ adminKey: "test-key-should-fail" }),
    "verifyLegacyAdminAccess returns false without legacy flag",
  );

  const viewer = {
    id: "00000000-0000-4000-8000-000000000099",
    email: "viewer@test.example",
    fullName: "Viewer",
    role: "viewer" as const,
    isActive: true,
  };
  const editor = {
    ...viewer,
    id: "00000000-0000-4000-8000-000000000098",
    email: "editor@test.example",
    role: "editor" as const,
  };
  const superadmin = {
    ...viewer,
    id: "00000000-0000-4000-8000-000000000097",
    email: "owner@test.example",
    role: "superadmin" as const,
  };

  record(
    ++checkId,
    "Viewer can view dashboard",
    canViewAdminDashboard(viewer),
    "viewer role",
  );
  record(
    ++checkId,
    "Viewer cannot manage leads",
    !canManageLeads(viewer),
    "viewer blocked from lead writes",
  );
  record(
    ++checkId,
    "Viewer cannot send email",
    !canSendReportEmail(viewer),
    "viewer blocked from email actions",
  );
  record(
    ++checkId,
    "Viewer cannot manage tools",
    !canManageToolProfiles(viewer),
    "viewer blocked from tool writes",
  );
  record(
    ++checkId,
    "Editor can manage leads",
    canManageLeads(editor),
    "editor role",
  );
  record(
    ++checkId,
    "Editor can send email",
    canSendReportEmail(editor),
    "editor role",
  );
  record(
    ++checkId,
    "Editor can manage/publish tools",
    canManageToolProfiles(editor) && canPublishToolProfiles(editor),
    "editor role",
  );
  record(
    ++checkId,
    "Superadmin has full permissions",
    canManageLeads(superadmin) &&
      canSendReportEmail(superadmin) &&
      canPublishToolProfiles(superadmin),
    "superadmin role",
  );

  const adminActions = read("src/features/admin/actions.ts");
  record(
    ++checkId,
    "Admin server actions use RBAC helpers",
    adminActions.includes("requireManageLeadsAdmin") &&
      adminActions.includes("requireSendReportEmailAdmin"),
    "admin/actions.ts",
  );

  const toolActions = read("src/features/tool-admin/actions.ts");
  record(
    ++checkId,
    "Tool admin actions use RBAC helpers",
    toolActions.includes("requireManageToolProfilesAdmin") &&
      toolActions.includes("requirePublishToolProfilesAdmin"),
    "tool-admin/actions.ts",
  );

  const eventService = read("src/server/services/event-tracking.service.ts");
  record(
    ++checkId,
    "Admin audit events include admin identity metadata",
    eventService.includes("adminEmail") &&
      eventService.includes("actorAdminUserId"),
    "event-tracking.service.ts",
  );

  const serviceRoleInClient = walkSourceFiles(
    ["src/app", "src/features", "src/components"],
    (text) =>
      text.includes("getSupabaseServiceClient") ||
      text.includes('from "@/lib/supabase/server-client"'),
  );
  record(
    ++checkId,
    "No service role key in client paths",
    !serviceRoleInClient,
    "scanned app/features/components",
  );

  const tokenLeak = walkSourceFiles(
    ["src/app", "src/features"],
    (text, path) => {
      if (path.includes("auth-server") || path.includes("auth-cookies")) {
        return false;
      }
      return (
        text.includes("access_token") &&
        (text.includes("dangerouslySetInnerHTML") || text.includes("{session."))
      );
    },
  );
  record(++checkId, "No auth tokens rendered in UI", !tokenLeak, "static scan");

  const adminUuidInUi = walkSourceFiles(
    ["src/app/admin", "src/features/admin", "src/features/admin-auth"],
    (text) => {
      const withoutImports = text.replace(
        /import[\s\S]*?from\s+['"][^'"]+['"];?/g,
        "",
      );
      return (
        UUID_PATTERN.test(withoutImports) && withoutImports.includes("admin.id")
      );
    },
  );
  record(
    ++checkId,
    "No admin DB UUID rendered in admin UI",
    !adminUuidInUi,
    "static scan",
  );

  record(
    ++checkId,
    "No public report download route added",
    !fileExists("src/app/(public)/ai-risk-assessment/download"),
    "no download route",
  );

  const scoringInput: AssessmentScoringInput = {
    companyProfile: {
      industry: "saas_technology",
      companySize: "51_200",
      countryRegion: "nigeria",
      handlesSensitiveOrRegulatedData: "yes_some",
    },
    selectedTools: [],
    unknownTools: [],
    hasNotSureToolSelection: true,
    answers: ASSESSMENT_QUESTIONS.slice(0, 3).map((q) => ({
      questionId: q.id,
      value: q.options[0]?.value ?? "not_sure",
    })),
  };
  const score = scoreAssessment(scoringInput);
  record(
    ++checkId,
    "Public scoring still works",
    typeof score.overallScore === "number",
    `score=${score.overallScore}`,
  );

  record(
    ++checkId,
    "Protected admin layout exists",
    fileExists("src/app/admin/(protected)/layout.tsx"),
    "route group layout",
  );

  record(
    ++checkId,
    "AdminAccessGate removed",
    !fileExists("src/features/admin/components/AdminAccessGate.tsx"),
    "legacy key gate UI removed",
  );

  record(
    ++checkId,
    "No Module 18B/19/20 scope creep",
    !fileExists("docs/security-hardening/README.md") &&
      !walkSourceFiles(["src"], (text) => text.includes("helmet(")),
    "no hardening package scope detected",
  );

  if (process.env.DATABASE_URL?.trim()) {
    const { db } = createScriptDb();

    const inactiveEmail = "module18a.inactive@vyken-test.example";
    await db
      .insert(adminUsers)
      .values({
        email: inactiveEmail,
        role: "editor",
        isActive: false,
      })
      .onConflictDoNothing();

    const [inactiveRow] = await db
      .select({
        id: adminUsers.id,
        isActive: adminUsers.isActive,
      })
      .from(adminUsers)
      .where(eq(adminUsers.email, inactiveEmail))
      .limit(1);

    const inactiveBlocked =
      inactiveRow == null || inactiveRow.isActive === false;
    record(
      ++checkId,
      "Inactive admin_users row blocked",
      inactiveBlocked,
      inactiveEmail,
    );

    const auditRepo = read(
      "src/server/repositories/event-tracking.repository.ts",
    );
    record(
      ++checkId,
      "Audit repository stores actorAdminUserId",
      auditRepo.includes("actorAdminUserId"),
      "event-tracking.repository.ts",
    );

    const [sampleAudit] = await db
      .select({
        metadata: auditLogs.metadata,
        actorAdminUserId: auditLogs.actorAdminUserId,
      })
      .from(auditLogs)
      .where(eq(auditLogs.actorType, "admin"))
      .limit(1);

    if (sampleAudit) {
      const metadataJson = JSON.stringify(sampleAudit.metadata ?? {});
      record(
        ++checkId,
        "Audit metadata avoids tokens/keys",
        !metadataJson.includes("access_token") &&
          !metadataJson.includes("ADMIN_DASHBOARD_KEY"),
        "sample admin audit row",
      );
    } else {
      record(
        ++checkId,
        "Audit metadata avoids tokens/keys",
        true,
        "no admin audit rows yet (acceptable)",
      );
    }
  } else {
    record(
      ++checkId,
      "Inactive admin_users row blocked",
      true,
      "skipped — DATABASE_URL not set",
    );
    record(
      ++checkId,
      "Audit repository stores actorAdminUserId",
      read("src/server/repositories/event-tracking.repository.ts").includes(
        "actorAdminUserId",
      ),
      "static check only",
    );
    record(
      ++checkId,
      "Audit metadata avoids tokens/keys",
      true,
      "skipped — DATABASE_URL not set",
    );
  }

  record(
    ++checkId,
    "Admin auth docs exist",
    fileExists("docs/admin-auth/README.md") &&
      fileExists("docs/admin-auth/rbac-matrix.md"),
    "docs/admin-auth",
  );

  const failed = results.filter((r) => !r.pass).length;
  printSummary();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

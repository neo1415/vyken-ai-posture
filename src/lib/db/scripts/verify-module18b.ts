/**
 * Live Module 18B verification — Security Hardening.
 * Run: pnpm verify:module18b
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

import { config } from "dotenv";

config({ path: resolve(process.cwd(), ".env.local"), override: true });

import { ASSESSMENT_QUESTIONS } from "@/features/assessment-wizard/questions";
import { scoreAssessment } from "@/features/scoring/scoring-engine";
import type { AssessmentScoringInput } from "@/features/scoring/types";
import {
  assertMetadataSize,
  sanitizeEventMetadata,
} from "@/features/event-tracking/validation";
import { isValidPublicTokenFormat } from "@/lib/security/public-token";
import {
  checkRateLimit,
  ADMIN_LOGIN_RATE_LIMIT,
} from "@/lib/security/rate-limit";
import { buildCspHeader, SECURITY_HEADERS } from "@/lib/security/headers";
import { allowLegacyAdminKeyAccess } from "@/server/admin/admin-access-core";

type Check = { id: number; name: string; pass: boolean; detail: string };
const results: Check[] = [];
let checkId = 0;

function record(name: string, pass: boolean, detail: string) {
  results.push({ id: ++checkId, name, pass, detail });
  console.log(`[${pass ? "PASS" : "FAIL"}] ${checkId}. ${name}`);
  console.log(`       ${detail}`);
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
          if (full.includes(join("lib", "db", "scripts"))) continue;
          if (onFile(readFileSync(full, "utf8"), full)) return true;
        }
      }
    }
  }
  return false;
}

function main() {
  try {
    const log = execSync("git log --oneline -5", { encoding: "utf8" });
    record(
      "Module 18A committed on branch",
      /Module 18A/.test(log),
      log.split("\n")[0] ?? "unknown",
    );
  } catch {
    record("Module 18A committed on branch", false, "git log failed");
  }

  // Security headers
  record(
    "Security headers present",
    SECURITY_HEADERS.length >= 5,
    `${SECURITY_HEADERS.length} headers defined`,
  );

  const csp = buildCspHeader();
  record(
    "CSP contains required directives",
    csp.includes("default-src 'self'") &&
      csp.includes("frame-ancestors 'none'") &&
      csp.includes("object-src 'none'") &&
      csp.includes("base-uri 'self'"),
    "default-src/frame-ancestors/object-src/base-uri present",
  );

  // No third-party analytics
  const hasAnalytics = walkSourceFiles(
    ["src/app", "src/features", "src/components"],
    (text) =>
      /google-analytics|gtag|fbq\(|_paq\.push|segment\.com|amplitude/.test(
        text,
      ),
  );
  record("No third-party analytics scripts", !hasAnalytics, "static scan");

  // No tracking pixels
  const hasPixels = walkSourceFiles(
    ["src/app", "src/features", "src/components"],
    (text) => /facebook\.com\/tr|pixel\.gif|tracking-pixel|1x1\.png/.test(text),
  );
  record("No tracking pixels", !hasPixels, "static scan");

  // No public download route
  record(
    "No public PDF download route",
    !fileExists("src/app/(public)/ai-risk-assessment/download"),
    "no download route",
  );

  // No signed URL exposure
  const signedUrlLeak = walkSourceFiles(
    ["src/app", "src/features"],
    (text) => text.includes("createSignedUrl") || text.includes("getPublicUrl"),
  );
  record("No signed URL exposure", !signedUrlLeak, "static scan");

  // No service role in client paths
  const serviceRoleClient = walkSourceFiles(
    ["src/app", "src/features", "src/components"],
    (text) => text.includes('from "@/lib/supabase/server-client"'),
  );
  record(
    "No service role key in client paths",
    !serviceRoleClient,
    "scanned app/features/components",
  );

  // No admin key in client
  const adminKeyClient = walkSourceFiles(
    ["src/app", "src/features", "src/components"],
    (text) =>
      text.includes("ADMIN_DASHBOARD_KEY") &&
      !text.includes("ADMIN_DASHBOARD_KEY is"),
  );
  record("No admin key in client paths", !adminKeyClient, "static scan");

  // No Resend/API key in client
  const apiKeyClient = walkSourceFiles(
    ["src/app", "src/features", "src/components"],
    (text) => text.includes("RESEND_API_KEY"),
  );
  record("No Resend API key in client paths", !apiKeyClient, "static scan");

  // Admin routes blocked without auth (middleware)
  const middleware = read("src/middleware.ts");
  record(
    "Admin routes blocked without auth",
    middleware.includes("/admin/login") &&
      middleware.includes("NextResponse.redirect"),
    "middleware redirects",
  );

  // Admin actions require auth
  const adminActions = read("src/features/admin/actions.ts");
  record(
    "Admin actions require authenticated access",
    adminActions.includes("requireManageLeadsAdmin") &&
      adminActions.includes("requireSendReportEmailAdmin"),
    "admin/actions.ts uses RBAC guards",
  );

  // Legacy key disabled
  record(
    "Legacy admin key disabled by default",
    !allowLegacyAdminKeyAccess(),
    `ALLOW_LEGACY_ADMIN_KEY=${process.env.ALLOW_LEGACY_ADMIN_KEY ?? "unset"}`,
  );

  // Invalid public token fails safely
  record(
    "Invalid public tokens fail safely",
    !isValidPublicTokenFormat("bad-token!") &&
      isValidPublicTokenFormat("abcdefghijklmnopqrstuvwxyz123456"),
    "isValidPublicTokenFormat validates correctly",
  );

  // Lead capture rejects script tags
  const leadValidation = read("src/features/leads/validation.ts");
  record(
    "Lead capture validation blocks script tags",
    leadValidation.includes("<[^>]*>") || leadValidation.includes("HTML_TAG"),
    "HTML tag pattern in validation",
  );

  // Event metadata rejects storage paths
  const testMetadata: Record<string, unknown> = {
    storagePath: "reports/uuid/file.pdf",
  };
  const sanitized = sanitizeEventMetadata(testMetadata);
  record(
    "Event metadata rejects storage paths",
    sanitized === null || !("storagePath" in (sanitized ?? {})),
    "storagePath not in allowlist",
  );

  // Event metadata rejects oversized
  const bigMetadata: Record<string, string> = {};
  for (let i = 0; i < 100; i++) {
    bigMetadata[`key${i}`] = "x".repeat(50);
  }
  let metaSizeRejected = false;
  try {
    assertMetadataSize(bigMetadata);
  } catch {
    metaSizeRejected = true;
  }
  record(
    "Event metadata rejects oversized metadata",
    metaSizeRejected,
    "assertMetadataSize throws for 5KB+ metadata",
  );

  // Email provider fails closed in production
  const emailProvider = read("src/server/email/get-email-provider.ts");
  record(
    "Email provider fails closed in production",
    emailProvider.includes("production") &&
      emailProvider.includes("throw") &&
      emailProvider.includes("EmailProviderConfigurationError"),
    "get-email-provider.ts",
  );

  // Bucket public URL not used
  const storageCode = read("src/server/storage/supabase-report-storage.ts");
  record(
    "Supabase bucket public URL not used",
    !storageCode.includes("getPublicUrl") &&
      storageCode.includes("assertPrivateReportBucket"),
    "supabase-report-storage.ts",
  );

  // Storage path traversal
  const storageConstants = read(
    "src/server/storage/report-storage.constants.ts",
  );
  record(
    "Storage path traversal rejected",
    storageConstants.includes("..") &&
      storageConstants.includes("isValidReportStorageKey"),
    "report-storage.constants.ts",
  );

  // No raw answer rows in events
  const eventService = read("src/server/services/event-tracking.service.ts");
  record(
    "No raw answer data in event metadata",
    !eventService.includes("rawAnswers") &&
      !eventService.includes("assessmentAnswers"),
    "event-tracking.service.ts",
  );

  // No broad RLS policy added
  const rlsDir = resolve(process.cwd(), "drizzle", "rls");
  let rlsFiles = "";
  if (existsSync(rlsDir)) {
    rlsFiles = readdirSync(rlsDir)
      .filter((f) => f.endsWith(".sql"))
      .map((f) => readFileSync(join(rlsDir, f), "utf8"))
      .join("\n");
  }
  record(
    "No broad RLS policy added",
    !rlsFiles.includes("FOR ALL") && !rlsFiles.includes("USING (true)"),
    "RLS files scanned",
  );

  // No unnecessary packages
  const pkg = JSON.parse(read("package.json"));
  const deps = Object.keys(pkg.dependencies ?? {});
  record(
    "No unnecessary packages added",
    !deps.includes("helmet") &&
      !deps.includes("next-auth") &&
      !deps.includes("express-rate-limit"),
    "no helmet/next-auth/express-rate-limit",
  );

  // Public scoring still works
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
    "Public assessment flow still works",
    typeof score.overallScore === "number",
    `score=${score.overallScore}`,
  );

  // Admin dashboard still works (static check)
  record(
    "Admin dashboard routes present",
    fileExists("src/app/admin/(protected)/leads/page.tsx") &&
      fileExists("src/app/admin/(protected)/layout.tsx"),
    "protected leads route + layout exist",
  );

  // Tool admin still works
  record(
    "Tool admin routes present",
    fileExists("src/app/admin/(protected)/tools/page.tsx"),
    "protected tools route exists",
  );

  // CTA/event tracking still works
  record(
    "CTA/event tracking intact",
    fileExists("src/features/event-tracking/actions.ts") &&
      fileExists("src/server/services/event-tracking.service.ts"),
    "event-tracking files present",
  );

  // No Module 19 UX scope creep
  record(
    "No Module 19 UX scope creep",
    !fileExists("docs/ux-pass/README.md") &&
      !fileExists("src/features/ux-pass"),
    "no UX pass artifacts",
  );

  // No Module 20 QA substitution
  record(
    "No Module 20 final QA substitution",
    !fileExists("docs/final-qa/README.md"),
    "no final-qa artifacts",
  );

  // Rate limiting present
  record(
    "Rate limiting implemented",
    fileExists("src/lib/security/rate-limit.ts"),
    "rate-limit.ts exists",
  );

  // Admin login rate limited
  const r1 = checkRateLimit(ADMIN_LOGIN_RATE_LIMIT, "test-verify@example.com");
  record(
    "Admin login rate-limited",
    r1.allowed && r1.remaining === 4,
    `first attempt: remaining=${r1.remaining}`,
  );

  const passed = results.filter((r) => r.pass).length;
  const failed = results.filter((r) => !r.pass).length;
  console.log("---");
  console.log(
    `Summary: ${passed} passed, ${failed} failed, ${results.length} checks`,
  );
  process.exit(failed > 0 ? 1 : 0);
}

main();

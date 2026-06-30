import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { config } from "dotenv";
import postgres from "postgres";

const RLS_FILE = resolve(process.cwd(), "drizzle/rls/001_enable_rls.sql");

config({ path: resolve(process.cwd(), ".env.local"), override: true });
config({ override: true });

async function applyRls() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local before running pnpm db:rls.",
    );
  }

  const sqlFile = readFileSync(RLS_FILE, "utf8");
  const statements = sqlFile
    .split(";")
    .map((statement) => statement.trim())
    .filter(
      (statement) =>
        statement.length > 0 &&
        !statement.split("\n").every((line) => line.trim().startsWith("--")),
    );

  const db = postgres(databaseUrl, { max: 1, prepare: false });

  try {
    for (const statement of statements) {
      await db.unsafe(statement);
    }
    console.log(`Applied RLS baseline from ${RLS_FILE}`);
  } finally {
    await db.end();
  }
}

applyRls().catch((error: unknown) => {
  console.error("RLS apply failed:", error);
  process.exitCode = 1;
});

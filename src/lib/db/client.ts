import "server-only";

import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

type Database = PostgresJsDatabase<typeof schema>;

let queryClient: ReturnType<typeof postgres> | null = null;
let database: Database | null = null;

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not configured. Set it in .env.local for database operations.",
    );
  }
  return url;
}

/**
 * Returns a singleton Drizzle client. Connects lazily on first use.
 * Server-only — never import from Client Components.
 */
export function getDb(): Database {
  if (!database) {
    queryClient = postgres(getDatabaseUrl(), {
      max: 1,
      prepare: false,
    });
    database = drizzle(queryClient, { schema });
  }
  return database;
}

/**
 * Closes the database connection pool. Intended for scripts and tests.
 */
export async function closeDb(): Promise<void> {
  if (queryClient) {
    await queryClient.end();
    queryClient = null;
    database = null;
  }
}

export type { Database };

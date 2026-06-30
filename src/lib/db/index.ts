/**
 * Server-only database module.
 * Import `getDb` from here in repositories and services — never from UI components.
 */
export { closeDb, getDb, type Database } from "./client";
export * as schema from "./schema";

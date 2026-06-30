/**
 * Database access boundary for the Vyken AI Risk Assessment Hub.
 *
 * Rules:
 * - UI components and Client Components must NOT import getDb() or schema tables.
 * - Route handlers and Server Actions call services; services call repositories.
 * - Repositories use the server-only client from @/lib/db.
 * - Scoring, signals, recommendations, and reports persist through server services only.
 * - Never trust client-submitted scores or signals as authoritative.
 * - DATABASE_URL and SUPABASE_SERVICE_ROLE_KEY stay server-only.
 *
 * Repository implementations are added in feature modules (assessment, leads, admin, tools).
 */

export const DATABASE_BOUNDARY_VERSION = "1.0.0" as const;

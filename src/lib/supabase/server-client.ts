import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { serverEnv } from "@/lib/config/env.server";
import { createSupabaseServiceClient } from "@/lib/supabase/create-service-client";

let cachedClient: SupabaseClient | null = null;

export function getSupabaseServiceClient(): SupabaseClient {
  const url = serverEnv.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = serverEnv.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase storage is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  if (!cachedClient) {
    cachedClient = createSupabaseServiceClient({
      supabaseUrl: url,
      serviceRoleKey,
    });
  }

  return cachedClient;
}

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function createSupabaseServiceClient(input: {
  supabaseUrl: string;
  serviceRoleKey: string;
}): SupabaseClient {
  return createClient(input.supabaseUrl, input.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

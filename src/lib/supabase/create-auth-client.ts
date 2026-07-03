import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function createSupabaseAuthClient(input: {
  supabaseUrl: string;
  anonKey: string;
}): SupabaseClient {
  return createClient(input.supabaseUrl, input.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

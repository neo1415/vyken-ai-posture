import "server-only";

import type { Session, User } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { serverEnv } from "@/lib/config/env.server";
import {
  SUPABASE_ACCESS_TOKEN_COOKIE,
  SUPABASE_ACCESS_TOKEN_MAX_AGE,
  SUPABASE_AUTH_COOKIE_OPTIONS,
  SUPABASE_REFRESH_TOKEN_COOKIE,
  SUPABASE_REFRESH_TOKEN_MAX_AGE,
} from "@/lib/supabase/auth-cookies";
import { createSupabaseAuthClient } from "@/lib/supabase/create-auth-client";

export class SupabaseAuthConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SupabaseAuthConfigError";
  }
}

function getAuthConfig() {
  const supabaseUrl = serverEnv.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = serverEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new SupabaseAuthConfigError(
      "Supabase Auth is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return { supabaseUrl, anonKey };
}

function createConfiguredAuthClient() {
  const { supabaseUrl, anonKey } = getAuthConfig();
  return createSupabaseAuthClient({ supabaseUrl, anonKey });
}

export async function setSupabaseAuthCookies(session: Session): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SUPABASE_ACCESS_TOKEN_COOKIE, session.access_token, {
    ...SUPABASE_AUTH_COOKIE_OPTIONS,
    maxAge: SUPABASE_ACCESS_TOKEN_MAX_AGE,
  });
  cookieStore.set(SUPABASE_REFRESH_TOKEN_COOKIE, session.refresh_token, {
    ...SUPABASE_AUTH_COOKIE_OPTIONS,
    maxAge: SUPABASE_REFRESH_TOKEN_MAX_AGE,
  });
}

export async function clearSupabaseAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SUPABASE_ACCESS_TOKEN_COOKIE, "", {
    ...SUPABASE_AUTH_COOKIE_OPTIONS,
    maxAge: 0,
  });
  cookieStore.set(SUPABASE_REFRESH_TOKEN_COOKIE, "", {
    ...SUPABASE_AUTH_COOKIE_OPTIONS,
    maxAge: 0,
  });
}

export async function getSupabaseAuthUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const accessToken =
      cookieStore.get(SUPABASE_ACCESS_TOKEN_COOKIE)?.value ?? null;
    const refreshToken =
      cookieStore.get(SUPABASE_REFRESH_TOKEN_COOKIE)?.value ?? null;

    if (!accessToken && !refreshToken) {
      return null;
    }

    const supabase = createConfiguredAuthClient();

    if (accessToken) {
      const { data, error } = await supabase.auth.getUser(accessToken);
      if (!error && data.user) {
        return data.user;
      }
    }

    if (refreshToken) {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });
      if (!error && data.session && data.user) {
        await setSupabaseAuthCookies(data.session);
        return data.user;
      }
    }

    await clearSupabaseAuthCookies();
    return null;
  } catch {
    return null;
  }
}

export async function signInWithPassword(input: {
  email: string;
  password: string;
}): Promise<{ user: User | null; errorMessage: string | null }> {
  const supabase = createConfiguredAuthClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error || !data.session || !data.user) {
    return {
      user: null,
      errorMessage: "Invalid email or password.",
    };
  }

  await setSupabaseAuthCookies(data.session);
  return { user: data.user, errorMessage: null };
}

export async function signOutSupabaseAuth(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const accessToken =
      cookieStore.get(SUPABASE_ACCESS_TOKEN_COOKIE)?.value ?? null;
    if (accessToken) {
      const supabase = createConfiguredAuthClient();
      await supabase.auth.signOut();
    }
  } catch {
    // Best-effort remote sign-out.
  } finally {
    await clearSupabaseAuthCookies();
  }
}

export function isSupabaseAuthConfigured(): boolean {
  return Boolean(
    serverEnv.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
    serverEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
  );
}

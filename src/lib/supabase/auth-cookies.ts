export const SUPABASE_ACCESS_TOKEN_COOKIE = "sb-access-token";
export const SUPABASE_REFRESH_TOKEN_COOKIE = "sb-refresh-token";

export const SUPABASE_AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
};

export const SUPABASE_ACCESS_TOKEN_MAX_AGE = 60 * 60;
export const SUPABASE_REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7;

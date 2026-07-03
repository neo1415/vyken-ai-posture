import { NextResponse, type NextRequest } from "next/server";

import {
  SUPABASE_ACCESS_TOKEN_COOKIE,
  SUPABASE_REFRESH_TOKEN_COOKIE,
} from "@/lib/supabase/auth-cookies";

const PUBLIC_ADMIN_PATHS = ["/admin/login"];

function isProtectedAdminPath(pathname: string): boolean {
  if (!pathname.startsWith("/admin")) {
    return false;
  }
  return !PUBLIC_ADMIN_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

function hasAuthCookies(request: NextRequest): boolean {
  return Boolean(
    request.cookies.get(SUPABASE_ACCESS_TOKEN_COOKIE)?.value ||
    request.cookies.get(SUPABASE_REFRESH_TOKEN_COOKIE)?.value,
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isProtectedAdminPath(pathname) && !hasAuthCookies(request)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.search = "";
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();

  response.headers.set("x-pathname", pathname);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  );

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/((?!_next/static|_next/image|favicon.ico).*)"],
};

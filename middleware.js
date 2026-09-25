import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE } from "./lib/auth";

// Routes that require a valid admin session. "/admin" itself is the
// login screen and stays open; everything nested under it is
// publishing UI and must be protected. API mutation routes are
// protected here too, as a second layer behind the per-route checks
// in the route handlers themselves.
const PROTECTED_PAGE_PREFIXES = ["/admin/dashboard", "/admin/articles", "/admin/theta"];
const PROTECTED_API_PREFIXES = ["/api/articles", "/api/theta"];

async function hasValidSession(request) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  const secret = process.env.SESSION_SECRET;
  if (!secret) return false;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function middleware(request) {
  const { pathname, search } = request.nextUrl;

  const isProtectedPage = PROTECTED_PAGE_PREFIXES.some((p) =>
    pathname.startsWith(p)
  );
  const isProtectedApiWrite =
    PROTECTED_API_PREFIXES.some((p) => pathname.startsWith(p)) &&
    request.method !== "GET";
  // Admin list/read endpoints (drafts included) should also require a
  // session, since they can reveal unpublished content.
  const isProtectedApiRead =
    PROTECTED_API_PREFIXES.some((p) => pathname.startsWith(p)) &&
    request.method === "GET";

  if (isProtectedPage) {
    const valid = await hasValidSession(request);
    if (!valid) {
      const loginUrl = new URL("/admin", request.url);
      loginUrl.searchParams.set("next", pathname + search);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isProtectedApiWrite || isProtectedApiRead) {
    const valid = await hasValidSession(request);
    if (!valid) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/articles/:path*", "/api/theta/:path*"],
};

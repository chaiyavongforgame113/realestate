import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { ACCESS_COOKIE } from "@/lib/auth/cookies";

const AGENT_PREFIX = "/agent";
const ADMIN_PREFIX = "/admin";
const ACCOUNT_PREFIXES = ["/favorites", "/enquiries", "/profile", "/settings", "/notifications", "/saved-searches"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(ACCESS_COOKIE)?.value;
  const payload = token ? await verifyAccessToken(token) : null;

  const needsAgent = pathname.startsWith(AGENT_PREFIX);
  const needsAdmin = pathname.startsWith(ADMIN_PREFIX);
  const needsAccount = ACCOUNT_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (needsAdmin) {
    if (!payload) return redirectToLogin(req, "admin");
    if (payload.role !== "admin") return new NextResponse("Forbidden", { status: 403 });
  }

  if (needsAgent) {
    if (!payload) return redirectToLogin(req, "agent");
    if (payload.role !== "agent" && payload.role !== "admin") {
      return NextResponse.redirect(new URL("/become-agent", req.url));
    }
  }

  if (needsAccount && !payload) {
    return redirectToLogin(req, "account");
  }

  return NextResponse.next();
}

function redirectToLogin(req: NextRequest, reason: string) {
  const url = new URL("/login", req.url);
  url.searchParams.set("reason", reason);
  url.searchParams.set("redirect", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/agent/:path*",
    "/admin/:path*",
    "/favorites/:path*",
    "/enquiries/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/notifications/:path*",
    "/saved-searches/:path*",
  ],
};

import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { buildAuthorizeUrl, isGoogleConfigured } from "@/lib/auth/google";

const STATE_COOKIE = "google_oauth_state";

/** GET /api/auth/google — start OAuth flow */
export async function GET(req: NextRequest) {
  if (!isGoogleConfigured()) {
    const url = new URL("/login", req.url);
    url.searchParams.set("error", "google_not_configured");
    return NextResponse.redirect(url);
  }

  const redirect = req.nextUrl.searchParams.get("redirect") ?? "/";
  const state = randomBytes(16).toString("hex");

  const authorizeUrl = buildAuthorizeUrl(state, redirect);
  const res = NextResponse.redirect(authorizeUrl);
  res.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  return res;
}

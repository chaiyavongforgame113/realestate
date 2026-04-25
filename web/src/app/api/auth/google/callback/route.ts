import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { exchangeCode, fetchUserInfo, isGoogleConfigured } from "@/lib/auth/google";
import { signAccessToken, signRefreshToken, TOKEN_TTL } from "@/lib/auth/jwt";
import { setAuthCookies } from "@/lib/auth/cookies";

const STATE_COOKIE = "google_oauth_state";

function loginErrorRedirect(req: NextRequest, code: string) {
  const url = new URL("/login", req.url);
  url.searchParams.set("error", code);
  return NextResponse.redirect(url);
}

/** GET /api/auth/google/callback — handle OAuth code, sign user in */
export async function GET(req: NextRequest) {
  if (!isGoogleConfigured()) return loginErrorRedirect(req, "google_not_configured");

  const code = req.nextUrl.searchParams.get("code");
  const stateParam = req.nextUrl.searchParams.get("state");
  const errorParam = req.nextUrl.searchParams.get("error");
  if (errorParam) return loginErrorRedirect(req, "google_denied");
  if (!code || !stateParam) return loginErrorRedirect(req, "google_invalid");

  // Verify state
  const stateCookie = req.cookies.get(STATE_COOKIE)?.value;
  const [stateValue, encodedRedirect] = stateParam.split("::");
  const redirect = encodedRedirect ? decodeURIComponent(encodedRedirect) : "/";
  if (!stateCookie || stateValue !== stateCookie) return loginErrorRedirect(req, "google_state_mismatch");

  // Exchange code → tokens → userinfo
  let google;
  try {
    const tokens = await exchangeCode(code);
    google = await fetchUserInfo(tokens.access_token);
  } catch {
    return loginErrorRedirect(req, "google_exchange_failed");
  }

  if (!google.email_verified) return loginErrorRedirect(req, "google_email_unverified");

  // Find or create user. Match precedence: googleId → email.
  let user = await prisma.user.findUnique({ where: { googleId: google.sub } });
  if (!user) {
    const byEmail = await prisma.user.findUnique({ where: { email: google.email } });
    if (byEmail) {
      // Existing email account → link Google
      user = await prisma.user.update({
        where: { id: byEmail.id },
        data: { googleId: google.sub, emailVerifiedAt: byEmail.emailVerifiedAt ?? new Date() },
      });
    } else {
      // Brand new — create
      user = await prisma.user.create({
        data: {
          email: google.email,
          googleId: google.sub,
          passwordHash: null,
          emailVerifiedAt: new Date(),
          profile: {
            create: {
              firstName: google.given_name ?? null,
              lastName: google.family_name ?? null,
              avatarUrl: google.picture ?? null,
            },
          },
        },
      });
    }
  }

  if (user.status === "suspended") return loginErrorRedirect(req, "account_suspended");

  // Issue session JWTs (same as /api/auth/login)
  const jti = randomUUID();
  const access = await signAccessToken({ sub: user.id, role: user.role, email: user.email });
  const refresh = await signRefreshToken({ sub: user.id, jti });
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: await bcrypt.hash(jti, 8),
      expiresAt: new Date(Date.now() + TOKEN_TTL.refresh * 1000),
    },
  });
  await setAuthCookies(access, refresh);

  // Clear state cookie
  const res = NextResponse.redirect(new URL(redirect, req.url));
  res.cookies.delete(STATE_COOKIE);
  return res;
}

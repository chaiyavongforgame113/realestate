import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signAccessToken, signRefreshToken, verifyRefreshToken, TOKEN_TTL } from "@/lib/auth/jwt";
import { REFRESH_COOKIE, setAuthCookies, clearAuthCookies } from "@/lib/auth/cookies";
import { ok, err, handle } from "@/lib/api/respond";

export async function POST() {
  try {
    const store = await cookies();
    const refresh = store.get(REFRESH_COOKIE)?.value;
    if (!refresh) return err("No refresh token", 401);

    const payload = await verifyRefreshToken(refresh);
    if (!payload) {
      await clearAuthCookies();
      return err("Invalid refresh token", 401);
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || user.status === "suspended") {
      await clearAuthCookies();
      return err("User unavailable", 401);
    }

    // Rotate: revoke old jti, issue new
    const tokens = await prisma.refreshToken.findMany({
      where: { userId: user.id, revokedAt: null, expiresAt: { gt: new Date() } },
    });
    let matchedToken = null;
    for (const t of tokens) {
      if (await bcrypt.compare(payload.jti, t.tokenHash)) {
        matchedToken = t;
        break;
      }
    }
    if (!matchedToken) {
      await clearAuthCookies();
      return err("Refresh token revoked", 401);
    }

    await prisma.refreshToken.update({
      where: { id: matchedToken.id },
      data: { revokedAt: new Date() },
    });

    const newJti = randomUUID();
    const access = await signAccessToken({ sub: user.id, role: user.role, email: user.email });
    const newRefresh = await signRefreshToken({ sub: user.id, jti: newJti });

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: await bcrypt.hash(newJti, 8),
        expiresAt: new Date(Date.now() + TOKEN_TTL.refresh * 1000),
      },
    });

    await setAuthCookies(access, newRefresh);
    return ok({ ok: true });
  } catch (e) {
    return handle(e);
  }
}

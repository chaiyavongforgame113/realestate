import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyRefreshToken } from "@/lib/auth/jwt";
import { REFRESH_COOKIE, clearAuthCookies } from "@/lib/auth/cookies";
import { ok, handle } from "@/lib/api/respond";

export async function POST() {
  try {
    const store = await cookies();
    const refresh = store.get(REFRESH_COOKIE)?.value;

    if (refresh) {
      const payload = await verifyRefreshToken(refresh);
      if (payload) {
        // Revoke matching refresh token(s) for this user
        await prisma.refreshToken.updateMany({
          where: { userId: payload.sub, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      }
    }

    await clearAuthCookies();
    return ok({ ok: true });
  } catch (e) {
    return handle(e);
  }
}

import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validation/auth";
import { hashPassword } from "@/lib/auth/password";
import { signAccessToken, signRefreshToken, TOKEN_TTL } from "@/lib/auth/jwt";
import { setAuthCookies } from "@/lib/auth/cookies";
import { ok, err, handle } from "@/lib/api/respond";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) return err("อีเมลนี้ถูกใช้งานแล้ว", 409);

    const passwordHash = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        profile: {
          create: {
            firstName: data.firstName,
            lastName: data.lastName,
          },
        },
      },
    });

    // Issue tokens
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

    return ok({
      user: { id: user.id, email: user.email, role: user.role, status: user.status },
    });
  } catch (e) {
    return handle(e);
  }
}

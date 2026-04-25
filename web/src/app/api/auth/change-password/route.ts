import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { ok, err, handle } from "@/lib/api/respond";

const Schema = z.object({
  currentPassword: z.string().min(1, "กรอกรหัสผ่านปัจจุบัน"),
  newPassword: z.string().min(8, "รหัสผ่านใหม่ต้องอย่างน้อย 8 ตัว").max(72),
});

/** POST /api/auth/change-password */
export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const body = await req.json();
    const { currentPassword, newPassword } = Schema.parse(body);

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) return err("ไม่พบบัญชี", 404);
    if (!user.passwordHash) {
      return err("บัญชีนี้ใช้ Google — ตั้งรหัสผ่านครั้งแรกผ่านปุ่ม 'ลืมรหัสผ่าน'", 400);
    }

    const match = await verifyPassword(currentPassword, user.passwordHash);
    if (!match) return err("รหัสผ่านปัจจุบันไม่ถูกต้อง", 400);

    if (await verifyPassword(newPassword, user.passwordHash)) {
      return err("รหัสผ่านใหม่ต้องไม่ซ้ำกับเดิม", 400);
    }

    const newHash = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: session.userId }, data: { passwordHash: newHash } });

    // Invalidate all refresh tokens for security
    await prisma.refreshToken.deleteMany({ where: { userId: session.userId } });

    return ok({ ok: true });
  } catch (e) {
    return handle(e);
  }
}

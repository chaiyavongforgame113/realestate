import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { ok, err, handle } from "@/lib/api/respond";
import { z } from "zod";

const schema = z.object({ status: z.enum(["active", "suspended"]) });

/** POST /api/admin/users/[id]/status — suspend / activate */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole(["admin"]);
    const { id } = await params;
    const body = await req.json();
    const { status } = schema.parse(body);

    if (id === session.userId) return err("ห้ามแก้สถานะบัญชีของตัวเอง", 400);

    await prisma.user.update({ where: { id }, data: { status } });

    await prisma.adminAction.create({
      data: {
        adminId: session.userId,
        actionType: `user.${status === "suspended" ? "suspend" : "activate"}`,
        targetType: "user",
        targetId: id,
      },
    });

    return ok({ ok: true });
  } catch (e) {
    return handle(e);
  }
}

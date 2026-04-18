import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { ok, err, handle } from "@/lib/api/respond";

/** POST /api/notifications/[id]/read */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return err("Unauthorized", 401);
    const { id } = await params;

    const notif = await prisma.notification.findUnique({ where: { id } });
    if (!notif || notif.userId !== session.userId) return err("Not found", 404);

    await prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });

    return ok({ ok: true });
  } catch (e) {
    return handle(e);
  }
}

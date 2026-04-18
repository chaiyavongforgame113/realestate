import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { ok, err, handle } from "@/lib/api/respond";

/** GET /api/notifications?unread=1 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return err("Unauthorized", 401);

    const unreadOnly = req.nextUrl.searchParams.get("unread") === "1";

    const [items, unread] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: session.userId, ...(unreadOnly && { readAt: null }) },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.notification.count({
        where: { userId: session.userId, readAt: null },
      }),
    ]);

    return ok({ items, unread });
  } catch (e) {
    return handle(e);
  }
}

/** POST /api/notifications/mark-all-read */
export async function POST() {
  try {
    const session = await getSession();
    if (!session) return err("Unauthorized", 401);

    await prisma.notification.updateMany({
      where: { userId: session.userId, readAt: null },
      data: { readAt: new Date() },
    });

    return ok({ ok: true });
  } catch (e) {
    return handle(e);
  }
}

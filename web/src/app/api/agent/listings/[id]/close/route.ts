import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { ok, err, handle } from "@/lib/api/respond";
import { z } from "zod";

const schema = z.object({
  status: z.enum(["unavailable", "sold", "rented"]),
});

/** POST /api/agent/listings/[id]/close — mark as sold/rented/unavailable */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole(["agent", "admin"]);
    const { id } = await params;
    const body = await req.json();
    const { status } = schema.parse(body);

    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) return err("Not found", 404);
    if (session.role !== "admin" && listing.agentId !== session.userId) return err("Forbidden", 403);

    if (listing.status !== "published") {
      return err("ประกาศนี้ยังไม่ได้เผยแพร่", 400);
    }

    await prisma.listing.update({ where: { id }, data: { status } });
    return ok({ ok: true });
  } catch (e) {
    return handle(e);
  }
}

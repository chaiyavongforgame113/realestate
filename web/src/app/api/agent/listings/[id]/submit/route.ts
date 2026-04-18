import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { ok, err, handle } from "@/lib/api/respond";

/** POST /api/agent/listings/[id]/submit — submit draft for review */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole(["agent", "admin"]);
    const { id } = await params;
    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) return err("Not found", 404);
    if (session.role !== "admin" && listing.agentId !== session.userId) return err("Forbidden", 403);

    if (!["draft", "revision_requested"].includes(listing.status)) {
      return err(`ไม่สามารถส่งประกาศที่สถานะ ${listing.status} รอพิจารณาได้`, 400);
    }

    await prisma.listing.update({
      where: { id },
      data: { status: "pending_review" },
    });

    return ok({ ok: true });
  } catch (e) {
    return handle(e);
  }
}

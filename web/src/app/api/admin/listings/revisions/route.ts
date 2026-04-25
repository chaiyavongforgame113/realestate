import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { toListingDTO } from "@/lib/listings/transform";
import { ok, handle } from "@/lib/api/respond";

/** GET /api/admin/listings/revisions — pending listing revisions (edits from published listings) */
export async function GET() {
  try {
    await requireRole(["admin"]);

    const revisions = await prisma.listingRevision.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "asc" },
      include: {
        listing: {
          include: {
            agent: { include: { profile: true, agentProfile: true } },
            images: { take: 3, orderBy: { order: "asc" } },
          },
        },
        agent: { include: { profile: true, agentProfile: true } },
      },
    });

    return ok({
      revisions: revisions.map((r) => {
        let parsed: Record<string, unknown> = {};
        try {
          parsed = JSON.parse(r.data);
        } catch {
          parsed = {};
        }
        return {
          id: r.id,
          listingId: r.listingId,
          agentId: r.agentId,
          status: r.status,
          createdAt: r.createdAt,
          // Current published snapshot
          current: toListingDTO(r.listing),
          // Proposed edit payload
          proposed: parsed,
        };
      }),
    });
  } catch (e) {
    return handle(e);
  }
}

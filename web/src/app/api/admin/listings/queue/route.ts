import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { toListingDTO } from "@/lib/listings/transform";
import { ok, handle } from "@/lib/api/respond";

/** GET /api/admin/listings/queue — listings pending review */
export async function GET(req: NextRequest) {
  try {
    await requireRole(["admin"]);

    const status = req.nextUrl.searchParams.get("status") ?? "pending_review";

    const listings = await prisma.listing.findMany({
      where: { status: status as "pending_review" | "published" | "rejected" | "revision_requested" },
      orderBy: { createdAt: "asc" },
      include: {
        agent: { include: { profile: true, agentProfile: true } },
        images: { take: 3, orderBy: { order: "asc" } },
      },
    });

    return ok({ listings: listings.map(toListingDTO) });
  } catch (e) {
    return handle(e);
  }
}

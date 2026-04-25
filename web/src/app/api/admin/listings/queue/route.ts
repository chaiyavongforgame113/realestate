import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { toListingDTO } from "@/lib/listings/transform";
import { ok, err, handle } from "@/lib/api/respond";

const ALLOWED_STATUSES = [
  "draft",
  "pending_review",
  "published",
  "rejected",
  "revision_requested",
  "unavailable",
  "sold",
  "rented",
] as const;
type QueueStatus = (typeof ALLOWED_STATUSES)[number];

/** GET /api/admin/listings/queue — listings pending review */
export async function GET(req: NextRequest) {
  try {
    await requireRole(["admin"]);

    const raw = req.nextUrl.searchParams.get("status") ?? "pending_review";
    if (!ALLOWED_STATUSES.includes(raw as QueueStatus)) {
      return err("invalid_status", 400);
    }
    const status = raw as QueueStatus;

    const listings = await prisma.listing.findMany({
      where: { status },
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

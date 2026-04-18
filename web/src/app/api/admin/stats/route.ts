import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { ok, handle } from "@/lib/api/respond";

/** GET /api/admin/stats — dashboard summary */
export async function GET() {
  try {
    await requireRole(["admin"]);

    const [
      totalUsers,
      activeAgents,
      publishedListings,
      pendingListings,
      pendingApplications,
      enquiriesToday,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "agent", status: "active" } }),
      prisma.listing.count({ where: { status: "published" } }),
      prisma.listing.count({ where: { status: "pending_review" } }),
      prisma.agentApplication.count({ where: { status: "pending_review" } }),
      prisma.enquiry.count({
        where: {
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
    ]);

    return ok({
      totalUsers,
      activeAgents,
      publishedListings,
      pendingListings,
      pendingApplications,
      enquiriesToday,
    });
  } catch (e) {
    return handle(e);
  }
}

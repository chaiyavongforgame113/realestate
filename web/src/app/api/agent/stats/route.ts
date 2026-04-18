import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { ok, handle } from "@/lib/api/respond";

/** GET /api/agent/stats — summary for current agent */
export async function GET() {
  try {
    const session = await requireRole(["agent", "admin"]);

    const [published, pending, totalEnquiries, newEnquiries] = await Promise.all([
      prisma.listing.count({ where: { agentId: session.userId, status: "published" } }),
      prisma.listing.count({
        where: {
          agentId: session.userId,
          status: { in: ["pending_review", "revision_requested"] },
        },
      }),
      prisma.enquiry.count({ where: { agentId: session.userId } }),
      prisma.enquiry.count({ where: { agentId: session.userId, status: "new" } }),
    ]);

    return ok({ published, pending, totalEnquiries, newEnquiries });
  } catch (e) {
    return handle(e);
  }
}

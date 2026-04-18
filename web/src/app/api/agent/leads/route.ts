import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { ok, handle } from "@/lib/api/respond";

/** GET /api/agent/leads — list leads for current agent */
export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(["agent", "admin"]);
    const status = req.nextUrl.searchParams.get("status") as
      | "new"
      | "contacted"
      | "viewing_scheduled"
      | "negotiating"
      | "won"
      | "lost"
      | "spam"
      | null;

    const leads = await prisma.enquiry.findMany({
      where: { agentId: session.userId, ...(status && { status }) },
      orderBy: { createdAt: "desc" },
      include: {
        listing: { select: { id: true, title: true, coverImageUrl: true, price: true, priceUnit: true } },
        user: { select: { email: true, profile: { select: { firstName: true, lastName: true } } } },
      },
    });

    return ok({
      leads: leads.map((l) => ({
        id: l.id,
        userName: l.name,
        userPhone: l.phone,
        userEmail: l.email,
        message: l.message,
        status: l.status,
        agentNotes: l.agentNotes,
        createdAt: l.createdAt,
        updatedAt: l.updatedAt,
        listing: l.listing,
      })),
    });
  } catch (e) {
    return handle(e);
  }
}

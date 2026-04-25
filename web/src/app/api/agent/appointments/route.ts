import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { ok, handle } from "@/lib/api/respond";

/** GET /api/agent/appointments — list appointments for current agent */
export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(["agent", "admin"]);
    const status = req.nextUrl.searchParams.get("status") as
      | "requested"
      | "confirmed"
      | "cancelled"
      | "completed"
      | "no_show"
      | null;

    const appointments = await prisma.appointment.findMany({
      where: { agentId: session.userId, ...(status && { status }) },
      orderBy: { scheduledAt: "asc" },
    });

    const listingIds = Array.from(new Set(appointments.map((a) => a.listingId)));
    const userIds = Array.from(new Set(appointments.map((a) => a.userId)));

    const [listings, profiles, users] = await Promise.all([
      prisma.listing.findMany({
        where: { id: { in: listingIds } },
        select: { id: true, title: true, coverImageUrl: true, price: true, priceUnit: true },
      }),
      prisma.userProfile.findMany({
        where: { userId: { in: userIds } },
        select: { userId: true, firstName: true, lastName: true, phone: true },
      }),
      prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, email: true },
      }),
    ]);

    const listingMap = new Map(listings.map((l) => [l.id, l]));
    const profileMap = new Map(profiles.map((p) => [p.userId, p]));
    const userMap = new Map(users.map((u) => [u.id, u]));

    return ok({
      appointments: appointments.map((a) => {
        const profile = profileMap.get(a.userId);
        const u = userMap.get(a.userId);
        return {
          id: a.id,
          listing: listingMap.get(a.listingId) ?? null,
          userName:
            `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim() ||
            u?.email ||
            "ผู้สนใจ",
          userPhone: profile?.phone ?? "",
          userEmail: u?.email ?? "",
          scheduledAt: a.scheduledAt,
          durationMins: a.durationMins,
          type: a.type,
          status: a.status,
          note: a.note,
          cancellationReason: a.cancellationReason,
          meetingUrl: a.meetingUrl,
          createdAt: a.createdAt,
        };
      }),
    });
  } catch (e) {
    return handle(e);
  }
}

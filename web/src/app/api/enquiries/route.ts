import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { enquiryCreateSchema } from "@/lib/validation/enquiry";
import { ok, err, handle } from "@/lib/api/respond";

/** POST /api/enquiries — user submits enquiry (guest allowed) */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json();
    const data = enquiryCreateSchema.parse(body);

    const listing = await prisma.listing.findUnique({ where: { id: data.listingId } });
    if (!listing || listing.status !== "published") return err("Listing unavailable", 404);

    const enquiry = await prisma.enquiry.create({
      data: {
        listingId: listing.id,
        agentId: listing.agentId,
        userId: session?.userId ?? null,
        name: data.name,
        phone: data.phone,
        email: data.email || session?.email || "",
        message: data.message,
      },
    });

    // Notify the agent
    await prisma.notification.create({
      data: {
        userId: listing.agentId,
        type: "lead_new",
        title: "Lead ใหม่",
        message: `${data.name} สนใจ ${listing.title}`,
        link: "/agent/leads",
      },
    });

    return ok({ id: enquiry.id });
  } catch (e) {
    return handle(e);
  }
}

/** GET /api/enquiries — list own enquiries (user) */
export async function GET() {
  try {
    const session = await getSession();
    if (!session) return err("Unauthorized", 401);

    const enquiries = await prisma.enquiry.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      include: {
        listing: {
          include: {
            agent: { include: { profile: true, agentProfile: true } },
          },
        },
      },
    });

    return ok({
      enquiries: enquiries.map((e) => ({
        id: e.id,
        status: e.status,
        message: e.message,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
        listing: {
          id: e.listing.id,
          title: e.listing.title,
          price: e.listing.price,
          priceUnit: e.listing.priceUnit,
          coverImageUrl: e.listing.coverImageUrl,
        },
        agent: {
          name:
            e.listing.agent.agentProfile?.displayName ??
            `${e.listing.agent.profile?.firstName ?? ""} ${e.listing.agent.profile?.lastName ?? ""}`.trim(),
        },
      })),
    });
  } catch (e) {
    return handle(e);
  }
}

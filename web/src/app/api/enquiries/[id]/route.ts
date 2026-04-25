import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { ok, err, handle } from "@/lib/api/respond";

/** GET /api/enquiries/[id] — full enquiry detail (user or agent of the lead) */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await params;

    const enquiry = await prisma.enquiry.findUnique({
      where: { id },
      include: {
        listing: {
          select: { id: true, title: true, price: true, priceUnit: true, coverImageUrl: true },
        },
      },
    });
    if (!enquiry) return err("Not found", 404);

    const isAgent = enquiry.agentId === session.userId;
    const isOwner = enquiry.userId === session.userId;
    if (!isAgent && !isOwner && session.role !== "admin") return err("Forbidden", 403);

    let agent = null;
    if (isOwner) {
      const agentUser = await prisma.user.findUnique({
        where: { id: enquiry.agentId },
        include: { profile: true, agentProfile: true },
      });
      if (agentUser) {
        agent = {
          name:
            agentUser.agentProfile?.displayName ||
            `${agentUser.profile?.firstName ?? ""} ${agentUser.profile?.lastName ?? ""}`.trim() ||
            "Agent",
          avatar: agentUser.agentProfile?.profileImageUrl ?? agentUser.profile?.avatarUrl ?? null,
          phone: agentUser.profile?.phone ?? null,
          email: agentUser.email,
        };
      }
    }

    return ok({
      enquiry: {
        id: enquiry.id,
        status: enquiry.status,
        message: enquiry.message,
        userName: enquiry.name,
        userPhone: enquiry.phone,
        userEmail: enquiry.email,
        createdAt: enquiry.createdAt,
        updatedAt: enquiry.updatedAt,
        listing: enquiry.listing,
        agent,
        viewerRole: isAgent ? "agent" : "user",
      },
    });
  } catch (e) {
    return handle(e);
  }
}

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { ok, err, handle } from "@/lib/api/respond";
import { scoreListingAgainstIntent } from "@/lib/ai/match-intent";
import type { ParsedIntent } from "@/lib/ai/types";
import { sendPushToUser } from "@/lib/push/send";
import { z } from "zod";

const schema = z.object({
  action: z.enum(["approve", "reject", "request_revision", "unpublish"]),
  reason: z.string().optional(),
});

/** POST /api/admin/listings/[id]/review */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole(["admin"]);
    const { id } = await params;
    const body = await req.json();
    const { action, reason } = schema.parse(body);

    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) return err("Not found", 404);

    const statusMap = {
      approve: "published",
      reject: "rejected",
      request_revision: "revision_requested",
      unpublish: "unavailable",
    } as const;

    const updated = await prisma.listing.update({
      where: { id },
      data: {
        status: statusMap[action],
        reviewedById: session.userId,
        reviewedAt: new Date(),
        rejectionReason: action === "reject" ? reason ?? null : null,
        adminNote: reason ?? null,
        ...(action === "approve" && !listing.publishedAt && { publishedAt: new Date() }),
      },
    });

    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId: session.userId,
        actionType: `listing.${action}`,
        targetType: "listing",
        targetId: id,
        note: reason,
      },
    });

    // Notify agent about the review decision
    if (action !== "unpublish") {
      const notifMap = {
        approve: {
          type: "listing_approved" as const,
          title: "ประกาศได้รับอนุมัติ",
          message: `"${listing.title}" ได้รับการอนุมัติและเผยแพร่แล้ว`,
        },
        reject: {
          type: "listing_rejected" as const,
          title: "ประกาศถูกปฏิเสธ",
          message: reason
            ? `"${listing.title}" ถูกปฏิเสธ: ${reason}`
            : `"${listing.title}" ถูกปฏิเสธ`,
        },
        request_revision: {
          type: "listing_revision_requested" as const,
          title: "ต้องการให้แก้ไข",
          message: reason
            ? `"${listing.title}" ต้องแก้ไข: ${reason}`
            : `"${listing.title}" ต้องการการแก้ไข`,
        },
      }[action];
      await prisma.notification.create({
        data: {
          userId: listing.agentId,
          type: notifMap.type,
          title: notifMap.title,
          message: notifMap.message,
          link: "/agent/listings",
        },
      });
    }

    // On approve: notify users whose SavedSearch matches this listing
    if (action === "approve") {
      const savedSearches = await prisma.savedSearch.findMany({
        where: { notifyOnNew: true },
      });
      const matches: { userId: string; savedSearchName: string }[] = [];
      for (const s of savedSearches) {
        try {
          const intent = JSON.parse(s.intentData) as ParsedIntent;
          const { match } = scoreListingAgainstIntent(updated, intent);
          if (match) matches.push({ userId: s.userId, savedSearchName: s.name });
        } catch {
          // skip invalid intent
        }
      }
      if (matches.length > 0) {
        await prisma.notification.createMany({
          data: matches.map((m) => ({
            userId: m.userId,
            type: "saved_search_match" as const,
            title: "ทรัพย์ใหม่ตรงใจ ✨",
            message: `"${listing.title}" ตรงกับการค้นหา "${m.savedSearchName}" ของคุณ`,
            link: `/listing/${listing.id}`,
          })),
        });
        await prisma.savedSearch.updateMany({
          where: { id: { in: savedSearches.filter((s) => matches.some((m) => m.userId === s.userId && m.savedSearchName === s.name)).map((s) => s.id) } },
          data: { lastNotifiedAt: new Date() },
        });

        // Fire-and-forget web push (non-blocking — don't await)
        const uniqueUsers = Array.from(new Set(matches.map((m) => m.userId)));
        Promise.all(
          uniqueUsers.map((userId) =>
            sendPushToUser(userId, {
              title: "ทรัพย์ใหม่ตรงใจ ✨",
              body: `${listing.title} — ${listing.district ?? ""}`.trim(),
              url: `/listing/${listing.id}`,
              tag: `saved-search-${listing.id}`,
            }).catch(() => null)
          )
        ).catch(() => null);
      }
    }

    return ok({ status: updated.status });
  } catch (e) {
    return handle(e);
  }
}

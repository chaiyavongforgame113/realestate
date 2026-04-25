import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { ok, err, handle } from "@/lib/api/respond";
import { z } from "zod";

const schema = z.object({
  action: z.enum(["approve", "reject"]),
  reason: z.string().optional(),
});

/**
 * POST /api/admin/listings/revisions/[id]/review
 *
 * Approve or reject a pending revision submitted by an agent on a published listing.
 * - approve: merge proposed fields into the Listing, mark revision as approved
 * - reject:  leave Listing untouched, mark revision as rejected with reason
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["admin"]);
    const { id } = await params;
    const body = await req.json();
    const { action, reason } = schema.parse(body);

    const revision = await prisma.listingRevision.findUnique({
      where: { id },
      include: { listing: true },
    });
    if (!revision) return err("Not found", 404);
    if (revision.status !== "pending") {
      return err("revision already reviewed", 409);
    }

    if (action === "approve") {
      // Parse proposed data
      let data: Record<string, unknown>;
      try {
        data = JSON.parse(revision.data);
      } catch {
        return err("revision data corrupted", 500);
      }
      const { amenities, lifestyleTags, images, ...rest } = data as {
        amenities?: string[];
        lifestyleTags?: string[];
        images?: unknown;
        [k: string]: unknown;
      };
      void images;

      // Apply to listing inside a transaction
      await prisma.$transaction([
        prisma.listing.update({
          where: { id: revision.listingId },
          data: {
            ...rest,
            ...(amenities && { amenities: JSON.stringify(amenities) }),
            ...(lifestyleTags && { lifestyleTags: JSON.stringify(lifestyleTags) }),
          },
        }),
        prisma.listingRevision.update({
          where: { id },
          data: {
            status: "approved",
            reviewedById: session.userId,
            reviewedAt: new Date(),
            adminNote: reason ?? null,
          },
        }),
      ]);
    } else {
      // reject
      await prisma.listingRevision.update({
        where: { id },
        data: {
          status: "rejected",
          reviewedById: session.userId,
          reviewedAt: new Date(),
          rejectionReason: reason ?? null,
        },
      });
    }

    // Admin audit trail
    await prisma.adminAction.create({
      data: {
        adminId: session.userId,
        actionType: `listing_revision.${action}`,
        targetType: "listing_revision",
        targetId: id,
        note: reason,
      },
    });

    // Notify agent
    const notif =
      action === "approve"
        ? {
            type: "listing_approved" as const,
            title: "การแก้ไขได้รับอนุมัติ",
            message: `การแก้ไข "${revision.listing.title}" ถูกอนุมัติและอัปเดตให้ผู้ใช้เห็นแล้ว`,
          }
        : {
            type: "listing_rejected" as const,
            title: "การแก้ไขถูกปฏิเสธ",
            message: reason
              ? `การแก้ไข "${revision.listing.title}" ถูกปฏิเสธ: ${reason}`
              : `การแก้ไข "${revision.listing.title}" ถูกปฏิเสธ`,
          };
    await prisma.notification.create({
      data: {
        userId: revision.agentId,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        link: `/agent/listings/${revision.listingId}/edit`,
      },
    });

    return ok({ ok: true, action });
  } catch (e) {
    return handle(e);
  }
}

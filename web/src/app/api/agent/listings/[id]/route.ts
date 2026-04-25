import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { listingUpdateSchema } from "@/lib/validation/listing";
import { toListingDTO } from "@/lib/listings/transform";
import { ok, err, handle } from "@/lib/api/respond";

async function ensureOwnListing(id: string, userId: string, role: string) {
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) return null;
  if (role !== "admin" && listing.agentId !== userId) return null;
  return listing;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole(["agent", "admin"]);
    const { id } = await params;
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: { images: { orderBy: { order: "asc" } }, agent: { include: { profile: true, agentProfile: true } } },
    });
    if (!listing) return err("Not found", 404);
    if (session.role !== "admin" && listing.agentId !== session.userId) return err("Forbidden", 403);
    return ok({ listing: toListingDTO(listing) });
  } catch (e) {
    return handle(e);
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole(["agent", "admin"]);
    const { id } = await params;
    const existing = await ensureOwnListing(id, session.userId, session.role);
    if (!existing) return err("Not found or forbidden", 404);

    const body = await req.json();
    const data = listingUpdateSchema.parse(body);

    // Block direct edit while pending_review — agent must wait for admin decision
    if (existing.status === "pending_review" && session.role !== "admin") {
      return err(
        "ประกาศนี้อยู่ระหว่างรอตรวจจากแอดมิน ไม่สามารถแก้ไขได้จนกว่าจะได้รับการตัดสินใจ",
        409
      );
    }

    // === EDIT-AS-REVISION for PUBLISHED listings ===
    // Published/sold/rented listings don't edit in place — stage as ListingRevision
    // that admin must approve before public data changes. Also cancel any existing
    // pending revision (keep only the latest one).
    if (existing.status === "published" || existing.status === "sold" || existing.status === "rented") {
      if (session.role !== "admin") {
        await prisma.listingRevision.updateMany({
          where: { listingId: id, status: "pending" },
          data: { status: "rejected", adminNote: "ถูกแทนที่โดยการแก้ไขใหม่" },
        });
        await prisma.listingRevision.create({
          data: {
            listingId: id,
            agentId: existing.agentId,
            status: "pending",
            data: JSON.stringify(data),
          },
        });
        return ok({
          ok: true,
          revision: true,
          message: "บันทึกการแก้ไขแล้ว รอแอดมินตรวจสอบก่อนเผยแพร่ข้อมูลใหม่",
        });
      }
      // Admin editing a published listing → apply immediately
    }

    // === DIRECT EDIT for draft / rejected / revision_requested ===
    const nextStatus =
      existing.status === "rejected" || existing.status === "revision_requested"
        ? "draft"
        : existing.status;

    const { amenities, lifestyleTags, images, ...rest } = data;
    void images;
    await prisma.listing.update({
      where: { id },
      data: {
        ...rest,
        ...(amenities && { amenities: JSON.stringify(amenities) }),
        ...(lifestyleTags && { lifestyleTags: JSON.stringify(lifestyleTags) }),
        status: nextStatus,
      },
    });

    return ok({ ok: true, revision: false });
  } catch (e) {
    return handle(e);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole(["agent", "admin"]);
    const { id } = await params;
    const existing = await ensureOwnListing(id, session.userId, session.role);
    if (!existing) return err("Not found or forbidden", 404);

    if (existing.status !== "draft" && session.role !== "admin") {
      return err("ลบได้เฉพาะประกาศฉบับร่างเท่านั้น", 400);
    }

    await prisma.listing.delete({ where: { id } });
    return ok({ ok: true });
  } catch (e) {
    return handle(e);
  }
}

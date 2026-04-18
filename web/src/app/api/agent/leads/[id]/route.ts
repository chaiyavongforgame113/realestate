import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { enquiryStatusSchema, enquiryNotesSchema } from "@/lib/validation/enquiry";
import { ok, err, handle } from "@/lib/api/respond";

/** PATCH /api/agent/leads/[id] — update status or notes */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole(["agent", "admin"]);
    const { id } = await params;
    const enquiry = await prisma.enquiry.findUnique({ where: { id } });
    if (!enquiry) return err("Not found", 404);
    if (session.role !== "admin" && enquiry.agentId !== session.userId) return err("Forbidden", 403);

    const body = await req.json();

    const data: { status?: "new" | "contacted" | "viewing_scheduled" | "negotiating" | "won" | "lost" | "spam"; agentNotes?: string } = {};
    if ("status" in body) {
      data.status = enquiryStatusSchema.parse({ status: body.status }).status;
    }
    if ("agentNotes" in body) {
      data.agentNotes = enquiryNotesSchema.parse({ agentNotes: body.agentNotes }).agentNotes;
    }

    await prisma.enquiry.update({ where: { id }, data });

    // Notify end-user on status change (if authenticated)
    if (data.status && enquiry.userId && data.status !== enquiry.status) {
      const statusLabel: Record<string, string> = {
        contacted: "ติดต่อแล้ว",
        viewing_scheduled: "นัดดูห้อง",
        negotiating: "กำลังต่อรอง",
        won: "ปิดดีลสำเร็จ",
        lost: "ไม่สำเร็จ",
        spam: "ปิดการติดต่อ",
      };
      await prisma.notification.create({
        data: {
          userId: enquiry.userId,
          type: "lead_status_changed",
          title: `สถานะติดต่อเปลี่ยน: ${statusLabel[data.status] ?? data.status}`,
          message: "Agent ได้อัปเดตสถานะการติดต่อของคุณ",
          link: "/enquiries",
        },
      });
    }

    return ok({ ok: true });
  } catch (e) {
    return handle(e);
  }
}

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { ok, err, handle } from "@/lib/api/respond";

const PatchSchema = z.object({
  status: z.enum(["requested", "confirmed", "cancelled", "completed", "no_show"]),
  reason: z.string().max(500).optional().nullable(),
});

/** PATCH /api/agent/appointments/[id] — update status */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole(["agent", "admin"]);
    const { id } = await params;
    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment) return err("Not found", 404);
    if (session.role !== "admin" && appointment.agentId !== session.userId) {
      return err("Forbidden", 403);
    }

    const body = await req.json();
    const { status, reason } = PatchSchema.parse(body);

    if ((status === "cancelled" || status === "no_show") && !reason?.trim()) {
      return err("กรุณาระบุเหตุผล", 400);
    }

    await prisma.appointment.update({
      where: { id },
      data: {
        status,
        cancellationReason:
          status === "cancelled" || status === "no_show" ? reason ?? null : null,
      },
    });

    if (status !== appointment.status) {
      const labels: Record<string, string> = {
        confirmed: "Agent ยืนยันการนัดดูแล้ว",
        cancelled: "Agent ยกเลิกการนัดดู",
        completed: "นัดดูเสร็จสิ้น",
        no_show: "บันทึกว่าไม่มาตามนัด",
      };
      const baseMessage = labels[status];
      if (baseMessage) {
        const message = reason?.trim() ? `${baseMessage} — ${reason.trim()}` : baseMessage;
        await prisma.notification.create({
          data: {
            userId: appointment.userId,
            type: "lead_status_changed",
            title: "อัปเดตสถานะนัดดู",
            message,
            link: "/appointments",
          },
        });
      }
    }

    return ok({ ok: true });
  } catch (e) {
    return handle(e);
  }
}

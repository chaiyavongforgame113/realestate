import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { applicationReviewSchema } from "@/lib/validation/agent";
import { ok, err, handle } from "@/lib/api/respond";

/** POST /api/admin/agents/applications/[id]/review */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole(["admin"]);
    const { id } = await params;
    const body = await req.json();
    const { action, note } = applicationReviewSchema.parse(body);

    const app = await prisma.agentApplication.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!app) return err("Not found", 404);

    const statusMap = {
      approve: "approved",
      reject: "rejected",
      request_info: "info_requested",
    } as const;

    await prisma.$transaction(async (tx) => {
      await tx.agentApplication.update({
        where: { id },
        data: {
          status: statusMap[action],
          adminNote: note,
          reviewedById: session.userId,
          reviewedAt: new Date(),
        },
      });

      // On approve: promote user to agent + create AgentProfile
      if (action === "approve") {
        await tx.user.update({
          where: { id: app.userId },
          data: { role: "agent" },
        });

        const existingProfile = await tx.agentProfile.findUnique({
          where: { userId: app.userId },
        });
        if (!existingProfile) {
          await tx.agentProfile.create({
            data: {
              userId: app.userId,
              displayName: app.companyName ?? app.fullName,
              verifiedAt: new Date(),
            },
          });
        }
      }

      await tx.adminAction.create({
        data: {
          adminId: session.userId,
          actionType: `agent_application.${action}`,
          targetType: "agent_application",
          targetId: id,
          note,
        },
      });

      const notifMap = {
        approve: {
          type: "application_approved" as const,
          title: "ใบสมัคร Agent ได้รับอนุมัติ",
          message: "คุณสามารถเริ่มลงประกาศได้ทันที",
          link: "/agent",
        },
        reject: {
          type: "application_rejected" as const,
          title: "ใบสมัคร Agent ถูกปฏิเสธ",
          message: note ?? "ไม่ผ่านเกณฑ์การพิจารณา",
          link: "/become-agent",
        },
        request_info: {
          type: "application_info_requested" as const,
          title: "ต้องการข้อมูลเพิ่มเติม",
          message: note ?? "กรุณาส่งเอกสารเพิ่มเติม",
          link: "/become-agent",
        },
      }[action];

      await tx.notification.create({
        data: {
          userId: app.userId,
          type: notifMap.type,
          title: notifMap.title,
          message: notifMap.message,
          link: notifMap.link,
        },
      });
    });

    return ok({ ok: true });
  } catch (e) {
    return handle(e);
  }
}

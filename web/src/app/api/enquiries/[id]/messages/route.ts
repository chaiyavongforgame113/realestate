import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { ok, err, handle } from "@/lib/api/respond";

const PostSchema = z.object({
  body: z.string().trim().min(1, "ข้อความว่าง").max(2000),
});

async function loadEnquiryAndCheckAccess(id: string, session: { userId: string; role: string }) {
  const enquiry = await prisma.enquiry.findUnique({ where: { id } });
  if (!enquiry) return { enquiry: null, role: null as null };
  const isAgent = enquiry.agentId === session.userId;
  const isOwner = enquiry.userId === session.userId;
  if (!isAgent && !isOwner && session.role !== "admin") return { enquiry: null, role: null };
  return { enquiry, role: isAgent ? "agent" : "user" } as const;
}

/** GET /api/enquiries/[id]/messages — list messages in this enquiry thread */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const { enquiry, role } = await loadEnquiryAndCheckAccess(id, session);
    if (!enquiry || !role) return err("Not found", 404);

    const messages = await prisma.enquiryMessage.findMany({
      where: { enquiryId: id },
      orderBy: { createdAt: "asc" },
    });

    // Mark messages from other side as read
    const otherRole = role === "agent" ? "user" : "agent";
    await prisma.enquiryMessage.updateMany({
      where: { enquiryId: id, senderRole: otherRole, readAt: null },
      data: { readAt: new Date() },
    });

    return ok({ messages });
  } catch (e) {
    return handle(e);
  }
}

/** POST /api/enquiries/[id]/messages — send a message */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const { enquiry, role } = await loadEnquiryAndCheckAccess(id, session);
    if (!enquiry || !role) return err("Not found", 404);

    const data = PostSchema.parse(await req.json());

    const msg = await prisma.enquiryMessage.create({
      data: {
        enquiryId: id,
        senderId: session.userId,
        senderRole: role,
        body: data.body,
      },
    });

    // Notify the other side
    if (role === "agent" && enquiry.userId) {
      await prisma.notification.create({
        data: {
          userId: enquiry.userId,
          type: "lead_status_changed",
          title: "Agent ตอบกลับแล้ว",
          message: data.body.slice(0, 140),
          link: `/enquiries/${id}`,
        },
      });
    } else if (role === "user") {
      await prisma.notification.create({
        data: {
          userId: enquiry.agentId,
          type: "lead_new",
          title: "ข้อความใหม่ใน Lead",
          message: `${enquiry.name}: ${data.body.slice(0, 120)}`,
          link: "/agent/leads",
        },
      });
      // Bump status from "new" to "contacted" once user replies
      if (enquiry.status === "new") {
        await prisma.enquiry.update({ where: { id }, data: { status: "contacted" } });
      }
    }

    return ok({ message: msg });
  } catch (e) {
    return handle(e);
  }
}

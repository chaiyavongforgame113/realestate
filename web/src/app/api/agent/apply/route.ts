import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { agentApplicationSchema } from "@/lib/validation/agent";
import { ok, err, handle } from "@/lib/api/respond";

/** POST /api/agent/apply — submit application */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return err("Unauthorized", 401);
    if (session.role === "agent") return err("คุณเป็น Agent อยู่แล้ว", 400);

    const body = await req.json();
    const data = agentApplicationSchema.parse(body);

    // Prevent duplicate open applications
    const existing = await prisma.agentApplication.findFirst({
      where: {
        userId: session.userId,
        status: { in: ["pending_review", "info_requested"] },
      },
    });
    if (existing) return err("คุณมีใบสมัครที่รอพิจารณาอยู่แล้ว", 400);

    await prisma.agentApplication.create({
      data: {
        userId: session.userId,
        fullName: data.fullName,
        companyName: data.companyName,
        phone: data.phone,
        experienceYears: data.experienceYears,
        expertiseAreas: JSON.stringify(data.expertiseAreas),
        licenseDocumentUrl: data.licenseDocumentUrl,
        idDocumentUrl: data.idDocumentUrl,
      },
    });

    return ok({ ok: true });
  } catch (e) {
    return handle(e);
  }
}

/** GET /api/agent/apply — own application status */
export async function GET() {
  try {
    const session = await getSession();
    if (!session) return err("Unauthorized", 401);

    const app = await prisma.agentApplication.findFirst({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
    });

    return ok({ application: app });
  } catch (e) {
    return handle(e);
  }
}

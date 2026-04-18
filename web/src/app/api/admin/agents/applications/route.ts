import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { ok, handle } from "@/lib/api/respond";

/** GET /api/admin/agents/applications — queue */
export async function GET(req: NextRequest) {
  try {
    await requireRole(["admin"]);
    const status = req.nextUrl.searchParams.get("status") as
      | "pending_review"
      | "approved"
      | "rejected"
      | "info_requested"
      | null;

    const apps = await prisma.agentApplication.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "asc" },
      include: {
        user: { select: { email: true, profile: { select: { avatarUrl: true } } } },
      },
    });

    return ok({
      applications: apps.map((a) => ({
        id: a.id,
        fullName: a.fullName,
        companyName: a.companyName,
        phone: a.phone,
        email: a.user.email,
        avatar: a.user.profile?.avatarUrl ?? null,
        experienceYears: a.experienceYears,
        expertiseAreas: JSON.parse(a.expertiseAreas),
        status: a.status,
        adminNote: a.adminNote,
        submittedAt: a.createdAt,
        reviewedAt: a.reviewedAt,
      })),
    });
  } catch (e) {
    return handle(e);
  }
}

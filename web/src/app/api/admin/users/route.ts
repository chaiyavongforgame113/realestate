import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { ok, handle } from "@/lib/api/respond";

/** GET /api/admin/users */
export async function GET(req: NextRequest) {
  try {
    await requireRole(["admin"]);
    const role = req.nextUrl.searchParams.get("role") as "user" | "agent" | "admin" | null;
    const q = req.nextUrl.searchParams.get("q");

    const users = await prisma.user.findMany({
      where: {
        ...(role && { role }),
        ...(q && {
          OR: [
            { email: { contains: q } },
            { profile: { firstName: { contains: q } } },
            { profile: { lastName: { contains: q } } },
          ],
        }),
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        profile: true,
        _count: { select: { listings: true, enquiries: true } },
      },
    });

    return ok({
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        role: u.role,
        status: u.status,
        name: [u.profile?.firstName, u.profile?.lastName].filter(Boolean).join(" ") || u.email,
        avatar: u.profile?.avatarUrl,
        joined: u.createdAt,
        listings: u._count.listings,
        enquiries: u._count.enquiries,
      })),
    });
  } catch (e) {
    return handle(e);
  }
}

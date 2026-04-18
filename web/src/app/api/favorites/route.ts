import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { toListingDTO } from "@/lib/listings/transform";
import { ok, err, handle } from "@/lib/api/respond";
import { z } from "zod";

const schema = z.object({ listingId: z.string().min(1) });

/** GET /api/favorites — user's saved listings */
export async function GET() {
  try {
    const session = await getSession();
    if (!session) return err("Unauthorized", 401);

    const favs = await prisma.favorite.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      include: {
        listing: {
          include: {
            images: { take: 1 },
            agent: { include: { profile: true, agentProfile: true } },
          },
        },
      },
    });

    return ok({
      favorites: favs.map((f) => ({
        id: f.id,
        createdAt: f.createdAt,
        listing: toListingDTO(f.listing),
      })),
    });
  } catch (e) {
    return handle(e);
  }
}

/** POST /api/favorites — add to favorites */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return err("Unauthorized", 401);
    const body = await req.json();
    const { listingId } = schema.parse(body);

    await prisma.favorite.upsert({
      where: { userId_listingId: { userId: session.userId, listingId } },
      update: {},
      create: { userId: session.userId, listingId },
    });

    return ok({ ok: true });
  } catch (e) {
    return handle(e);
  }
}

/** DELETE /api/favorites?listingId=... */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return err("Unauthorized", 401);
    const listingId = req.nextUrl.searchParams.get("listingId");
    if (!listingId) return err("listingId required", 400);

    await prisma.favorite.deleteMany({
      where: { userId: session.userId, listingId },
    });

    return ok({ ok: true });
  } catch (e) {
    return handle(e);
  }
}

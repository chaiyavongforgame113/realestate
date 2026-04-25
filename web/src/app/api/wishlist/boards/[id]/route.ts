import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";

const PatchSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  isPrivate: z.boolean().optional(),
});

/** GET /api/wishlist/boards/[id] — board with listing details */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const { id } = await params;

  const board = await prisma.wishlistBoard.findFirst({
    where: { id, userId: user.id },
    include: { items: true },
  });
  if (!board) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const listingIds = board.items.map((i) => i.listingId);
  const listings = await prisma.listing.findMany({
    where: { id: { in: listingIds } },
    select: {
      id: true,
      title: true,
      price: true,
      priceUnit: true,
      coverImageUrl: true,
      district: true,
      bedrooms: true,
      bathrooms: true,
      usableArea: true,
    },
  });

  return NextResponse.json({
    board: {
      id: board.id,
      name: board.name,
      isPrivate: board.isPrivate,
      coverUrl: board.coverUrl,
      createdAt: board.createdAt,
      updatedAt: board.updatedAt,
      items: board.items.map((it) => ({
        id: it.id,
        listingId: it.listingId,
        note: it.note,
        addedAt: it.addedAt,
        listing: listings.find((l) => l.id === it.listingId) ?? null,
      })),
    },
  });
}

/** PATCH /api/wishlist/boards/[id] — rename or change privacy */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const { id } = await params;

  const board = await prisma.wishlistBoard.findFirst({ where: { id, userId: user.id } });
  if (!board) return NextResponse.json({ error: "not_found" }, { status: 404 });

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const parsed = PatchSchema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  const updated = await prisma.wishlistBoard.update({
    where: { id },
    data: parsed.data,
  });
  return NextResponse.json({ board: updated });
}

/** DELETE /api/wishlist/boards/[id] */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const { id } = await params;

  const board = await prisma.wishlistBoard.findFirst({ where: { id, userId: user.id } });
  if (!board) return NextResponse.json({ error: "not_found" }, { status: 404 });

  await prisma.wishlistBoard.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";

const AddSchema = z.object({
  boardId: z.string().min(1),
  listingId: z.string().min(1),
  note: z.string().max(300).optional().nullable(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const parsed = AddSchema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  // Verify the board belongs to the user
  const board = await prisma.wishlistBoard.findFirst({
    where: { id: parsed.data.boardId, userId: user.id },
  });
  if (!board) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const item = await prisma.wishlistItem.upsert({
    where: {
      boardId_listingId: {
        boardId: parsed.data.boardId,
        listingId: parsed.data.listingId,
      },
    },
    create: {
      boardId: parsed.data.boardId,
      listingId: parsed.data.listingId,
      note: parsed.data.note ?? null,
    },
    update: { note: parsed.data.note ?? null },
  });
  return NextResponse.json({ item });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const url = new URL(req.url);
  const boardId = url.searchParams.get("boardId");
  const listingId = url.searchParams.get("listingId");
  if (!boardId || !listingId) return NextResponse.json({ error: "invalid_params" }, { status: 400 });
  const board = await prisma.wishlistBoard.findFirst({
    where: { id: boardId, userId: user.id },
  });
  if (!board) return NextResponse.json({ error: "not_found" }, { status: 404 });
  await prisma.wishlistItem.deleteMany({
    where: { boardId, listingId },
  });
  return NextResponse.json({ ok: true });
}

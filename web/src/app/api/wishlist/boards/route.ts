import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";

const CreateSchema = z.object({
  name: z.string().min(1).max(80),
  coverUrl: z.string().url().optional().nullable(),
  isPrivate: z.boolean().default(false),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const boards = await prisma.wishlistBoard.findMany({
    where: { userId: user.id },
    include: { items: true },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ boards });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const parsed = CreateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }
  const board = await prisma.wishlistBoard.create({
    data: {
      userId: user.id,
      name: parsed.data.name,
      coverUrl: parsed.data.coverUrl ?? null,
      isPrivate: parsed.data.isPrivate,
    },
  });
  return NextResponse.json({ board });
}

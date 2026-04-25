import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";

const KIND = ["listing", "area", "project", "agent"] as const;

const CreateSchema = z.object({
  targetKind: z.enum(KIND),
  targetId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional().nullable(),
  body: z.string().min(3).max(2000),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const targetKind = url.searchParams.get("targetKind") as
    | (typeof KIND)[number]
    | null;
  const targetId = url.searchParams.get("targetId");
  if (!targetKind || !KIND.includes(targetKind) || !targetId) {
    return NextResponse.json({ error: "invalid_params" }, { status: 400 });
  }
  const [items, grouped, agg] = await Promise.all([
    prisma.review.findMany({
      where: { targetKind, targetId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.review.groupBy({
      by: ["rating"],
      where: { targetKind, targetId },
      _count: { rating: true },
    }),
    prisma.review.aggregate({
      where: { targetKind, targetId },
      _count: { _all: true },
      _avg: { rating: true },
    }),
  ]);

  const count = agg._count._all;
  const avg = agg._avg.rating ?? 0;
  const byRating = new Map(grouped.map((g) => [g.rating, g._count.rating]));
  const distribution = [1, 2, 3, 4, 5].map((n) => ({
    star: n,
    count: byRating.get(n) ?? 0,
  }));

  return NextResponse.json({ items, summary: { count, avg, distribution } });
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
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }
  const created = await prisma.review.create({
    data: {
      userId: user.id,
      targetKind: parsed.data.targetKind,
      targetId: parsed.data.targetId,
      rating: parsed.data.rating,
      title: parsed.data.title ?? null,
      body: parsed.data.body,
    },
  });
  return NextResponse.json({ review: created });
}

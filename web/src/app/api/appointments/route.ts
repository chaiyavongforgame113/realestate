import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";

const CreateSchema = z.object({
  listingId: z.string().min(1),
  agentId: z.string().min(1).optional().nullable(),
  scheduledAt: z.string().datetime(),
  durationMins: z.number().int().min(15).max(180).default(30),
  type: z.enum(["in_person", "video"]).default("in_person"),
  note: z.string().max(500).optional().nullable(),
});

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const url = new URL(req.url);
  const scope = url.searchParams.get("scope") ?? "mine";

  const items = await prisma.appointment.findMany({
    where: scope === "agent" ? { agentId: user.id } : { userId: user.id },
    orderBy: { scheduledAt: "asc" },
    take: 100,
  });
  return NextResponse.json({ items });
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

  const when = new Date(parsed.data.scheduledAt);
  if (Number.isNaN(when.getTime()) || when.getTime() < Date.now()) {
    return NextResponse.json({ error: "invalid_time" }, { status: 400 });
  }

  const created = await prisma.appointment.create({
    data: {
      userId: user.id,
      listingId: parsed.data.listingId,
      agentId: parsed.data.agentId ?? null,
      scheduledAt: when,
      durationMins: parsed.data.durationMins,
      type: parsed.data.type,
      note: parsed.data.note ?? null,
      meetingUrl: parsed.data.type === "video" ? `https://meet.estate.ai/${crypto.randomUUID()}` : null,
      status: "requested",
    },
  });

  return NextResponse.json({ appointment: created });
}

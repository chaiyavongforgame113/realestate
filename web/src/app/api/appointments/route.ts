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
    orderBy: { scheduledAt: "desc" },
    take: 100,
  });

  const listingIds = Array.from(new Set(items.map((a) => a.listingId)));
  const agentIds = Array.from(new Set(items.map((a) => a.agentId).filter((x): x is string => !!x)));

  const [listings, agentProfiles, agents] = await Promise.all([
    prisma.listing.findMany({
      where: { id: { in: listingIds } },
      select: { id: true, title: true, coverImageUrl: true, price: true, priceUnit: true },
    }),
    prisma.agentProfile.findMany({
      where: { userId: { in: agentIds } },
      select: { userId: true, displayName: true, profileImageUrl: true },
    }),
    prisma.userProfile.findMany({
      where: { userId: { in: agentIds } },
      select: { userId: true, firstName: true, lastName: true, phone: true },
    }),
  ]);

  const listingMap = new Map(listings.map((l) => [l.id, l]));
  const agentProfileMap = new Map(agentProfiles.map((p) => [p.userId, p]));
  const agentUserMap = new Map(agents.map((u) => [u.userId, u]));

  return NextResponse.json({
    items: items.map((a) => {
      const ap = a.agentId ? agentProfileMap.get(a.agentId) : null;
      const au = a.agentId ? agentUserMap.get(a.agentId) : null;
      return {
        id: a.id,
        listing: listingMap.get(a.listingId) ?? null,
        agent: a.agentId
          ? {
              name:
                ap?.displayName ||
                `${au?.firstName ?? ""} ${au?.lastName ?? ""}`.trim() ||
                "Agent",
              avatar: ap?.profileImageUrl ?? null,
              phone: au?.phone ?? null,
            }
          : null,
        scheduledAt: a.scheduledAt,
        durationMins: a.durationMins,
        type: a.type,
        status: a.status,
        note: a.note,
        cancellationReason: a.cancellationReason,
        meetingUrl: a.meetingUrl,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      };
    }),
  });
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

  if (created.agentId) {
    const listing = await prisma.listing.findUnique({
      where: { id: created.listingId },
      select: { title: true },
    });
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
      select: { firstName: true, lastName: true },
    });
    const userName =
      `${userProfile?.firstName ?? ""} ${userProfile?.lastName ?? ""}`.trim() ||
      user.email ||
      "ผู้สนใจ";
    const whenLabel = when.toLocaleString("th-TH", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
    await prisma.notification.create({
      data: {
        userId: created.agentId,
        type: "lead_new",
        title: "นัดดูทรัพย์ใหม่",
        message: `${userName} ขอนัดดู "${listing?.title ?? "ทรัพย์"}" — ${whenLabel}`,
        link: "/agent/appointments",
      },
    });
  }

  return NextResponse.json({ appointment: created });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";

const SubscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
  userAgent: z.string().optional().nullable(),
  locale: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const parsed = SubscribeSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const { endpoint, keys, userAgent, locale } = parsed.data;
  const row = await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: {
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      userId: user?.id ?? null,
      userAgent: userAgent ?? null,
      locale: locale ?? null,
    },
    update: {
      p256dh: keys.p256dh,
      auth: keys.auth,
      userId: user?.id ?? null,
      userAgent: userAgent ?? null,
      locale: locale ?? null,
    },
  });

  return NextResponse.json({ ok: true, id: row.id });
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const endpoint = url.searchParams.get("endpoint");
  if (!endpoint) return NextResponse.json({ error: "missing_endpoint" }, { status: 400 });
  try {
    await prisma.pushSubscription.delete({ where: { endpoint } });
  } catch {
    /* ignore — idempotent */
  }
  return NextResponse.json({ ok: true });
}

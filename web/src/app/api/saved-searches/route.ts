import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { ok, err, handle } from "@/lib/api/respond";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).max(100),
  query: z.string().min(1),
  intent: z.record(z.string(), z.unknown()),
  notifyOnNew: z.boolean().default(true),
});

/** GET /api/saved-searches */
export async function GET() {
  try {
    const session = await getSession();
    if (!session) return err("Unauthorized", 401);

    const items = await prisma.savedSearch.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
    });
    return ok({
      items: items.map((s) => ({
        id: s.id,
        name: s.name,
        query: s.query,
        intent: JSON.parse(s.intentData),
        notifyOnNew: s.notifyOnNew,
        createdAt: s.createdAt,
      })),
    });
  } catch (e) {
    return handle(e);
  }
}

/** POST /api/saved-searches */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return err("Unauthorized", 401);
    const body = await req.json();
    const data = schema.parse(body);

    const saved = await prisma.savedSearch.create({
      data: {
        userId: session.userId,
        name: data.name,
        query: data.query,
        intentData: JSON.stringify(data.intent),
        notifyOnNew: data.notifyOnNew,
      },
    });
    return ok({ id: saved.id });
  } catch (e) {
    return handle(e);
  }
}

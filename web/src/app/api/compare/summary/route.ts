import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateCompareSummary } from "@/lib/ai/compare-summary";
import type { ParsedIntent } from "@/lib/ai/types";
import { toListingDTO } from "@/lib/listings/transform";
import { ok, err, handle } from "@/lib/api/respond";
import { z } from "zod";

const schema = z.object({
  listing_ids: z.array(z.string().min(1)).min(2, "ต้องเลือกอย่างน้อย 2 รายการ").max(5),
  session_id: z.string().nullable().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const listings = await prisma.listing.findMany({
      where: { id: { in: data.listing_ids }, status: "published" },
      include: {
        images: { take: 1 },
        agent: { include: { profile: true, agentProfile: true } },
      },
    });

    if (listings.length < 2) return err("ไม่พบข้อมูลทรัพย์เพียงพอสำหรับเปรียบเทียบ", 400);

    // Optional: pull latest intent from session for personalization
    let intent: ParsedIntent | null = null;
    if (data.session_id) {
      const session = await prisma.searchSession.findUnique({
        where: { sessionToken: data.session_id },
        include: { parsedIntents: { orderBy: { createdAt: "desc" }, take: 1 } },
      });
      if (session?.parsedIntents?.[0]) {
        intent = JSON.parse(session.parsedIntents[0].intentData) as ParsedIntent;
      }
    }

    const dtos = listings.map(toListingDTO);
    const summary = await generateCompareSummary(dtos, intent);

    return ok({
      listings: dtos,
      summary,
    });
  } catch (e) {
    return handle(e);
  }
}

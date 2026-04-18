import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { parsePropertyIntent } from "@/lib/ai/intent-parser";
import { generateClarification } from "@/lib/ai/clarification";
import { buildPrismaQuery, buildOrderBy } from "@/lib/ai/query-builder";
import { generateSearchExplanation, generateListingMatchReason } from "@/lib/ai/explainer";
import { createEmptyIntent, type ParsedIntent } from "@/lib/ai/types";
import { toListingDTO } from "@/lib/listings/transform";
import { ok, handle } from "@/lib/api/respond";
import { z } from "zod";

const schema = z.object({
  message: z.string().min(1, "กรุณาพิมพ์ข้อความ"),
  session_id: z.string().optional(),
  clarification_answer: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const auth = await getSession();
    const body = await req.json();
    const data = schema.parse(body);

    // Get or create session
    let session = data.session_id
      ? await prisma.searchSession.findUnique({
          where: { sessionToken: data.session_id },
          include: {
            parsedIntents: { orderBy: { createdAt: "desc" }, take: 1 },
          },
        })
      : null;

    if (!session) {
      const token = randomUUID();
      session = await prisma.searchSession.create({
        data: { sessionToken: token, userId: auth?.userId ?? null },
        include: { parsedIntents: true },
      });
    } else {
      await prisma.searchSession.update({
        where: { id: session.id },
        data: { lastActiveAt: new Date() },
      });
    }

    // Load previous intent if continuing conversation
    const prevIntent: ParsedIntent | undefined = session.parsedIntents?.[0]
      ? (JSON.parse(session.parsedIntents[0].intentData) as ParsedIntent)
      : undefined;
    const prevClarifyCount = session.parsedIntents?.[0]?.clarificationCount ?? 0;

    // Save user message
    await prisma.searchMessage.create({
      data: { sessionId: session.id, role: "user", content: data.message },
    });

    // Parse intent (merges with previous if exists)
    const intent = await parsePropertyIntent(data.message, prevIntent);

    // If key info still missing AND haven't asked 2 times → clarify
    const shouldClarify =
      intent.missing_required_fields.length > 0 && prevClarifyCount < 2;

    if (shouldClarify) {
      const clarification = await generateClarification(
        intent.missing_required_fields,
        data.message,
        intent
      );

      await prisma.parsedSearchIntent.create({
        data: {
          sessionId: session.id,
          intentData: JSON.stringify(intent),
          clarificationCount: prevClarifyCount + 1,
        },
      });
      await prisma.searchMessage.create({
        data: { sessionId: session.id, role: "assistant", content: clarification.question },
      });

      return ok({
        type: "clarification",
        session_id: session.sessionToken,
        question: clarification.question,
        quick_replies: clarification.quick_replies,
        partial_intent: intent,
        field_asking_about: clarification.field_asking_about,
      });
    }

    // Execute search
    const where = buildPrismaQuery(intent);
    const orderBy = buildOrderBy(intent);
    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy,
        take: 20,
        include: {
          images: { take: 3, orderBy: { order: "asc" } },
          agent: { include: { profile: true, agentProfile: true } },
        },
      }),
      prisma.listing.count({ where }),
    ]);

    const dtos = listings.map(toListingDTO);

    // Generate per-listing match reason (parallel, limited to top 6)
    const reasons = await Promise.all(
      dtos.slice(0, 6).map((l) => generateListingMatchReason(intent, l))
    );
    const listingsWithReason = dtos.map((l, i) => ({
      ...l,
      match_reason: i < reasons.length ? reasons[i] : null,
    }));

    const explanation = await generateSearchExplanation(intent, total);

    // Persist final intent (mark complete)
    await prisma.parsedSearchIntent.create({
      data: {
        sessionId: session.id,
        intentData: JSON.stringify(intent),
        clarificationCount: prevClarifyCount,
      },
    });

    return ok({
      type: "results",
      session_id: session.sessionToken,
      intent,
      explanation,
      listings: listingsWithReason,
      total,
    });
  } catch (e) {
    return handle(e);
  }
}

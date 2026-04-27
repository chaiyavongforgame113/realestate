/**
 * POST /api/chat/agent
 *
 * Conversational endpoint. Handles a single turn of chat:
 *   1. Loads (or creates) a SearchSession + persisted message history
 *   2. Saves the new user message
 *   3. Runs the agent (Gemini → fallback) to produce a reply + updated intent
 *   4. Saves the AI reply
 *   5. If `next_action === "ready_to_search"`, runs the search and returns
 *      results inline so the chat UI can show cards without navigating.
 *
 * Response shape:
 *   - type="message" → { reply, quick_replies, intent, fallback? }
 *   - type="results" → { reply, intent, listings, total, relaxed, session_id }
 */
import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { runAgentTurn, type AgentTurn } from "@/lib/ai/agent";
import { buildPrismaQuery, buildOrderBy } from "@/lib/ai/query-builder";
import { explainMatch } from "@/lib/ai/match-intent";
import { createEmptyIntent, type ParsedIntent } from "@/lib/ai/types";
import { toListingDTO } from "@/lib/listings/transform";
import { ok, handle } from "@/lib/api/respond";
import { z } from "zod";

const schema = z.object({
  message: z.string().min(1, "กรุณาพิมพ์ข้อความ"),
  session_id: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const auth = await getSession();
    const body = await req.json();
    const data = schema.parse(body);

    // 1. Load or create session
    let session = data.session_id
      ? await prisma.searchSession.findUnique({
          where: { sessionToken: data.session_id },
          include: {
            parsedIntents: { orderBy: { createdAt: "desc" }, take: 1 },
            messages: { orderBy: { createdAt: "asc" }, take: 30 },
          },
        })
      : null;

    if (!session) {
      const token = randomUUID();
      session = await prisma.searchSession.create({
        data: { sessionToken: token, userId: auth?.userId ?? null },
        include: { parsedIntents: true, messages: true },
      });
    } else {
      await prisma.searchSession.update({
        where: { id: session.id },
        data: { lastActiveAt: new Date() },
      });
    }

    const prevIntent: ParsedIntent = session.parsedIntents?.[0]
      ? (JSON.parse(session.parsedIntents[0].intentData) as ParsedIntent)
      : createEmptyIntent();

    // 2. Save user message
    await prisma.searchMessage.create({
      data: { sessionId: session.id, role: "user", content: data.message },
    });

    // 3. Build conversation history for the agent
    const history: AgentTurn[] = [
      ...(session.messages?.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })) ?? []),
      { role: "user", content: data.message },
    ];

    // 4. Run agent
    const decision = await runAgentTurn(history, prevIntent);

    // 5. Save AI reply
    await prisma.searchMessage.create({
      data: {
        sessionId: session.id,
        role: "assistant",
        content: decision.reply,
      },
    });

    // 6. Persist intent
    await prisma.parsedSearchIntent.create({
      data: {
        sessionId: session.id,
        intentData: JSON.stringify(decision.intent),
        clarificationCount: 0,
      },
    });

    // 7. If agent ready → run search and return results inline
    if (decision.next_action === "ready_to_search") {
      const where = buildPrismaQuery(decision.intent);
      const orderBy = buildOrderBy(decision.intent);
      const [listings, total] = await Promise.all([
        prisma.listing.findMany({
          where,
          orderBy,
          take: 60,
          include: {
            images: { take: 3, orderBy: { order: "asc" } },
            agent: { include: { profile: true, agentProfile: true } },
          },
        }),
        prisma.listing.count({ where }),
      ]);

      const scored = listings
        .map((l) => ({ raw: l, dto: toListingDTO(l), match: explainMatch(l, decision.intent) }))
        .filter((x) => x.match.blockers.length === 0)
        .sort((a, b) => b.match.score - a.match.score)
        .slice(0, 12);

      // Try query-level relaxation if scoring path emptied results
      let relaxedSteps: { key: string; label: string }[] = [];
      let finalScored = scored;
      if (finalScored.length === 0 && total === 0) {
        const { RELAXATION_STEPS } = await import("@/lib/ai/relaxation");
        let working = decision.intent;
        for (const step of RELAXATION_STEPS) {
          const next = step.apply(working);
          if (JSON.stringify(next) === JSON.stringify(working)) continue;
          working = next;
          relaxedSteps.push({ key: step.key, label: step.label });
          const more = await prisma.listing.findMany({
            where: buildPrismaQuery(working),
            orderBy: buildOrderBy(working),
            take: 60,
            include: {
              images: { take: 3, orderBy: { order: "asc" } },
              agent: { include: { profile: true, agentProfile: true } },
            },
          });
          if (more.length > 0) {
            finalScored = more
              .map((l) => ({ raw: l, dto: toListingDTO(l), match: explainMatch(l, working) }))
              .filter((x) => x.match.blockers.length === 0)
              .sort((a, b) => b.match.score - a.match.score)
              .slice(0, 12);
            if (finalScored.length > 0) break;
          }
        }
      }

      const listingsWithReason = finalScored.map((s) => ({
        ...s.dto,
        match_score: s.match.score,
        match_reasons: s.match.reasons,
        match_concerns: s.match.concerns,
        match_reason: null as string | null,
      }));

      return ok({
        type: "results",
        session_id: session.sessionToken,
        reply: decision.reply,
        intent: decision.intent,
        listings: listingsWithReason,
        total: relaxedSteps.length > 0 ? finalScored.length : total,
        relaxed: relaxedSteps,
        fallback: decision.fallback ?? false,
      });
    }

    // 8. Return plain message turn
    return ok({
      type: "message",
      session_id: session.sessionToken,
      reply: decision.reply,
      quick_replies: decision.quick_replies,
      intent: decision.intent,
      fallback: decision.fallback ?? false,
    });
  } catch (e) {
    return handle(e);
  }
}

/** GET /api/chat/agent?session=xxx — load existing session for resume / refinement. */
export async function GET(req: NextRequest) {
  try {
    const sid = req.nextUrl.searchParams.get("session");
    if (!sid) return ok({ messages: [], intent: null });
    const session = await prisma.searchSession.findUnique({
      where: { sessionToken: sid },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
        parsedIntents: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });
    if (!session) return ok({ messages: [], intent: null });
    return ok({
      session_id: session.sessionToken,
      messages: session.messages.map((m) => ({ role: m.role, content: m.content })),
      intent: session.parsedIntents[0]
        ? JSON.parse(session.parsedIntents[0].intentData)
        : null,
    });
  } catch (e) {
    return handle(e);
  }
}

import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { parsePropertyIntent } from "@/lib/ai/intent-parser";
import { generateClarification } from "@/lib/ai/clarification";
import { buildPrismaQuery, buildOrderBy } from "@/lib/ai/query-builder";
// Note: explainer-based Gemini calls removed to preserve quota for the chat agent.
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

    // Execute search — pull a broader pool than top 20 so post-filter (amenity/age/view)
    // doesn't strip the result set too thin. Cap at 80 to bound CPU.
    const fetchListings = (i: ParsedIntent) =>
      prisma.listing.findMany({
        where: buildPrismaQuery(i),
        orderBy: buildOrderBy(i),
        take: 80,
        include: {
          images: { take: 3, orderBy: { order: "asc" } },
          agent: { include: { profile: true, agentProfile: true } },
        },
      });

    let listings = await fetchListings(intent);
    let total = await prisma.listing.count({ where: buildPrismaQuery(intent) });

    // Query-level relaxation — when DB query itself returned empty, walk the
    // relaxation steps and re-query until we get any candidates. Track which
    // steps were applied for transparency.
    const queryRelaxedSteps: { key: string; label: string }[] = [];
    if (listings.length === 0) {
      const { RELAXATION_STEPS } = await import("@/lib/ai/relaxation");
      let working = intent;
      for (const step of RELAXATION_STEPS) {
        const next = step.apply(working);
        if (JSON.stringify(next) === JSON.stringify(working)) continue;
        working = next;
        queryRelaxedSteps.push({ key: step.key, label: step.label });
        listings = await fetchListings(working);
        if (listings.length > 0) {
          total = await prisma.listing.count({ where: buildPrismaQuery(working) });
          break;
        }
      }
    }

    // Compute embedding similarity in parallel — soft signal, capped to +12.
    // If embeddings unavailable (no API key, listing not yet embedded), skip silently.
    const { generateEmbedding, intentFingerprint, similarityForListings } = await import(
      "@/lib/ai/embeddings"
    );
    const intentText = intentFingerprint(intent);
    const similarityMap = await (async () => {
      try {
        const vec = await generateEmbedding(intentText);
        if (!vec) return new Map<string, number>();
        return await similarityForListings(vec, listings.map((l) => l.id));
      } catch (e) {
        console.error("[search] similarity failed (continuing)", e);
        return new Map<string, number>();
      }
    })();

    // Score every fetched listing & rank by score (filter out hard blockers)
    const { explainMatch } = await import("@/lib/ai/match-intent");
    const allScored = listings.map((l) => {
      const m = explainMatch(l, intent);
      const sim = similarityMap.get(l.id) ?? null;
      // Augment with semantic similarity — only when listing has embedding stored.
      // sim is in [-1, 1] but for natural-language texts of same domain ≥0.
      // Map [0.5, 0.85] → [0, 12] linearly; clamp to [0, 12].
      if (sim !== null) {
        const bonus = Math.max(0, Math.min(12, Math.round(((sim - 0.5) / 0.35) * 12)));
        if (bonus > 0) {
          m.score = Math.min(100, m.score + bonus);
          if (bonus >= 6) m.reasons.push(`เนื้อหาคล้ายกับที่ขอ (${Math.round(sim * 100)}%)`);
        }
      }
      return { raw: l, dto: toListingDTO(l), match: m, sim };
    });
    let scored = allScored
      .filter((x) => x.match.blockers.length === 0)
      .sort((a, b) => b.match.score - a.match.score)
      .slice(0, 24);

    // Progressive relaxation when no exact match
    let relaxedSteps: { key: string; label: string }[] = [...queryRelaxedSteps];
    if (scored.length === 0 && listings.length > 0) {
      const { relaxSearch } = await import("@/lib/ai/relaxation");
      const relaxResult = relaxSearch(intent, listings);
      if (relaxResult) {
        scored = relaxResult.scored
          .map((r) => ({
            raw: r.raw,
            dto: toListingDTO(r.raw),
            match: r.match,
            sim: similarityMap.get(r.raw.id) ?? null,
          }))
          .slice(0, 12);
        // Merge & dedupe by step key — query-level and scoring-level steps overlap
        const seen = new Set(queryRelaxedSteps.map((s) => s.key));
        const fresh = relaxResult.relaxed.filter((s) => !seen.has(s.key));
        relaxedSteps = [...queryRelaxedSteps, ...fresh];
      }
    }

    const dtos = scored.map((s) => s.dto);

    // Skip per-listing Gemini explanations — match_reasons already carry the
    // structured "why this fits" content. Keeps quota for the conversational agent.
    const listingsWithReason = scored.map((s) => ({
      ...s.dto,
      match_score: s.match.score,
      match_reasons: s.match.reasons,
      match_concerns: s.match.concerns,
      match_reason: s.match.reasons.slice(0, 3).join(" · ") || null,
    }));

    // Use rule-based explanation; reserve Gemini for chat agent only.
    const explanation = `${intent.interpreted_as} — พบ ${total} รายการ`;

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
      relaxed: relaxedSteps,
    });
  } catch (e) {
    return handle(e);
  }
}

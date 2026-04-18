import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { ok, handle } from "@/lib/api/respond";
import type { ParsedIntent } from "@/lib/ai/types";

/** GET /api/admin/ai-analytics — aggregate search intent data */
export async function GET() {
  try {
    await requireRole(["admin"]);

    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days

    const [totalSessions, totalMessages, intents, recentMessages] = await Promise.all([
      prisma.searchSession.count({ where: { createdAt: { gte: since } } }),
      prisma.searchMessage.count({ where: { createdAt: { gte: since }, role: "user" } }),
      prisma.parsedSearchIntent.findMany({
        where: { createdAt: { gte: since } },
        orderBy: { createdAt: "desc" },
        take: 500,
      }),
      prisma.searchMessage.findMany({
        where: { role: "user", createdAt: { gte: since } },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    // Parse intent JSON once
    const parsed = intents
      .map((i) => {
        try {
          return JSON.parse(i.intentData) as ParsedIntent & { _clarifyCount: number };
        } catch {
          return null;
        }
      })
      .filter((x): x is ParsedIntent & { _clarifyCount: number } => x !== null);

    // Aggregations
    const goalCounts = { buy: 0, rent: 0, unknown: 0 };
    const propertyCounts: Record<string, number> = {};
    const districtCounts: Record<string, number> = {};
    const stationCounts: Record<string, number> = {};
    let withClarification = 0;
    let totalConfidence = 0;
    let confidenceCount = 0;

    for (const p of parsed) {
      if (p.search_goal === "buy") goalCounts.buy++;
      else if (p.search_goal === "rent") goalCounts.rent++;
      else goalCounts.unknown++;

      for (const t of p.property_types ?? []) propertyCounts[t] = (propertyCounts[t] ?? 0) + 1;
      for (const d of p.preferred_districts ?? []) districtCounts[d] = (districtCounts[d] ?? 0) + 1;
      for (const s of p.preferred_stations ?? []) stationCounts[s] = (stationCounts[s] ?? 0) + 1;

      if ((p.missing_required_fields ?? []).length > 0) withClarification++;
      if (typeof p.confidence_score === "number") {
        totalConfidence += p.confidence_score;
        confidenceCount++;
      }
    }

    const topDistricts = Object.entries(districtCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    const topStations = Object.entries(stationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    const popularQueries = recentMessages.slice(0, 20).map((m) => ({
      query: m.content,
      at: m.createdAt,
    }));

    return ok({
      totals: {
        sessions: totalSessions,
        messages: totalMessages,
        avgConfidence: confidenceCount > 0 ? totalConfidence / confidenceCount : 0,
        clarificationRate: parsed.length > 0 ? withClarification / parsed.length : 0,
      },
      goal: goalCounts,
      property_types: propertyCounts,
      top_districts: topDistricts,
      top_stations: topStations,
      popular_queries: popularQueries,
    });
  } catch (e) {
    return handle(e);
  }
}

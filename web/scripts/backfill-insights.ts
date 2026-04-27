/**
 * Backfill Neighborhood Insights for all published listings.
 * Run: pnpm tsx scripts/backfill-insights.ts
 *
 * Sequential to respect Overpass free-tier rate limit (~10 req/min).
 * Sleeps 7s between calls. Skips listings updated within the last 7 days.
 */
import { prisma } from "../src/lib/prisma";
import { refreshListingInsights } from "../src/lib/ai/insights";

const SLEEP_MS = 7000;
const FRESH_WINDOW_DAYS = 7;

async function main() {
  const cutoff = new Date(Date.now() - FRESH_WINDOW_DAYS * 86400 * 1000);
  const targets = await prisma.listing.findMany({
    where: {
      status: "published",
      OR: [{ insightsUpdatedAt: null }, { insightsUpdatedAt: { lt: cutoff } }],
    },
    select: { id: true, latitude: true, longitude: true, title: true },
  });

  console.log(`[backfill] ${targets.length} listings to refresh`);

  for (let i = 0; i < targets.length; i++) {
    const t = targets[i];
    const start = Date.now();
    const result = await refreshListingInsights(prisma, t.id, t.latitude, t.longitude);
    const ms = Date.now() - start;
    console.log(
      `[${i + 1}/${targets.length}] ${t.title.slice(0, 40)} — ${result ? `walk=${result.walkScore} transit=${result.transitScore}` : "FAILED"} (${ms}ms)`
    );
    if (i < targets.length - 1) await new Promise((r) => setTimeout(r, SLEEP_MS));
  }

  console.log("[backfill] done");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

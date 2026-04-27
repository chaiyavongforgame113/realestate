/**
 * Backfill description embeddings for all published listings.
 * Run: pnpm tsx scripts/backfill-embeddings.ts
 *
 * Free-tier embedding limit: 1500 RPM. We sleep 100ms between calls (10 RPS) which
 * is well under the limit but plenty fast for real datasets.
 */
import { prisma } from "../src/lib/prisma";
import { generateEmbedding, listingFingerprint, storeListingEmbedding } from "../src/lib/ai/embeddings";

const SLEEP_MS = 200;

async function main() {
  // Listings that don't have an embedding yet
  const rows = await prisma.$queryRawUnsafe<{ id: string }[]>(
    `SELECT id FROM "Listing" WHERE status = 'published' AND "descriptionEmbedding" IS NULL`
  );
  console.log(`[embeddings] ${rows.length} listings to embed`);

  for (let i = 0; i < rows.length; i++) {
    const id = rows[i].id;
    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { title: true, description: true, district: true, amenities: true, lifestyleTags: true },
    });
    if (!listing) continue;
    const text = listingFingerprint(listing);
    const start = Date.now();
    const vec = await generateEmbedding(text);
    if (!vec) {
      console.log(`[${i + 1}/${rows.length}] ${listing.title.slice(0, 40)} — FAILED to embed`);
      continue;
    }
    await storeListingEmbedding(id, vec);
    console.log(
      `[${i + 1}/${rows.length}] ${listing.title.slice(0, 40)} — dim=${vec.length} (${Date.now() - start}ms)`
    );
    if (i < rows.length - 1) await new Promise((r) => setTimeout(r, SLEEP_MS));
  }

  console.log("[embeddings] done");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

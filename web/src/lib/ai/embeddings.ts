/**
 * Description embeddings via Gemini text-embedding-004 (768 dims).
 * Stored in Postgres `descriptionEmbedding` column (pgvector). Used as a soft
 * semantic-similarity signal during listing matching.
 *
 * Free tier: 1500 RPM, 100K req/day — plenty for our scale. Caller code must
 * tolerate failures gracefully: embeddings are nice-to-have, not blocking.
 */
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";

const apiKey = process.env.GEMINI_API_KEY;
let _client: GoogleGenerativeAI | null = null;
// gemini-embedding-001 returns 3072 dims by default. We truncate via Matryoshka
// (the model is trained so leading dims carry most signal) then L2-normalize so
// cosine similarity stays well-defined. Storing 768 dims keeps the pgvector
// column small and ivfflat index efficient.
const MODEL = "gemini-embedding-001";
const SOURCE_DIM = 3072;
const DIM = 768;

function l2Normalize(v: number[]): number[] {
  let n = 0;
  for (let i = 0; i < v.length; i++) n += v[i] * v[i];
  n = Math.sqrt(n);
  if (n === 0) return v;
  return v.map((x) => x / n);
}

function getClient(): GoogleGenerativeAI | null {
  if (!apiKey) return null;
  if (!_client) _client = new GoogleGenerativeAI(apiKey);
  return _client;
}

export const hasEmbeddingSupport = !!apiKey;

/** Compute a single embedding vector for a piece of text. */
export async function generateEmbedding(text: string): Promise<number[] | null> {
  const client = getClient();
  if (!client) return null;
  const trimmed = text.replace(/\s+/g, " ").trim().slice(0, 8192);
  if (!trimmed) return null;

  try {
    const model = client.getGenerativeModel({ model: MODEL });
    const result = await model.embedContent(trimmed);
    const values = result.embedding?.values;
    if (!Array.isArray(values) || (values.length !== SOURCE_DIM && values.length !== DIM)) {
      console.error("[embed] unexpected embedding shape", values?.length);
      return null;
    }
    // Matryoshka truncate to DIM if source is larger, then re-normalize.
    if (values.length === SOURCE_DIM) {
      return l2Normalize(values.slice(0, DIM));
    }
    return values;
  } catch (e) {
    console.error("[embed] failed", e);
    return null;
  }
}

/** Format a number[] as a Postgres vector literal: '[0.12,0.34,...]' */
export function toVectorLiteral(vec: number[]): string {
  return `[${vec.join(",")}]`;
}

/** Build a fingerprint string from a listing — stable summary of what to embed. */
export function listingFingerprint(l: {
  title: string;
  description: string;
  district: string;
  amenities: string;
  lifestyleTags: string;
}): string {
  let amen = "";
  let lifestyle = "";
  try { amen = (JSON.parse(l.amenities) as string[]).join(", "); } catch {}
  try { lifestyle = (JSON.parse(l.lifestyleTags) as string[]).join(", "); } catch {}
  return `${l.title}\nย่าน: ${l.district}\nสิ่งอำนวยความสะดวก: ${amen}\nไลฟ์สไตล์: ${lifestyle}\nรายละเอียด: ${l.description}`;
}

/** Build a fingerprint string from intent — emphasizes what user actually said. */
export function intentFingerprint(intent: {
  interpreted_as: string;
  raw_keywords: string[];
  required_amenities?: string[];
  nice_to_have_amenities?: string[];
  neighborhood_vibe?: string[];
}): string {
  return [
    intent.interpreted_as,
    ...(intent.raw_keywords ?? []),
    ...(intent.required_amenities ?? []),
    ...(intent.nice_to_have_amenities ?? []),
    ...(intent.neighborhood_vibe ?? []),
  ].filter(Boolean).join("\n");
}

/** Persist an embedding for a listing. Uses raw SQL because Prisma lacks vector. */
export async function storeListingEmbedding(listingId: string, vec: number[]): Promise<void> {
  await prisma.$executeRawUnsafe(
    `UPDATE "Listing" SET "descriptionEmbedding" = $1::vector WHERE id = $2`,
    toVectorLiteral(vec),
    listingId
  );
}

/**
 * Compute cosine similarity 0-1 between intent vector and a set of listings.
 * Returns a Map<listingId, similarity (0-1)>. Listings without embeddings are absent.
 */
export async function similarityForListings(
  intentVec: number[],
  listingIds: string[]
): Promise<Map<string, number>> {
  if (listingIds.length === 0) return new Map();
  const rows = await prisma.$queryRawUnsafe<{ id: string; sim: number }[]>(
    `SELECT id, 1 - ("descriptionEmbedding" <=> $1::vector) AS sim
       FROM "Listing"
      WHERE id = ANY($2::text[]) AND "descriptionEmbedding" IS NOT NULL`,
    toVectorLiteral(intentVec),
    listingIds
  );
  const m = new Map<string, number>();
  for (const r of rows) m.set(r.id, Number(r.sim));
  return m;
}

/**
 * Refresh embedding for a listing (called on publish/update).
 * Failures are swallowed.
 */
export async function refreshListingEmbedding(listingId: string): Promise<boolean> {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { title: true, description: true, district: true, amenities: true, lifestyleTags: true },
    });
    if (!listing) return false;
    const text = listingFingerprint(listing);
    const vec = await generateEmbedding(text);
    if (!vec) return false;
    await storeListingEmbedding(listingId, vec);
    return true;
  } catch (e) {
    console.error("[embed] refreshListingEmbedding failed", listingId, e);
    return false;
  }
}

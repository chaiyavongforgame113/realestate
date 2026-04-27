/**
 * Computes Neighborhood Insights for a listing from OpenStreetMap (Overpass API).
 * Pulls all POI categories within 3km, then derives:
 *  - poiCounts (per category, counts within 1km — the "walkable" radius)
 *  - walkScore (weighted POI density 0-100)
 *  - transitScore (transit availability + proximity 0-100)
 *  - vibeTags (heuristic classification: central, quiet, nightlife, family, …)
 *  - nearbyHighlights (top 6 nearest named POIs across categories)
 *
 * Free tier — no API key. Rate limit: ~10 requests/min/IP.
 * Always wrap callers with a try/catch; an Overpass failure should not block listing publish.
 */

import { fetchNearbyAmenities, type Amenity, type AmenityCategory } from "@/lib/map/overpass";
import type { NeighborhoodVibe } from "./types";

export type ListingInsights = {
  walkScore: number;
  transitScore: number;
  poiCounts: Record<AmenityCategory, number>;
  nearbyHighlights: { name: string; category: AmenityCategory; distanceMeters: number }[];
  vibeTags: NeighborhoodVibe[];
  computedAt: string;
};

const SCAN_RADIUS_M = 3000;
const WALKABLE_RADIUS_M = 1000;

// Walk Score weights — sum to 1.0. Finer categories share weight pools
// (e.g., shopping vs mall both contribute to the "shopping" weight).
const CATEGORY_WEIGHTS: Record<AmenityCategory, number> = {
  food: 0.22,
  shopping: 0.10,
  mall: 0.10,
  transit: 0.18,
  school: 0.05,
  international_school: 0.04,
  university: 0.03,
  hospital: 0.13,
  park: 0.10,
  office: 0.05,
};

/**
 * Compute insights from raw POI list. Pure function — easy to test.
 * Counts within 1km contribute to scores; vibe uses 3km signals.
 */
export function deriveInsights(allPois: Amenity[]): Omit<ListingInsights, "computedAt"> {
  const within1km = allPois.filter((p) => p.distanceMeters <= WALKABLE_RADIUS_M);

  // POI counts (1km) — initialize all categories to 0 for stable JSON shape
  const counts: Record<AmenityCategory, number> = {
    transit: 0, school: 0, international_school: 0, university: 0,
    hospital: 0, food: 0, shopping: 0, mall: 0, park: 0, office: 0,
  };
  for (const p of within1km) counts[p.category] += 1;

  // Walk Score — log-scaled per category, weighted, normalized to 100.
  // Reasoning: 1 cafe vs 0 = huge jump; 30 vs 25 = small. log(1+n) flattens that.
  // Per-cat full-credit threshold: when log(1+n) >= log(1+CAP) → 100% of weight.
  const CAPS: Record<AmenityCategory, number> = {
    food: 25, shopping: 8, mall: 3, transit: 6, school: 6,
    international_school: 2, university: 2, hospital: 6, park: 4, office: 8,
  };
  let walkScore = 0;
  for (const cat of Object.keys(CATEGORY_WEIGHTS) as AmenityCategory[]) {
    const n = counts[cat];
    const ratio = Math.min(1, Math.log(1 + n) / Math.log(1 + CAPS[cat]));
    walkScore += ratio * CATEGORY_WEIGHTS[cat] * 100;
  }
  walkScore = Math.round(walkScore);

  // Transit Score — focuses purely on transit category, weights proximity
  const transitPois = allPois.filter((p) => p.category === "transit");
  let transitScore = 0;
  if (transitPois.length > 0) {
    const closest = transitPois[0].distanceMeters; // sorted ascending
    // Distance component (max 70): closer is better. Full credit ≤300m, zero at 1500m.
    const distComponent = Math.max(0, Math.min(70, 70 * (1 - (closest - 300) / 1200)));
    // Density component (max 30): how many stations within 1km
    const within1kmTransit = transitPois.filter((p) => p.distanceMeters <= 1000).length;
    const densityComponent = Math.min(30, within1kmTransit * 6);
    transitScore = Math.round(distComponent + densityComponent);
  }

  // Top 6 nearest named POIs (highlights — surfaces variety)
  const seenCats = new Set<AmenityCategory>();
  const highlights: ListingInsights["nearbyHighlights"] = [];
  // First pass: one per category for diversity
  for (const p of allPois) {
    if (highlights.length >= 6) break;
    if (seenCats.has(p.category)) continue;
    if (!p.name) continue;
    highlights.push({
      name: p.name,
      category: p.category,
      distanceMeters: Math.round(p.distanceMeters),
    });
    seenCats.add(p.category);
  }
  // Second pass: fill remaining slots with closest regardless of category
  for (const p of allPois) {
    if (highlights.length >= 6) break;
    if (highlights.find((h) => h.name === p.name)) continue;
    if (!p.name) continue;
    highlights.push({
      name: p.name,
      category: p.category,
      distanceMeters: Math.round(p.distanceMeters),
    });
  }

  // Vibe classification — heuristic over the full 3km dataset
  const vibeTags: NeighborhoodVibe[] = deriveVibe(allPois, counts, transitScore, walkScore);

  return { walkScore, transitScore, poiCounts: counts, nearbyHighlights: highlights, vibeTags };
}

function deriveVibe(
  all: Amenity[],
  counts1km: Record<AmenityCategory, number>,
  transitScore: number,
  walkScore: number
): NeighborhoodVibe[] {
  const tags: NeighborhoodVibe[] = [];
  const totalFood3km = all.filter((p) => p.category === "food").length;
  // shopping_district = mall + supermarket; school family combined for hub signal
  const totalShop3km =
    all.filter((p) => p.category === "shopping").length +
    all.filter((p) => p.category === "mall").length;
  const totalMalls3km = all.filter((p) => p.category === "mall").length;
  const totalParks3km = all.filter((p) => p.category === "park").length;
  const totalSchools3km =
    all.filter((p) => p.category === "school").length +
    all.filter((p) => p.category === "international_school").length;
  const totalHospitals3km = all.filter((p) => p.category === "hospital").length;

  // Walkable — when walk score crosses density threshold
  if (walkScore >= 75) tags.push("walkable");

  // Central — heavy mixed activity
  if (totalFood3km > 100 && totalShop3km > 30 && transitScore >= 70) tags.push("central");

  // Quiet — sparse food/nightlife signal
  if (totalFood3km < 20 && transitScore < 50) tags.push("quiet");

  // Nightlife — bar/restaurant density very high & food count overwhelming
  const nightlifeSpots = all.filter((p) => {
    const t = p.tags ?? {};
    return t.amenity === "bar" || t.amenity === "pub" || t.amenity === "nightclub";
  }).length;
  if (nightlifeSpots > 5 || totalFood3km > 200) tags.push("nightlife");

  // Family — schools + parks + hospitals signal
  if (totalSchools3km >= 5 && totalParks3km >= 2 && counts1km.hospital >= 1) tags.push("family");

  // Investment hot — central + walkable + heavy transit
  if (transitScore >= 80 && walkScore >= 80) tags.push("investment_hot");

  // Green — parks dominate
  if (totalParks3km >= 4) tags.push("green");

  // Shopping district — mall presence boosts signal
  if (counts1km.shopping >= 4 || totalShop3km >= 25 || totalMalls3km >= 2) {
    tags.push("shopping_district");
  }

  // Education hub
  if (totalSchools3km >= 8) tags.push("education_hub");

  // Medical hub
  if (totalHospitals3km >= 3) tags.push("medical_hub");

  return Array.from(new Set(tags));
}

/**
 * Fetch from Overpass and compute. Network-bound; caller should treat failures as soft.
 */
export async function computeListingInsights(
  lat: number,
  lng: number,
  signal?: AbortSignal
): Promise<ListingInsights> {
  const pois = await fetchNearbyAmenities(
    lat,
    lng,
    ["transit", "school", "hospital", "food", "shopping", "park"],
    SCAN_RADIUS_M,
    signal
  );
  const derived = deriveInsights(pois);
  return { ...derived, computedAt: new Date().toISOString() };
}

/**
 * Persist computed insights onto a Listing row. Caller should already have lat/lng.
 * Errors are swallowed — insights are nice-to-have; do not block publish.
 */
export async function refreshListingInsights(
  prismaClient: { listing: { update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<unknown> } },
  listingId: string,
  lat: number,
  lng: number
): Promise<ListingInsights | null> {
  try {
    const insights = await computeListingInsights(lat, lng);
    await prismaClient.listing.update({
      where: { id: listingId },
      data: {
        walkScore: insights.walkScore,
        transitScore: insights.transitScore,
        poiCounts: JSON.stringify(insights.poiCounts),
        nearbyHighlights: JSON.stringify(insights.nearbyHighlights),
        vibeTags: JSON.stringify(insights.vibeTags),
        insightsUpdatedAt: new Date(insights.computedAt),
      },
    });
    return insights;
  } catch (e) {
    console.error("[insights] compute failed for", listingId, e);
    return null;
  }
}

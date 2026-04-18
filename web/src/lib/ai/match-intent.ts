import type { ParsedIntent } from "./types";
import type { Listing } from "@prisma/client";

/**
 * Check whether a listing matches a user's saved intent.
 * Returns a score (0-100) and whether it qualifies as a match (>=60).
 */
export function scoreListingAgainstIntent(listing: Listing, intent: Partial<ParsedIntent>): { score: number; match: boolean } {
  let score = 100;
  let blocker = false;

  // Hard filters
  if (intent.search_goal) {
    const goal = intent.search_goal === "buy" ? "sale" : "rent";
    if (listing.listingType !== goal) blocker = true;
  }

  if (intent.budget_max && listing.price > intent.budget_max) {
    if (listing.price > intent.budget_max * 1.1) blocker = true;
    else score -= 20;
  }

  if (intent.budget_min && listing.price < intent.budget_min) {
    score -= 15;
  }

  if (intent.property_types?.length && !intent.property_types.includes(listing.propertyType)) {
    blocker = true;
  }

  if (intent.bedrooms !== null && intent.bedrooms !== undefined) {
    if (intent.bedrooms_flexible) {
      if (listing.bedrooms < intent.bedrooms) score -= 20;
    } else {
      if (listing.bedrooms !== intent.bedrooms) score -= 25;
    }
  }

  // Soft: location matching
  if (intent.preferred_stations?.length) {
    const stationsText = [listing.nearestBts, listing.nearestMrt, listing.nearestArl].filter(Boolean).join(" ");
    const anyMatch = intent.preferred_stations.some((s) => stationsText.includes(s));
    if (!anyMatch) score -= 15;
  }

  if (intent.preferred_districts?.length && !intent.preferred_districts.includes(listing.district)) {
    score -= 10;
  }

  if (blocker) return { score: 0, match: false };
  return { score: Math.max(0, score), match: score >= 60 };
}

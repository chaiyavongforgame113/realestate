import type { Prisma } from "@prisma/client";
import type { ParsedIntent } from "./types";

export function buildPrismaQuery(intent: ParsedIntent): Prisma.ListingWhereInput {
  const where: Prisma.ListingWhereInput = {
    status: "published",
  };

  if (intent.search_goal && !intent.search_goal_flexible) {
    where.listingType = intent.search_goal === "buy" ? "sale" : "rent";
  }
  // When flexible — leave listingType unfiltered, scoring layer will rank both

  if (intent.search_goal_flexible && (intent.budget_max_buy || intent.budget_max_rent)) {
    // Dual-track budget — match buy listings ≤ buy budget OR rent listings ≤ rent budget
    const budgetClauses: Prisma.ListingWhereInput[] = [];
    if (intent.budget_max_buy) {
      budgetClauses.push({ listingType: "sale", price: { lte: intent.budget_max_buy } });
    }
    if (intent.budget_max_rent) {
      budgetClauses.push({ listingType: "rent", price: { lte: intent.budget_max_rent } });
    }
    if (budgetClauses.length > 0) {
      where.OR = budgetClauses;
    }
  } else if (intent.budget_min !== null || intent.budget_max !== null) {
    where.price = {
      ...(intent.budget_min !== null && { gte: intent.budget_min }),
      ...(intent.budget_max !== null && { lte: intent.budget_max }),
    };
  }

  if (intent.property_types.length > 0) {
    where.propertyType = { in: intent.property_types };
  }

  if (intent.bedrooms !== null) {
    where.bedrooms = intent.bedrooms_flexible ? { gte: intent.bedrooms } : intent.bedrooms;
  }

  if (intent.bathrooms !== null) {
    where.bathrooms = { gte: intent.bathrooms };
  }

  if (intent.usable_area_min !== null) {
    // Use 80% of requested area as floor — listing slightly under target still ranks via match scoring
    where.usableArea = { gte: intent.usable_area_min * 0.8 };
  }

  // Floor preference — only as soft filter; matched in explainMatch.
  // Required amenities — same: filtered post-query because amenities is JSON text.

  // District matching is SOFT — "ย่านสุขุมวิท" colloquially spans multiple official
  // districts (วัฒนา, คลองเตย, พระโขนง). Hard filter would cut valid candidates.
  // Scoring lives in explainMatch.
  // Furnishing is SOFT for the same reason — many listings under-tag this field.

  // Stations remain HARD since they are precise. Bound the OR to other constraints
  // by wrapping it in AND when present.
  if (intent.preferred_stations.length > 0) {
    where.AND = [
      {
        OR: intent.preferred_stations.flatMap((station) => [
          { nearestBts: { contains: station } },
          { nearestMrt: { contains: station } },
          { nearestArl: { contains: station } },
        ]),
      },
    ];
  } else if (intent.transit_preference.length > 0) {
    const conds: Prisma.ListingWhereInput[] = [];
    if (intent.transit_preference.includes("BTS")) conds.push({ nearestBts: { not: null } });
    if (intent.transit_preference.includes("MRT")) conds.push({ nearestMrt: { not: null } });
    if (intent.transit_preference.includes("ARL")) conds.push({ nearestArl: { not: null } });
    if (conds.length) where.AND = [{ OR: conds }];
  }

  return where;
}

export function buildOrderBy(intent: ParsedIntent): Prisma.ListingOrderByWithRelationInput[] {
  // If budget set — rank closest to budget_max (cheaper within limit first)
  if (intent.budget_max) return [{ price: "asc" }];
  return [{ publishedAt: "desc" }];
}

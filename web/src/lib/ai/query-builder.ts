import type { Prisma } from "@prisma/client";
import type { ParsedIntent } from "./types";

export function buildPrismaQuery(intent: ParsedIntent): Prisma.ListingWhereInput {
  const where: Prisma.ListingWhereInput = {
    status: "published",
  };

  if (intent.search_goal) {
    where.listingType = intent.search_goal === "buy" ? "sale" : "rent";
  }

  if (intent.budget_min !== null || intent.budget_max !== null) {
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
    where.usableArea = { gte: intent.usable_area_min };
  }

  if (intent.preferred_districts.length > 0) {
    where.district = { in: intent.preferred_districts };
  }

  // Match on station text for either BTS or MRT
  if (intent.preferred_stations.length > 0) {
    where.OR = intent.preferred_stations.flatMap((station) => [
      { nearestBts: { contains: station } },
      { nearestMrt: { contains: station } },
      { nearestArl: { contains: station } },
    ]);
  } else if (intent.transit_preference.length > 0) {
    const conds: Prisma.ListingWhereInput[] = [];
    if (intent.transit_preference.includes("BTS")) conds.push({ nearestBts: { not: null } });
    if (intent.transit_preference.includes("MRT")) conds.push({ nearestMrt: { not: null } });
    if (intent.transit_preference.includes("ARL")) conds.push({ nearestArl: { not: null } });
    if (conds.length) where.OR = conds;
  }

  if (intent.furnishing_preference) {
    where.furnishing = intent.furnishing_preference;
  }

  return where;
}

export function buildOrderBy(intent: ParsedIntent): Prisma.ListingOrderByWithRelationInput[] {
  // If budget set — rank closest to budget_max (cheaper within limit first)
  if (intent.budget_max) return [{ price: "asc" }];
  return [{ publishedAt: "desc" }];
}

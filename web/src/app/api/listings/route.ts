import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { toListingDTO } from "@/lib/listings/transform";
import { ok, handle } from "@/lib/api/respond";

function parseList(v: string | null): string[] | undefined {
  if (!v) return undefined;
  return v.split(",").map((x) => x.trim()).filter(Boolean);
}

function parseNum(v: string | null): number | undefined {
  if (v === null) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;

    const listingType = sp.get("listing_type") as "sale" | "rent" | null;
    const propertyTypes = parseList(sp.get("property_types"));
    const districts = parseList(sp.get("districts"));
    const priceMin = parseNum(sp.get("price_min"));
    const priceMax = parseNum(sp.get("price_max"));
    const bedroomsMin = parseNum(sp.get("bedrooms_min"));
    const bathroomsMin = parseNum(sp.get("bathrooms_min"));
    const usableMin = parseNum(sp.get("usable_area_min"));
    const sortBy = sp.get("sort_by") ?? "newest";
    const page = Math.max(1, parseNum(sp.get("page")) ?? 1);
    const limit = Math.min(50, parseNum(sp.get("limit")) ?? 20);

    const where: Prisma.ListingWhereInput = {
      status: "published",
      ...(listingType && { listingType }),
      ...(propertyTypes?.length && {
        propertyType: { in: propertyTypes as Prisma.EnumPropertyTypeFilter["in"] },
      }),
      ...(districts?.length && { district: { in: districts } }),
      ...((priceMin !== undefined || priceMax !== undefined) && {
        price: {
          ...(priceMin !== undefined && { gte: priceMin }),
          ...(priceMax !== undefined && { lte: priceMax }),
        },
      }),
      ...(bedroomsMin !== undefined && { bedrooms: { gte: bedroomsMin } }),
      ...(bathroomsMin !== undefined && { bathrooms: { gte: bathroomsMin } }),
      ...(usableMin !== undefined && { usableArea: { gte: usableMin } }),
    };

    const orderBy: Prisma.ListingOrderByWithRelationInput =
      sortBy === "price_asc"
        ? { price: "asc" }
        : sortBy === "price_desc"
        ? { price: "desc" }
        : { publishedAt: "desc" };

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          images: { take: 5, orderBy: { order: "asc" } },
          agent: { include: { profile: true, agentProfile: true } },
        },
      }),
      prisma.listing.count({ where }),
    ]);

    return ok({
      listings: listings.map(toListingDTO),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (e) {
    return handle(e);
  }
}

/**
 * GET /api/listings/[id]/insights
 *
 * Returns Neighborhood Insights for a listing. If insights are missing or stale
 * (> 30 days), recomputes from Overpass. Cached fields live on the Listing row.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { refreshListingInsights, type ListingInsights } from "@/lib/ai/insights";

const STALE_AFTER_DAYS = 30;

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const listing = await prisma.listing.findUnique({
    where: { id },
    select: {
      id: true,
      latitude: true,
      longitude: true,
      walkScore: true,
      transitScore: true,
      poiCounts: true,
      nearbyHighlights: true,
      vibeTags: true,
      insightsUpdatedAt: true,
    },
  });

  if (!listing) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const isStale =
    !listing.insightsUpdatedAt ||
    Date.now() - listing.insightsUpdatedAt.getTime() > STALE_AFTER_DAYS * 86400 * 1000;
  const isMissing = listing.walkScore == null;

  if (isMissing || isStale) {
    const fresh = await refreshListingInsights(prisma, id, listing.latitude, listing.longitude);
    if (fresh) {
      return NextResponse.json({ insights: fresh, source: "fresh" });
    }
    // fall through with whatever stale data we have
  }

  if (listing.walkScore == null) {
    return NextResponse.json({ insights: null, source: "unavailable" });
  }

  const insights: ListingInsights = {
    walkScore: listing.walkScore,
    transitScore: listing.transitScore ?? 0,
    poiCounts: safeJson(listing.poiCounts) as ListingInsights["poiCounts"],
    nearbyHighlights: safeJson(listing.nearbyHighlights) as ListingInsights["nearbyHighlights"],
    vibeTags: safeJson(listing.vibeTags) as ListingInsights["vibeTags"],
    computedAt: listing.insightsUpdatedAt?.toISOString() ?? new Date().toISOString(),
  };
  return NextResponse.json(
    { insights, source: "cache" },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}

function safeJson(s: string | null | undefined): unknown {
  if (!s) return null;
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

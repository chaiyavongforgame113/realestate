import { NextResponse } from "next/server";
import { fetchNearbyAmenities, type AmenityCategory } from "@/lib/map/overpass";

const VALID: AmenityCategory[] = [
  "transit",
  "school",
  "hospital",
  "food",
  "shopping",
  "park",
];

export async function GET(req: Request) {
  const url = new URL(req.url);
  const lat = Number(url.searchParams.get("lat"));
  const lng = Number(url.searchParams.get("lng"));
  const radius = Number(url.searchParams.get("radius") ?? 1500);
  const categoriesParam = url.searchParams.get("categories");
  const categories: AmenityCategory[] = categoriesParam
    ? categoriesParam
        .split(",")
        .filter((c): c is AmenityCategory => VALID.includes(c as AmenityCategory))
    : VALID;

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "invalid_coords" }, { status: 400 });
  }

  try {
    const items = await fetchNearbyAmenities(lat, lng, categories, radius);
    return NextResponse.json(
      { items: items.slice(0, 120) },
      {
        headers: {
          // cache for an hour — POIs don't change that fast
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (err) {
    return NextResponse.json({ error: "upstream_failed", items: [] }, { status: 502 });
  }
}

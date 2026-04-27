/**
 * Thin wrapper around OpenStreetMap Overpass API to fetch nearby POIs.
 * Free, no API key required. Overpass endpoints have rate limits — do not
 * call from client loops. We keep the query tight (radius + key tags).
 */

export type AmenityCategory =
  | "transit"
  | "school"
  | "international_school"
  | "university"
  | "hospital"
  | "food"
  | "shopping"
  | "mall"
  | "park"
  | "office";

export type Amenity = {
  id: string;
  name: string;
  category: AmenityCategory;
  lat: number;
  lng: number;
  distanceMeters: number;
  tags: Record<string, string>;
};

/**
 * Overpass queries — keyed by *fetch* category. The downstream `classify()` may
 * remap a single result into a finer-grained AmenityCategory (e.g., "school"
 * with international tag → "international_school").
 */
type FetchCategory = "transit" | "school" | "hospital" | "food" | "shopping" | "park" | "office";

const FETCH_CATEGORIES: FetchCategory[] = [
  "transit", "school", "hospital", "food", "shopping", "park", "office",
];

const CATEGORY_QUERY: Record<FetchCategory, string> = {
  transit: `
    node["railway"="station"](around:RADIUS,LAT,LNG);
    node["railway"="subway_entrance"](around:RADIUS,LAT,LNG);
    node["public_transport"="station"](around:RADIUS,LAT,LNG);
    node["highway"="bus_stop"](around:RADIUS,LAT,LNG);
  `,
  school: `
    node["amenity"="school"](around:RADIUS,LAT,LNG);
    node["amenity"="university"](around:RADIUS,LAT,LNG);
    node["amenity"="college"](around:RADIUS,LAT,LNG);
    node["amenity"="kindergarten"](around:RADIUS,LAT,LNG);
  `,
  hospital: `
    node["amenity"="hospital"](around:RADIUS,LAT,LNG);
    node["amenity"="clinic"](around:RADIUS,LAT,LNG);
    node["amenity"="pharmacy"](around:RADIUS,LAT,LNG);
  `,
  food: `
    node["amenity"="restaurant"](around:RADIUS,LAT,LNG);
    node["amenity"="cafe"](around:RADIUS,LAT,LNG);
    node["amenity"="fast_food"](around:RADIUS,LAT,LNG);
    node["amenity"="bar"](around:RADIUS,LAT,LNG);
    node["amenity"="pub"](around:RADIUS,LAT,LNG);
    node["amenity"="nightclub"](around:RADIUS,LAT,LNG);
  `,
  shopping: `
    node["shop"="mall"](around:RADIUS,LAT,LNG);
    node["shop"="convenience"](around:RADIUS,LAT,LNG);
    node["shop"="supermarket"](around:RADIUS,LAT,LNG);
    node["shop"="department_store"](around:RADIUS,LAT,LNG);
  `,
  park: `
    node["leisure"="park"](around:RADIUS,LAT,LNG);
    node["leisure"="garden"](around:RADIUS,LAT,LNG);
  `,
  office: `
    node["office"](around:RADIUS,LAT,LNG);
    node["building"="office"](around:RADIUS,LAT,LNG);
  `,
};

function haversine(a: [number, number], b: [number, number]) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const la1 = toRad(a[0]);
  const la2 = toRad(b[0]);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Map a requested AmenityCategory (which may be finer-grained like "international_school")
 * back to the coarser FetchCategory used by the Overpass query bank.
 */
function toFetchCategory(c: AmenityCategory): FetchCategory {
  if (c === "international_school" || c === "university" || c === "school") return "school";
  if (c === "mall") return "shopping";
  return c as FetchCategory;
}

export async function fetchNearbyAmenities(
  lat: number,
  lng: number,
  categories: AmenityCategory[] = [
    "transit",
    "school",
    "hospital",
    "food",
    "shopping",
    "park",
    "office",
  ],
  radiusMeters: number = 1500,
  signal?: AbortSignal
): Promise<Amenity[]> {
  // Dedupe to FetchCategory set — avoids re-querying the same OSM tags
  const fetchCats = Array.from(new Set(categories.map(toFetchCategory)));
  const parts = fetchCats
    .map((c) =>
      CATEGORY_QUERY[c]
        .replaceAll("RADIUS", String(radiusMeters))
        .replaceAll("LAT", String(lat))
        .replaceAll("LNG", String(lng))
    )
    .join("\n");
  const body = `[out:json][timeout:25];(${parts});out body;`;
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "application/json",
      "User-Agent": "estate-web/1.0 (real-estate listing insights)",
    },
    body: `data=${encodeURIComponent(body)}`,
    signal,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error(`[overpass] HTTP ${res.status}: ${txt.slice(0, 200)}`);
    throw new Error(`overpass_failed_${res.status}`);
  }
  const json = (await res.json()) as {
    elements: Array<{
      id: number;
      lat: number;
      lon: number;
      tags?: Record<string, string>;
    }>;
  };
  return json.elements
    .filter((e) => e.tags?.name || e.tags?.["name:th"])
    .map((e) => {
      const cat = classify(e.tags ?? {});
      return {
        id: String(e.id),
        name: e.tags?.["name:th"] ?? e.tags?.name ?? "",
        category: cat,
        lat: e.lat,
        lng: e.lon,
        distanceMeters: haversine([lat, lng], [e.lat, e.lon]),
        tags: e.tags ?? {},
      } as Amenity;
    })
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
}

function classify(tags: Record<string, string>): AmenityCategory {
  if (tags.railway || tags["public_transport"] || tags.highway === "bus_stop")
    return "transit";

  const amenity = tags.amenity ?? "";
  // Education hierarchy
  if (amenity === "university" || amenity === "college") return "university";
  if (amenity === "school" || amenity === "kindergarten") {
    // Detect international school via name or explicit tag.
    const name = `${tags.name ?? ""} ${tags["name:en"] ?? ""}`.toLowerCase();
    if (
      tags["school:type"] === "international" ||
      tags.school === "international" ||
      /international|นานาชาติ/i.test(name)
    ) {
      return "international_school";
    }
    return "school";
  }

  if (["hospital", "clinic", "pharmacy"].includes(amenity)) return "hospital";

  if (["restaurant", "cafe", "fast_food", "bar", "pub", "nightclub"].includes(amenity)) {
    return "food";
  }

  const shop = tags.shop ?? "";
  if (shop === "mall" || shop === "department_store") return "mall";
  if (["convenience", "supermarket"].includes(shop)) return "shopping";

  if (["park", "garden"].includes(tags.leisure ?? "")) return "park";

  if (tags.office || tags.building === "office") return "office";

  return "food";
}

/**
 * Thin wrapper around OpenStreetMap Overpass API to fetch nearby POIs.
 * Free, no API key required. Overpass endpoints have rate limits — do not
 * call from client loops. We keep the query tight (radius + key tags).
 */

export type AmenityCategory =
  | "transit"
  | "school"
  | "hospital"
  | "food"
  | "shopping"
  | "park";

export type Amenity = {
  id: string;
  name: string;
  category: AmenityCategory;
  lat: number;
  lng: number;
  distanceMeters: number;
  tags: Record<string, string>;
};

const CATEGORY_QUERY: Record<AmenityCategory, string> = {
  // BTS, MRT, train, bus stations
  transit: `
    node["railway"="station"](around:RADIUS,LAT,LNG);
    node["railway"="subway_entrance"](around:RADIUS,LAT,LNG);
    node["public_transport"="station"](around:RADIUS,LAT,LNG);
    node["highway"="bus_stop"](around:RADIUS,LAT,LNG);
  `,
  school: `
    node["amenity"="school"](around:RADIUS,LAT,LNG);
    node["amenity"="university"](around:RADIUS,LAT,LNG);
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
  `,
  shopping: `
    node["shop"="mall"](around:RADIUS,LAT,LNG);
    node["shop"="convenience"](around:RADIUS,LAT,LNG);
    node["shop"="supermarket"](around:RADIUS,LAT,LNG);
  `,
  park: `
    node["leisure"="park"](around:RADIUS,LAT,LNG);
    node["leisure"="garden"](around:RADIUS,LAT,LNG);
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
  ],
  radiusMeters: number = 1500,
  signal?: AbortSignal
): Promise<Amenity[]> {
  const parts = categories
    .map((c) =>
      CATEGORY_QUERY[c]
        .replaceAll("RADIUS", String(radiusMeters))
        .replaceAll("LAT", String(lat))
        .replaceAll("LNG", String(lng))
    )
    .join("\n");
  const body = `[out:json][timeout:20];(${parts});out body;`;
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body,
    signal,
  });
  if (!res.ok) throw new Error("overpass_failed");
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
  if (["school", "university", "kindergarten"].includes(tags.amenity ?? ""))
    return "school";
  if (["hospital", "clinic", "pharmacy"].includes(tags.amenity ?? "")) return "hospital";
  if (["restaurant", "cafe", "fast_food"].includes(tags.amenity ?? "")) return "food";
  if (["mall", "convenience", "supermarket"].includes(tags.shop ?? "")) return "shopping";
  if (["park", "garden"].includes(tags.leisure ?? "")) return "park";
  return "food";
}

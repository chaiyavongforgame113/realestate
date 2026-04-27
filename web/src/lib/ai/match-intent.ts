import type { ParsedIntent, AmenityToken, NeighborhoodVibe, POICategoryToken } from "./types";
import type { Listing } from "@prisma/client";

/**
 * Map Thai/English display labels stored on Listing.amenities to canonical AmenityToken.
 * Listings created via the agent form often contain free-form labels — this normalizer
 * lets matching work without forcing a backfill of all existing rows.
 */
const AMENITY_NORMALIZER: { test: RegExp; token: AmenityToken }[] = [
  { test: /สระว่ายน้ำ|สระ\b|swimming|^pool$/i, token: "pool" },
  { test: /ฟิตเนส|ยิม|fitness|^gym$/i, token: "gym" },
  { test: /ซาวน่า|sauna/i, token: "sauna" },
  { test: /สวน(?!อาหาร)|garden/i, token: "garden" },
  { test: /สนามเด็กเล่น|playground/i, token: "playground" },
  { test: /kids?\s*zone|ห้องเด็กเล่น|kids?\s*room/i, token: "kids_room" },
  { test: /co.?working/i, token: "co_working" },
  { test: /library|ห้องสมุด/i, token: "library" },
  { test: /ที่จอดรถ(?!ส่วนตัว)|^parking$/i, token: "parking" },
  { test: /ev|ที่ชาร์จรถ/i, token: "ev_charger" },
  { test: /รักษาความปลอดภัย\s*24|รปภ\.?\s*24|security\s*24|24\s*ชม\.?/i, token: "security_24h" },
  { test: /cctv|กล้องวงจรปิด/i, token: "cctv" },
  { test: /key\s*card|คีย์การ์ด/i, token: "key_card" },
  { test: /ลิฟต์|elevator/i, token: "elevator" },
  { test: /pet|เลี้ยงสัตว์/i, token: "pet_friendly" },
  { test: /concierge|คอนเซียร์/i, token: "concierge" },
  { test: /shuttle|รถรับส่ง/i, token: "shuttle" },
  { test: /laundry|ซักรีด/i, token: "laundry" },
  { test: /rooftop|รูฟท็อป/i, token: "rooftop" },
  { test: /วิวแม่น้ำ|river\s*view/i, token: "river_view" },
  { test: /วิวเมือง|city\s*view/i, token: "city_view" },
  { test: /วิวสวน|park\s*view/i, token: "park_view" },
];

export function normalizeAmenityList(raw: string[]): AmenityToken[] {
  const out = new Set<AmenityToken>();
  for (const item of raw) {
    // Already canonical?
    const directMatch = AMENITY_NORMALIZER.find((n) => n.token === item.toLowerCase());
    if (directMatch) {
      out.add(directMatch.token);
      continue;
    }
    for (const n of AMENITY_NORMALIZER) {
      if (n.test.test(item)) out.add(n.token);
    }
  }
  return Array.from(out);
}

export type MatchBreakdown = {
  score: number;
  match: boolean;
  reasons: string[];      // positive contributions ("ราคาพอดีงบ")
  concerns: string[];     // negative contributions ("ขาดสระ")
  blockers: string[];     // hard rejections — empty if match=true
};

/**
 * Detailed match breakdown — for explainer / transparency layers.
 * Returns score 0-100, plus per-dimension reasons/concerns.
 */
export function explainMatch(listing: Listing, intent: Partial<ParsedIntent>): MatchBreakdown {
  let score = 100;
  const reasons: string[] = [];
  const concerns: string[] = [];
  const blockers: string[] = [];

  const listingAmenities = normalizeAmenityList(parseJsonArray(listing.amenities));
  const listingLifestyle = parseJsonArray(listing.lifestyleTags);
  const listingVibes = parseJsonArray((listing as Listing & { vibeTags?: string | null }).vibeTags ?? "[]") as NeighborhoodVibe[];
  const listingPoiCounts = parseJsonObject((listing as Listing & { poiCounts?: string | null }).poiCounts ?? "{}");
  const walkScore = (listing as Listing & { walkScore?: number | null }).walkScore ?? null;
  const transitScore = (listing as Listing & { transitScore?: number | null }).transitScore ?? null;

  // ── Hard filters ────────────────────────────────────────────────────
  if (intent.search_goal && !intent.search_goal_flexible) {
    const goal = intent.search_goal === "buy" ? "sale" : "rent";
    if (listing.listingType !== goal) blockers.push(`ประเภทประกาศ (${listing.listingType}) ไม่ตรง ${goal}`);
  }
  // Flexible goal — apply per-track budget caps as soft constraints
  if (intent.search_goal_flexible) {
    if (listing.listingType === "sale" && intent.budget_max_buy && listing.price > intent.budget_max_buy * 1.1) {
      blockers.push(`ราคาขาย ${listing.price} เกินงบซื้อ`);
    }
    if (listing.listingType === "rent" && intent.budget_max_rent && listing.price > intent.budget_max_rent * 1.1) {
      blockers.push(`ค่าเช่า ${listing.price} เกินงบเช่า`);
    }
  }

  if (intent.property_types?.length && !intent.property_types.includes(listing.propertyType)) {
    blockers.push(`ประเภททรัพย์ ${listing.propertyType} ไม่อยู่ในตัวเลือก`);
  }

  // Required amenities — missing any → blocker
  if (intent.required_amenities?.length) {
    const missing = intent.required_amenities.filter((a) => !listingAmenities.includes(a));
    if (missing.length > 0) {
      blockers.push(`ขาดสิ่งที่ต้องมี: ${missing.join(", ")}`);
    } else {
      reasons.push(`มีครบ ${intent.required_amenities.length} อย่างที่ต้องการ`);
    }
  }

  // ── Budget ──────────────────────────────────────────────────────────
  if (intent.budget_max && listing.price > intent.budget_max) {
    if (listing.price > intent.budget_max * 1.1) {
      blockers.push(`ราคาเกินงบ > 10%`);
    } else {
      score -= 20;
      concerns.push(`ราคาเกินงบเล็กน้อย`);
    }
  } else if (intent.budget_max) {
    const ratio = listing.price / intent.budget_max;
    if (ratio < 0.7) reasons.push("ราคาต่ำกว่างบสบาย ๆ");
    else if (ratio < 0.95) reasons.push("ราคาพอดีงบ");
  }

  if (intent.budget_min && listing.price < intent.budget_min) {
    score -= 15;
    concerns.push("ราคาต่ำกว่าช่วงที่กำหนด");
  }

  // ── Bedrooms / bathrooms / area ─────────────────────────────────────
  if (intent.bedrooms !== null && intent.bedrooms !== undefined) {
    if (intent.bedrooms_flexible) {
      if (listing.bedrooms < intent.bedrooms) {
        score -= 20;
        concerns.push(`${listing.bedrooms} ห้องนอน (น้อยกว่าที่ต้องการ)`);
      } else {
        reasons.push(`${listing.bedrooms} ห้องนอน`);
      }
    } else {
      if (listing.bedrooms !== intent.bedrooms) {
        score -= 25;
        concerns.push(`${listing.bedrooms} ห้องนอน (ไม่ตรง ${intent.bedrooms})`);
      } else {
        reasons.push(`${intent.bedrooms} ห้องนอนตรงตามต้องการ`);
      }
    }
  }

  if (intent.bathrooms !== null && intent.bathrooms !== undefined && listing.bathrooms < intent.bathrooms) {
    score -= 8;
    concerns.push(`ห้องน้ำ ${listing.bathrooms} (ต้องการ ${intent.bathrooms})`);
  }

  if (intent.usable_area_min && listing.usableArea < intent.usable_area_min) {
    const deficit = (intent.usable_area_min - listing.usableArea) / intent.usable_area_min;
    if (deficit > 0.2) {
      score -= 18;
      concerns.push(`พื้นที่ ${listing.usableArea} ตร.ม. (ต้องการอย่างน้อย ${intent.usable_area_min})`);
    } else {
      score -= 8;
    }
  }

  // ── Location: stations / districts ──────────────────────────────────
  if (intent.preferred_stations?.length) {
    const stationsText = [listing.nearestBts, listing.nearestMrt, listing.nearestArl].filter(Boolean).join(" ");
    const matched = intent.preferred_stations.find((s) => stationsText.includes(s));
    if (matched) reasons.push(`ใกล้ ${matched}`);
    else {
      score -= 15;
      concerns.push("ไม่ใกล้สถานีที่ระบุ");
    }
  }

  if (intent.preferred_districts?.length) {
    if (intent.preferred_districts.includes(listing.district)) {
      reasons.push(`อยู่ใน${listing.district}`);
    } else {
      score -= 10;
      concerns.push(`ย่าน${listing.district} (ไม่อยู่ในที่ระบุ)`);
    }
  }

  // ── Transit walking distance ────────────────────────────────────────
  if (intent.max_distance_to_transit_m) {
    const distances = [
      listing.nearestBtsDistance,
      listing.nearestMrtDistance,
      listing.nearestArlDistance,
    ].filter((d): d is number => typeof d === "number");
    const closest = distances.length ? Math.min(...distances) : null;
    if (closest === null) {
      score -= 12;
      concerns.push("ไม่มีข้อมูลระยะถึงสถานี");
    } else if (closest > intent.max_distance_to_transit_m * 2) {
      blockers.push(`ห่างสถานี ${closest}ม. (ต้องการ ≤${intent.max_distance_to_transit_m}ม.)`);
    } else if (closest > intent.max_distance_to_transit_m) {
      score -= 12;
      concerns.push(`ห่างสถานี ${closest}ม.`);
    } else {
      reasons.push(`เดินถึงสถานี ${closest}ม.`);
    }
  }

  // ── Nice-to-have amenities (bonus, capped) ──────────────────────────
  if (intent.nice_to_have_amenities?.length) {
    const hits = intent.nice_to_have_amenities.filter((a) => listingAmenities.includes(a));
    if (hits.length > 0) {
      const bonus = Math.min(hits.length * 3, 12);
      score = Math.min(100, score + bonus);
      reasons.push(`มี ${hits.slice(0, 3).join("/")}`);
    }
  }

  // ── Furnishing ──────────────────────────────────────────────────────
  if (intent.furnishing_preference && listing.furnishing !== intent.furnishing_preference) {
    score -= 6;
    concerns.push("ระดับเฟอร์ฯ ไม่ตรง");
  }

  // ── Floor preference ────────────────────────────────────────────────
  if (intent.floor_preference === "high" && listing.floor != null) {
    if (listing.floor < 5) {
      score -= 8;
      concerns.push(`ชั้น ${listing.floor} (ขอชั้นสูง)`);
    } else if (listing.floor >= 15) {
      reasons.push(`ชั้นสูง (${listing.floor})`);
    }
  } else if (intent.floor_preference === "low" && listing.floor != null && listing.floor >= 10) {
    score -= 8;
    concerns.push(`ชั้น ${listing.floor} (ขอชั้นล่าง)`);
  }

  // ── Neighborhood vibe (if listing has cached vibeTags) ──────────────
  if (intent.neighborhood_vibe?.length && listingVibes.length) {
    const hits = intent.neighborhood_vibe.filter((v) => listingVibes.includes(v));
    if (hits.length > 0) {
      score = Math.min(100, score + hits.length * 4);
      reasons.push(`บรรยากาศตรง: ${hits.join("/")}`);
    } else {
      score -= 6;
      concerns.push("บรรยากาศย่านไม่ค่อยตรง");
    }
  }

  // ── Nearby POI demand vs cached counts ──────────────────────────────
  if (intent.nearby_poi?.length && Object.keys(listingPoiCounts).length) {
    const matched = intent.nearby_poi.filter((p: POICategoryToken) => {
      const buckets = poiBuckets(p);
      return buckets.some((b) => (listingPoiCounts[b] ?? 0) > 0);
    });
    if (matched.length === intent.nearby_poi.length) {
      score = Math.min(100, score + 4);
      reasons.push("มี POI ที่ต้องการครบ");
    } else if (matched.length === 0) {
      score -= 10;
      concerns.push("ขาด POI ที่ต้องการ");
    } else {
      // Partial — small penalty proportional to gap
      const missCount = intent.nearby_poi.length - matched.length;
      score -= missCount * 4;
    }
  }

  // ── Walk / transit score nudges ─────────────────────────────────────
  if (intent.neighborhood_vibe?.includes("walkable") && walkScore !== null) {
    if (walkScore >= 80) {
      score = Math.min(100, score + 3);
      reasons.push(`Walk Score ${walkScore}`);
    } else if (walkScore < 60) {
      score -= 5;
      concerns.push(`Walk Score ${walkScore} ต่ำ`);
    }
  }
  if (intent.transit_preference?.length && transitScore !== null && transitScore < 50) {
    score -= 4;
    concerns.push(`Transit Score ${transitScore} ต่ำ`);
  }

  // ── Building age ─────────────────────────────────────────────────────
  if (intent.building_age_max_years !== null && intent.building_age_max_years !== undefined) {
    const age = (listing as Listing & { buildingAgeYears?: number | null }).buildingAgeYears ?? null;
    if (age === null) {
      // Unknown age — don't penalize hard, but tiny nudge to prefer listings that have data
      score -= 2;
    } else if (age > intent.building_age_max_years) {
      // Hard penalty when over by >50% of allowance
      const over = age - intent.building_age_max_years;
      if (over >= 5) {
        score -= 18;
        concerns.push(`อาคารอายุ ${age} ปี (ขอไม่เกิน ${intent.building_age_max_years})`);
      } else {
        score -= 8;
        concerns.push(`อาคารอายุ ${age} ปี`);
      }
    } else {
      reasons.push(`อาคาร${age === 0 ? "ใหม่ป้ายแดง" : `อายุ ${age} ปี`}`);
    }
  }

  // ── View preference ─────────────────────────────────────────────────
  if (intent.view_preference?.length) {
    const listingView = (listing as Listing & { viewType?: string | null }).viewType ?? null;
    const wantsAny = intent.view_preference.includes("any");
    if (listingView && !wantsAny) {
      if (intent.view_preference.includes(listingView as never)) {
        score = Math.min(100, score + 4);
        reasons.push(`วิว ${listingView}`);
      } else if (listingView !== "none") {
        score -= 3;
        concerns.push(`วิว ${listingView} (ขอ ${intent.view_preference.join("/")})`);
      } else {
        score -= 5;
        concerns.push("ไม่มีวิวพิเศษ");
      }
    }
  }

  // ── Lifestyle tags fallback (legacy) ────────────────────────────────
  if (intent.lifestyle_tags?.length && listingLifestyle.length) {
    const hits = intent.lifestyle_tags.filter((t) => listingLifestyle.includes(t));
    if (hits.length > 0) score = Math.min(100, score + 2);
  }

  // ── Description keyword matching (semantic light) ────────────────────
  // Scan listing.description + title for raw_keywords from intent — when user
  // says "เงียบสงบ" or "ห้องสว่าง", listings that mention these in their copy
  // should rank higher. Capped at +10 to avoid drowning out hard signals.
  if (intent.raw_keywords?.length) {
    const haystack = `${listing.title} ${listing.description}`.toLowerCase();
    let hits = 0;
    const matched: string[] = [];
    for (const kw of intent.raw_keywords) {
      const tokens = expandSynonyms(kw);
      if (tokens.some((t) => haystack.includes(t.toLowerCase()))) {
        hits += 1;
        matched.push(kw);
      }
    }
    if (hits > 0) {
      const bonus = Math.min(hits * 2, 10);
      score = Math.min(100, score + bonus);
      reasons.push(`รายละเอียดตรง: ${matched.slice(0, 3).join("/")}`);
    }
  }

  if (blockers.length > 0) {
    return { score: 0, match: false, reasons, concerns, blockers };
  }
  return {
    score: Math.max(0, Math.round(score)),
    match: score >= 60,
    reasons,
    concerns,
    blockers: [],
  };
}

/**
 * Backwards-compatible thin wrapper used by saved-search notification flow.
 */
export function scoreListingAgainstIntent(
  listing: Listing,
  intent: Partial<ParsedIntent>
): { score: number; match: boolean } {
  const out = explainMatch(listing, intent);
  return { score: out.score, match: out.match };
}

function parseJsonArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

/**
 * Expand a raw keyword to common synonyms for fuzzier description matching.
 * Listings rarely use the exact word a user typed — "เงียบ" should also catch
 * "สงบ", "เงียบสงบ"; "เดินทางสะดวก" should catch "การเดินทาง".
 */
const SYNONYM_MAP: { test: RegExp; expand: string[] }[] = [
  { test: /เงียบ|สงบ/i, expand: ["เงียบ", "สงบ", "เงียบสงบ", "ผ่อนคลาย"] },
  { test: /เดินสะดวก|เดินทางสะดวก/i, expand: ["เดินสะดวก", "เดินทางสะดวก", "การเดินทาง", "เดินถึง"] },
  { test: /ใจกลางเมือง|cbd/i, expand: ["ใจกลางเมือง", "กลางเมือง", "central", "CBD", "ทำเลทอง"] },
  { test: /ห้องสว่าง|รับแสง/i, expand: ["ห้องสว่าง", "สว่าง", "รับแสง", "โปร่ง", "โปร่งสว่าง", "ลมเย็น"] },
  { test: /วิวสวย|วิวดี/i, expand: ["วิวสวย", "วิวดี", "วิวเปิด", "วิวเมือง", "วิวแม่น้ำ", "วิวพาโนรามา"] },
  { test: /ครอบครัว/i, expand: ["ครอบครัว", "family", "เด็ก", "พื้นที่ส่วนกลาง"] },
  { test: /ลงทุน|yield/i, expand: ["ลงทุน", "investment", "ปล่อยเช่า", "yield", "ผลตอบแทน"] },
  { test: /ใกล้ห้าง|shopping/i, expand: ["ห้าง", "shopping", "เซ็นทรัล", "iconsiam", "the mall", "เมกา"] },
  { test: /ใกล้รพ|โรงพยาบาล/i, expand: ["โรงพยาบาล", "รพ", "hospital", "คลินิก"] },
  { test: /ใกล้โรงเรียน/i, expand: ["โรงเรียน", "สถานศึกษา", "นานาชาติ", "international school"] },
  { test: /ปลอดภัย/i, expand: ["ปลอดภัย", "รปภ", "security", "24 ชม"] },
];

/**
 * Resolve a POI category token from intent into the buckets that may satisfy it
 * in the cached `poiCounts` JSON. Handles the school/university/international family.
 */
function poiBuckets(token: POICategoryToken): string[] {
  switch (token) {
    case "international_school":
      return ["international_school"];
    case "university":
      return ["university"];
    case "school":
      return ["school", "international_school"];
    case "shopping":
      return ["shopping", "mall"];
    case "office_district":
      return ["office"];
    default:
      return [token];
  }
}

function expandSynonyms(keyword: string): string[] {
  for (const m of SYNONYM_MAP) {
    if (m.test.test(keyword)) return [keyword, ...m.expand];
  }
  return [keyword];
}

function parseJsonObject(raw: string | null | undefined): Record<string, number> {
  if (!raw) return {};
  try {
    const v = JSON.parse(raw);
    return v && typeof v === "object" && !Array.isArray(v) ? v : {};
  } catch {
    return {};
  }
}

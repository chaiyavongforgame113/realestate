/**
 * AI types for property search intent analysis.
 * Mirrors the detailed ParsedIntent schema from the spec.
 */

export type SearchGoal = "buy" | "rent";
export type PropertyType = "condo" | "house" | "townhouse" | "land" | "commercial";
export type TransitLine = "BTS" | "MRT" | "ARL";
export type MoveInUrgency = "immediate" | "within_month" | "flexible";
export type PurposeContext = "investment" | "own_use" | "rental_income";
export type MissingField = "search_goal" | "budget" | "location";

/** Canonical amenity tokens. Listings store the same set in Listing.amenities JSON. */
export type AmenityToken =
  | "pool"
  | "gym"
  | "sauna"
  | "garden"
  | "playground"
  | "kids_room"
  | "co_working"
  | "library"
  | "parking"
  | "ev_charger"
  | "security_24h"
  | "cctv"
  | "key_card"
  | "elevator"
  | "pet_friendly"
  | "concierge"
  | "shuttle"
  | "laundry"
  | "rooftop"
  | "river_view"
  | "city_view"
  | "park_view";

/** Vibe categories — used for both intent preference and listing classification. */
export type NeighborhoodVibe =
  | "central"
  | "quiet"
  | "nightlife"
  | "family"
  | "investment_hot"
  | "green"
  | "walkable"
  | "shopping_district"
  | "education_hub"
  | "medical_hub";

/** POI category demand from intent. Mirrors AmenityCategory in lib/map/overpass.ts. */
export type POICategoryToken =
  | "transit"
  | "school"
  | "hospital"
  | "food"
  | "shopping"
  | "park"
  | "international_school"
  | "university"
  | "office_district";

export type ViewPreference = "city" | "river" | "park" | "garden" | "any";
export type FloorPreference = "high" | "low" | "any";
export type InvestmentSignal = "yield_focused" | "capital_gain" | "airbnb_friendly" | "long_term_hold";

export interface ParsedIntent {
  search_goal: SearchGoal | null;
  budget_min: number | null;
  budget_max: number | null;
  location_context: string | null;

  property_types: PropertyType[];
  bedrooms: number | null;
  bedrooms_flexible: boolean;
  bathrooms: number | null;
  usable_area_min: number | null;

  transit_preference: TransitLine[];
  preferred_stations: string[];
  preferred_districts: string[];
  furnishing_preference: "fully_furnished" | "partially_furnished" | "unfurnished" | null;
  lifestyle_tags: string[];
  move_in_urgency: MoveInUrgency | null;

  purpose_context: PurposeContext | null;

  // ── Phase 1 enrichments ──────────────────────────────────────────────
  /** Hard requirements — listing missing any of these is rejected. */
  required_amenities: AmenityToken[];
  /** Bonus only — present these are nice-to-have, absence does not block. */
  nice_to_have_amenities: AmenityToken[];
  /** Walking distance ceiling to nearest transit station, in metres. */
  max_distance_to_transit_m: number | null;
  /** Vibe / neighborhood feel preferences (e.g., "quiet", "nightlife"). */
  neighborhood_vibe: NeighborhoodVibe[];
  /** POI categories the user wants nearby (e.g., "international_school"). */
  nearby_poi: POICategoryToken[];
  view_preference: ViewPreference[];
  floor_preference: FloorPreference | null;
  /** Cap on building age (years). 0 = brand-new only, 5 = ≤5 years. */
  building_age_max_years: number | null;
  investment_signals: InvestmentSignal[];
  /** Free-form text the user said about purpose / context — kept for semantic step. */
  raw_keywords: string[];

  // ── Conversational agent fields ─────────────────────────────────────
  /** True when user said "either" / "doesn't matter" — search should include both buy and rent. */
  search_goal_flexible: boolean;
  /** Optional dual-track budgets when goal is flexible. */
  budget_max_buy: number | null;
  budget_max_rent: number | null;
  /** Phase tag for UI hints (greeting → ready). */
  conversation_phase: "greeting" | "discovering" | "narrowing" | "ready" | "post_results";

  confidence_score: number;
  missing_required_fields: MissingField[];
  interpreted_as: string;
}

export interface ClarificationResult {
  question: string;
  quick_replies: string[];
  field_asking_about: MissingField;
}

export interface ListingAnalysis {
  id: string;
  fit_score: number;
  pros: string[];
  cons: string[];
  best_for: string;
}

export interface CompareResult {
  best_overall_id: string;
  best_for_budget_id: string;
  best_for_commute_id: string | null;
  best_for_space_id: string;
  summary: string;
  listings_analysis: ListingAnalysis[];
}

export function createEmptyIntent(): ParsedIntent {
  return {
    search_goal: null,
    budget_min: null,
    budget_max: null,
    location_context: null,
    property_types: [],
    bedrooms: null,
    bedrooms_flexible: false,
    bathrooms: null,
    usable_area_min: null,
    transit_preference: [],
    preferred_stations: [],
    preferred_districts: [],
    furnishing_preference: null,
    lifestyle_tags: [],
    move_in_urgency: null,
    purpose_context: null,
    required_amenities: [],
    nice_to_have_amenities: [],
    max_distance_to_transit_m: null,
    neighborhood_vibe: [],
    nearby_poi: [],
    view_preference: [],
    floor_preference: null,
    building_age_max_years: null,
    investment_signals: [],
    raw_keywords: [],
    search_goal_flexible: false,
    budget_max_buy: null,
    budget_max_rent: null,
    conversation_phase: "greeting",
    confidence_score: 0,
    missing_required_fields: ["search_goal", "budget", "location"],
    interpreted_as: "",
  };
}

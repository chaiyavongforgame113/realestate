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
    confidence_score: 0,
    missing_required_fields: ["search_goal", "budget", "location"],
    interpreted_as: "",
  };
}

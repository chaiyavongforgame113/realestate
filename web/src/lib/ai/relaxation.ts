/**
 * Progressive constraint relaxation for AI search.
 *
 * When a strict intent yields zero matches, we drop the most restrictive
 * constraint at a time and retry. The order is calibrated to give up the
 * least-important constraints first.
 *
 * Returns the first non-empty scored result with a label describing what was
 * relaxed, so the UI can say "ไม่พบที่ตรงเป๊ะ — แต่เปลี่ยน X แล้วเจอเหล่านี้".
 */

import type { ParsedIntent } from "./types";
import type { Listing } from "@prisma/client";
import type { MatchBreakdown } from "./match-intent";
import { explainMatch } from "./match-intent";

export type Scored<T> = { raw: T; match: MatchBreakdown };

type ListingLike = Listing;

export const RELAXATION_STEPS: { key: string; label: string; apply: (i: ParsedIntent) => ParsedIntent }[] = [
  {
    key: "drop_required_amenities",
    label: "ไม่ใช้สิ่งอำนวยความสะดวกที่ต้องมีเป็นเงื่อนไขขาดไม่ได้",
    apply: (i) => ({
      ...i,
      nice_to_have_amenities: Array.from(new Set([...i.nice_to_have_amenities, ...i.required_amenities])),
      required_amenities: [],
    }),
  },
  {
    key: "expand_budget_10",
    label: "ขยายงบเพิ่มอีก 10%",
    apply: (i) => ({
      ...i,
      budget_max: i.budget_max ? Math.round(i.budget_max * 1.1) : i.budget_max,
    }),
  },
  {
    key: "drop_max_distance",
    label: "ไม่จำกัดระยะถึงสถานี",
    apply: (i) => ({ ...i, max_distance_to_transit_m: null }),
  },
  {
    key: "drop_floor",
    label: "ไม่จำกัดชั้น",
    apply: (i) => ({ ...i, floor_preference: null }),
  },
  {
    key: "drop_view",
    label: "ไม่จำกัดวิว",
    apply: (i) => ({ ...i, view_preference: [] }),
  },
  {
    key: "drop_building_age",
    label: "ไม่จำกัดอายุอาคาร",
    apply: (i) => ({ ...i, building_age_max_years: null }),
  },
  {
    key: "drop_districts",
    label: "ขยายย่าน",
    apply: (i) => ({ ...i, preferred_districts: [] }),
  },
  {
    key: "drop_stations",
    label: "ขยายสถานีรถไฟฟ้า",
    apply: (i) => ({ ...i, preferred_stations: [], transit_preference: [] }),
  },
  {
    key: "expand_budget_25",
    label: "ขยายงบเพิ่มอีก 25%",
    apply: (i) => ({
      ...i,
      budget_max: i.budget_max ? Math.round(i.budget_max * 1.25) : i.budget_max,
    }),
  },
  {
    key: "drop_bedrooms",
    label: "ไม่จำกัดจำนวนห้องนอน",
    apply: (i) => ({ ...i, bedrooms: null, bedrooms_flexible: false }),
  },
  {
    key: "expand_budget_50",
    label: "ขยายงบเพิ่มอีก 50%",
    apply: (i) => ({
      ...i,
      budget_max: i.budget_max ? Math.round(i.budget_max * 1.5) : i.budget_max,
    }),
  },
];

/**
 * Try each relaxation in turn against the same listing pool. Stop at the first
 * step that yields any non-blocked listing. Returns null if none of them work.
 *
 * Generic over T (which extends Listing) so callers passing rich include shapes
 * (e.g., Listing & { images, agent }) keep their typed extras through the result.
 */
export function relaxSearch<T extends ListingLike>(
  intent: ParsedIntent,
  listings: T[]
): { scored: Scored<T>[]; relaxed: { key: string; label: string }[] } | null {
  let working = intent;
  const applied: { key: string; label: string }[] = [];

  for (const step of RELAXATION_STEPS) {
    const next = step.apply(working);
    // Skip this step if it had no observable effect (constraint wasn't there)
    if (JSON.stringify(next) === JSON.stringify(working)) continue;
    working = next;
    applied.push({ key: step.key, label: step.label });

    const scored = listings
      .map((l) => ({ raw: l, match: explainMatch(l, working) }))
      .filter((x) => x.match.blockers.length === 0)
      .sort((a, b) => b.match.score - a.match.score);

    if (scored.length > 0) {
      return { scored, relaxed: applied };
    }
  }

  return null;
}

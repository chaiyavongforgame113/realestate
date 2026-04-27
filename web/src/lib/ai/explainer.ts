import { geminiText } from "./client";
import type { ParsedIntent } from "./types";
import type { ListingDTO } from "@/lib/listings/transform";
import { explainMatch } from "./match-intent";
import type { Listing } from "@prisma/client";

/** Short summary about the result set. */
export async function generateSearchExplanation(
  intent: ParsedIntent,
  resultCount: number
): Promise<string> {
  const prompt = `ผู้ใช้ค้นหา: ${intent.interpreted_as}
พบผลลัพธ์: ${resultCount} รายการ
สร้างประโยค 1 ประโยค ภาษาไทย อธิบายสั้น ๆ ว่าค้นอะไร
ตัวอย่าง: "พบ 12 คอนโดสำหรับซื้อ ราคาไม่เกิน 3 ล้าน ใกล้ BTS ในกรุงเทพ"
Return plain text`;

  const out = await geminiText(prompt);
  return out ?? `${intent.interpreted_as} — พบ ${resultCount} รายการ`;
}

/**
 * Per-listing explanation of why it matches the user intent.
 * Combines deterministic match breakdown + Gemini natural-language polish.
 * Falls back to deterministic reason if Gemini unavailable — no extra API call wasted.
 */
export async function generateListingMatchReason(
  intent: ParsedIntent,
  listing: ListingDTO,
  rawListing?: Listing
): Promise<string> {
  // Compute structured breakdown first — cheap, deterministic
  const breakdown = rawListing
    ? explainMatch(rawListing, intent)
    : { reasons: [], concerns: [], score: 0, match: false, blockers: [] };

  const reasonsLine = breakdown.reasons.slice(0, 4).join(" · ");
  const concernsLine = breakdown.concerns.slice(0, 2).join(" · ");
  const descSnippet = listing.description.slice(0, 220);

  const prompt = `ความต้องการ: ${intent.interpreted_as}
${intent.required_amenities.length ? `ต้องมี: ${intent.required_amenities.join(", ")}` : ""}
${intent.nice_to_have_amenities.length ? `อยากได้: ${intent.nice_to_have_amenities.join(", ")}` : ""}
${intent.neighborhood_vibe.length ? `บรรยากาศ: ${intent.neighborhood_vibe.join(", ")}` : ""}
${intent.raw_keywords.length ? `คีย์เวิร์ดอื่น: ${intent.raw_keywords.join(", ")}` : ""}

Listing: ราคา ${listing.price.toLocaleString()} ${listing.priceUnit === "per_month" ? "/เดือน" : ""}, ${listing.bedrooms} ห้องนอน, ${listing.usableArea} ตร.ม., ย่าน ${listing.district}${listing.nearestBts ? `, BTS ${listing.nearestBts} ${listing.nearestBtsDistance}ม.` : ""}${listing.nearestMrt ? `, MRT ${listing.nearestMrt} ${listing.nearestMrtDistance}ม.` : ""}
สิ่งอำนวยความสะดวก: ${listing.amenities.join(", ") || "—"}
รายละเอียด: ${descSnippet}

จุดบวก (จากการคำนวณ): ${reasonsLine || "—"}
จุดที่ต้องระวัง: ${concernsLine || "—"}

อธิบาย 1-2 ประโยคสั้น ภาษาไทย ว่าทำไม listing นี้ตรง/ไม่ตรงกับผู้ใช้ ใช้ข้อมูลจริงจากด้านบน หากมีคีย์เวิร์ดในรายละเอียดที่สอดคล้องกับความต้องการ ให้กล่าวถึง
Return plain text`;

  const out = await geminiText(prompt);
  if (out) return out;
  return buildMockReason(intent, listing, breakdown.reasons, breakdown.concerns);
}

function buildMockReason(
  intent: ParsedIntent,
  listing: ListingDTO,
  reasons: string[],
  concerns: string[]
): string {
  const acc: string[] = [];
  if (reasons.length) acc.push(...reasons.slice(0, 3));
  else {
    if (intent.budget_max && listing.price <= intent.budget_max) acc.push("ราคาพอดีงบ");
    if (intent.preferred_stations.length && listing.nearestBts) {
      acc.push(`ใกล้ ${listing.nearestBts} ${listing.nearestBtsDistance ?? "?"}ม.`);
    }
  }
  const tail = concerns.length ? ` · แต่${concerns[0]}` : "";
  return acc.length ? acc.join(" · ") + tail : "เข้าเกณฑ์ที่คุณระบุ";
}

import { geminiText } from "./client";
import type { ParsedIntent } from "./types";
import type { ListingDTO } from "@/lib/listings/transform";

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

/** Per-listing explanation of why it matches the user intent. */
export async function generateListingMatchReason(
  intent: ParsedIntent,
  listing: ListingDTO
): Promise<string> {
  const prompt = `ความต้องการ: ${intent.interpreted_as}
Listing: ราคา ${listing.price.toLocaleString()} ${listing.priceUnit === "per_month" ? "/เดือน" : ""}, ${listing.bedrooms} ห้องนอน, ${listing.usableArea} ตร.ม., ย่าน ${listing.district}${listing.nearestBts ? `, ใกล้ BTS ${listing.nearestBts} (${listing.nearestBtsDistance}ม.)` : ""}

อธิบาย 1 ประโยคสั้น ๆ ภาษาไทย ว่าทำไม listing นี้ตรงกับผู้ใช้
Return plain text`;

  const out = await geminiText(prompt);
  if (out) return out;
  return buildMockReason(intent, listing);
}

function buildMockReason(intent: ParsedIntent, listing: ListingDTO): string {
  const reasons: string[] = [];
  if (intent.budget_max && listing.price <= intent.budget_max) {
    const diff = intent.budget_max - listing.price;
    if (diff > intent.budget_max * 0.1) reasons.push("ราคาอยู่ในงบสบาย ๆ");
    else reasons.push("ราคาพอดีงบ");
  }
  if (intent.preferred_stations.length && listing.nearestBts) {
    reasons.push(`ใกล้ BTS ${listing.nearestBts} ${listing.nearestBtsDistance}ม.`);
  } else if (listing.nearestBtsDistance && listing.nearestBtsDistance < 300) {
    reasons.push(`เดินถึง BTS เพียง ${listing.nearestBtsDistance}ม.`);
  }
  if (intent.bedrooms && listing.bedrooms === intent.bedrooms) {
    reasons.push(`${listing.bedrooms} ห้องนอนตรงตามต้องการ`);
  }
  if (reasons.length === 0) return "เข้าเกณฑ์ที่คุณระบุ";
  return reasons.slice(0, 2).join(" · ");
}

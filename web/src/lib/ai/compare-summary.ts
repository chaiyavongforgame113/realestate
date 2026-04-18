import { geminiJSON } from "./client";
import type { CompareResult, ListingAnalysis, ParsedIntent } from "./types";
import type { ListingDTO } from "@/lib/listings/transform";

export async function generateCompareSummary(
  listings: ListingDTO[],
  userIntent: ParsedIntent | null
): Promise<CompareResult> {
  const intentContext = userIntent
    ? `ความต้องการของผู้ใช้: ${userIntent.interpreted_as}\nงบประมาณ: ${userIntent.budget_max ? `ไม่เกิน ${userIntent.budget_max.toLocaleString()} บาท` : "ไม่ระบุ"}`
    : "ไม่มีข้อมูลความต้องการเฉพาะ";

  const normalized = listings.map((l) => ({
    id: l.id,
    title: l.title,
    price: l.price,
    priceUnit: l.priceUnit,
    bedrooms: l.bedrooms,
    bathrooms: l.bathrooms,
    usable_area: l.usableArea,
    district: l.district,
    nearest_bts: l.nearestBts,
    nearest_bts_distance: l.nearestBtsDistance,
    nearest_mrt: l.nearestMrt,
    nearest_mrt_distance: l.nearestMrtDistance,
    furnishing: l.furnishing,
    amenities: l.amenities,
  }));

  const prompt = `คุณคือผู้เชี่ยวชาญอสังหาริมทรัพย์ไทย ช่วยผู้ใช้เปรียบเทียบทรัพย์

${intentContext}

รายการที่เปรียบเทียบ:
${JSON.stringify(normalized, null, 2)}

วิเคราะห์และ return JSON ตาม schema:
{
  "best_overall_id": string,
  "best_for_budget_id": string,
  "best_for_commute_id": string | null,
  "best_for_space_id": string,
  "summary": string (ภาษาไทย 2-3 ประโยค),
  "listings_analysis": [{
    "id": string,
    "fit_score": number (0-100),
    "pros": string[] (ภาษาไทย),
    "cons": string[] (ภาษาไทย),
    "best_for": string (ภาษาไทย)
  }]
}`;

  const result = await geminiJSON<CompareResult>(prompt, { temperature: 0.2 });
  return result ?? buildMockCompare(listings, userIntent);
}

function buildMockCompare(listings: ListingDTO[], intent: ParsedIntent | null): CompareResult {
  // Pick winners by heuristic
  const byPrice = [...listings].sort((a, b) => a.price - b.price);
  const bySpace = [...listings].sort((a, b) => b.usableArea - a.usableArea);
  const byTransit = [...listings]
    .filter((l) => l.nearestBtsDistance || l.nearestMrtDistance)
    .sort((a, b) => (a.nearestBtsDistance ?? a.nearestMrtDistance ?? 9999) - (b.nearestBtsDistance ?? b.nearestMrtDistance ?? 9999));

  const best_for_budget_id = byPrice[0]?.id ?? listings[0].id;
  const best_for_space_id = bySpace[0]?.id ?? listings[0].id;
  const best_for_commute_id = byTransit[0]?.id ?? null;

  const budgetMax = intent?.budget_max ?? null;

  // Score each listing
  const listings_analysis: ListingAnalysis[] = listings.map((l) => {
    const pros: string[] = [];
    const cons: string[] = [];
    let score = 70;

    if (budgetMax) {
      if (l.price <= budgetMax) {
        const headroom = (budgetMax - l.price) / budgetMax;
        if (headroom > 0.2) {
          pros.push("ราคาต่ำกว่างบมาก มี headroom");
          score += 10;
        } else {
          pros.push("ราคาอยู่ในงบ");
          score += 5;
        }
      } else {
        cons.push(`ราคาสูงกว่างบ ${Math.round(((l.price - budgetMax) / budgetMax) * 100)}%`);
        score -= 15;
      }
    }

    const transitDist = l.nearestBtsDistance ?? l.nearestMrtDistance;
    if (transitDist) {
      if (transitDist <= 200) {
        pros.push(`เดินถึงรถไฟฟ้าเพียง ${transitDist}ม.`);
        score += 15;
      } else if (transitDist <= 500) {
        pros.push(`ใกล้รถไฟฟ้า (${transitDist}ม.)`);
        score += 8;
      }
    } else {
      cons.push("ไม่ระบุระยะถึงรถไฟฟ้า");
    }

    if (l.usableArea >= 50) {
      pros.push(`พื้นที่กว้าง ${l.usableArea} ตร.ม.`);
      score += 5;
    } else if (l.usableArea < 30) {
      cons.push(`พื้นที่ค่อนข้างเล็ก (${l.usableArea} ตร.ม.)`);
      score -= 5;
    }

    if (l.amenities.length >= 4) {
      pros.push(`ส่วนกลางครบ ${l.amenities.length} รายการ`);
    }

    if (pros.length === 0) pros.push("ข้อมูลครบถ้วน");
    if (cons.length === 0) cons.push("ไม่มีจุดด้อยที่เด่นชัด");

    const best_for =
      l.id === best_for_budget_id
        ? "คนที่เน้นราคาประหยัด"
        : l.id === best_for_commute_id
        ? "คนที่ให้ความสำคัญกับการเดินทาง"
        : l.id === best_for_space_id
        ? "ครอบครัวที่ต้องการพื้นที่"
        : "ตัวเลือกสมดุล";

    return {
      id: l.id,
      fit_score: Math.max(50, Math.min(100, score)),
      pros: pros.slice(0, 4),
      cons: cons.slice(0, 3),
      best_for,
    };
  });

  const best_overall_id = listings_analysis.reduce((a, b) => (a.fit_score > b.fit_score ? a : b)).id;
  const bestListing = listings.find((l) => l.id === best_overall_id)!;

  const summary = `${bestListing.title} เหมาะกับคุณที่สุด — ได้คะแนน ${listings_analysis.find((a) => a.id === best_overall_id)!.fit_score} จากการประเมินครบด้าน${budgetMax ? ` ราคาอยู่ในงบ` : ""}${bestListing.nearestBts ? ` และใกล้ BTS ${bestListing.nearestBts}` : ""}. หากให้ความสำคัญกับราคาประหยัด ลองพิจารณาตัวเลือกอื่นในตาราง`;

  return {
    best_overall_id,
    best_for_budget_id,
    best_for_commute_id,
    best_for_space_id,
    summary,
    listings_analysis,
  };
}

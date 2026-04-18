import { geminiJSON } from "./client";
import {
  createEmptyIntent,
  type ParsedIntent,
  type PropertyType,
  type MissingField,
  type TransitLine,
} from "./types";

const SYSTEM_PROMPT = `คุณคือ AI ผู้เชี่ยวชาญในการวิเคราะห์ความต้องการอสังหาริมทรัพย์จากข้อความภาษาไทย

กฎการแปลงค่า:
- "3 ล้าน" หรือ "3M" = 3000000
- "15,000 บาท/เดือน" = budget_max: 15000 และ search_goal = "rent"
- "ไม่เกิน X" = budget_max: X
- "อย่างน้อย X ห้องนอน" = bedrooms: X, bedrooms_flexible: true
- "ใกล้ BTS" = transit_preference: ["BTS"]
- ชื่อสถานี BTS/MRT ให้เก็บใน preferred_stations

กฎ search_goal (สำคัญมาก):
- ถ้ามีคำว่า "ซื้อ" หรือ "ขาย" → search_goal = "buy" เสมอ (ไม่ว่าจะเพื่ออะไร)
- "เช่า" เดี่ยว ๆ หรือ "/เดือน" → search_goal = "rent"
- "ซื้อเพื่อปล่อยเช่า", "ซื้อปล่อยเช่า", "ลงทุนปล่อยเช่า", "ซื้อสำหรับปล่อยเช่า"
  → search_goal = "buy" + purpose_context = "rental_income"
- "ลงทุน" (ไม่มีบริบทอื่น) → search_goal = "buy", purpose_context = "investment"
- "อยู่เอง" → purpose_context = "own_use"

confidence_score: 0.9+ = ข้อมูลครบ, 0.6-0.9 = พอสมควร, <0.6 = ไม่เพียงพอ

missing_required_fields (ใส่เฉพาะที่ยังขาดจริง):
- "search_goal" ถ้ายังไม่รู้ว่าซื้อหรือเช่า
- "budget" ถ้าไม่มีข้อมูลงบประมาณ
- "location" ถ้าไม่มีทั้งสถานีและเขต

interpreted_as: เขียนสรุปภาษาไทยธรรมชาติ 1 ประโยคสะท้อน intent ครบถ้วน
ตัวอย่าง: "กำลังหาคอนโดซื้อ 6 ล้าน ใกล้ MRT พระราม 9 เพื่อปล่อยเช่า"

ห้ามเดาข้อมูลที่ไม่มีในข้อความ ให้ใส่ null แทน

Schema:
{
  "search_goal": "buy" | "rent" | null,
  "budget_min": number | null,
  "budget_max": number | null,
  "location_context": string | null,
  "property_types": ("condo"|"house"|"townhouse"|"land"|"commercial")[],
  "bedrooms": number | null,
  "bedrooms_flexible": boolean,
  "bathrooms": number | null,
  "usable_area_min": number | null,
  "transit_preference": ("BTS"|"MRT"|"ARL")[],
  "preferred_stations": string[],
  "preferred_districts": string[],
  "furnishing_preference": "fully_furnished"|"partially_furnished"|"unfurnished"|null,
  "lifestyle_tags": string[],
  "move_in_urgency": "immediate"|"within_month"|"flexible"|null,
  "purpose_context": "investment"|"own_use"|"rental_income"|null,
  "confidence_score": number (0-1),
  "missing_required_fields": ("search_goal"|"budget"|"location")[],
  "interpreted_as": string (สรุปภาษาไทย)
}`;

/**
 * Parse user message to structured intent using Gemini.
 * Falls back to regex-based parser when no API key is configured.
 */
export async function parsePropertyIntent(
  userMessage: string,
  sessionContext?: ParsedIntent
): Promise<ParsedIntent> {
  const contextStr = sessionContext
    ? `\nข้อมูลที่ทราบแล้ว:\n${JSON.stringify(sessionContext, null, 2)}`
    : "";

  const prompt = `${SYSTEM_PROMPT}\n${contextStr}\n\nข้อความล่าสุด: "${userMessage}"\n\nReturn JSON ตาม schema เท่านั้น`;

  const parsed = await geminiJSON<ParsedIntent>(prompt, { temperature: 0.1 });

  const result = parsed ?? mockParse(userMessage);

  // Sanitize & normalize
  result.missing_required_fields = computeMissing(result);

  return sessionContext ? mergeIntents(sessionContext, result) : result;
}

function computeMissing(intent: ParsedIntent): MissingField[] {
  const missing: MissingField[] = [];
  if (!intent.search_goal) missing.push("search_goal");
  if (intent.budget_min === null && intent.budget_max === null) missing.push("budget");
  if (
    !intent.location_context &&
    intent.preferred_stations.length === 0 &&
    intent.preferred_districts.length === 0
  ) {
    missing.push("location");
  }
  return missing;
}

function mergeIntents(existing: ParsedIntent, next: ParsedIntent): ParsedIntent {
  const merged: ParsedIntent = {
    ...existing,
    ...Object.fromEntries(
      Object.entries(next).filter(([, v]) => v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0))
    ),
    property_types: Array.from(new Set([...existing.property_types, ...next.property_types])) as PropertyType[],
    transit_preference: Array.from(
      new Set([...existing.transit_preference, ...next.transit_preference])
    ) as TransitLine[],
    preferred_stations: Array.from(new Set([...existing.preferred_stations, ...next.preferred_stations])),
    preferred_districts: Array.from(new Set([...existing.preferred_districts, ...next.preferred_districts])),
    lifestyle_tags: Array.from(new Set([...existing.lifestyle_tags, ...next.lifestyle_tags])),
  } as ParsedIntent;
  merged.missing_required_fields = computeMissing(merged);
  merged.interpreted_as = buildInterpretedText(merged);
  return merged;
}

// ---------- Mock parser (no API key) ----------

const BTS_STATIONS = [
  "อโศก", "พร้อมพงษ์", "ทองหล่อ", "เอกมัย", "พระโขนง", "อ่อนนุช",
  "สยาม", "ชิดลม", "เพลินจิต", "นานา", "ราชดำริ",
  "สุรศักดิ์", "สะพานตากสิน", "กรุงธนบุรี", "สนามกีฬา",
  "สะพานควาย", "อารีย์", "สะนามเป้า", "อนุสาวรีย์",
];
const MRT_STATIONS = [
  "พระราม 9", "เพชรบุรี", "สุขุมวิท", "ศูนย์สิริกิติ์", "คลองเตย", "ลุมพินี", "สีลม",
  "ห้วยขวาง", "ศูนย์วัฒนธรรม", "ลาดพร้าว", "พหลโยธิน", "จตุจักร", "บางซื่อ",
];
const DISTRICTS = [
  "สุขุมวิท", "สาทร", "สีลม", "พระราม 9", "อารีย์", "พหลโยธิน", "รัชดา",
  "ลาดพร้าว", "บางนา", "รามอินทรา", "ห้วยขวาง", "วัฒนา", "คลองเตย", "ปทุมวัน",
];

const PROPERTY_KEYWORDS: { kw: string[]; type: PropertyType }[] = [
  { kw: ["คอนโด", "คอนโดมิเนียม"], type: "condo" },
  { kw: ["บ้านเดี่ยว", "บ้าน"], type: "house" },
  { kw: ["ทาวน์โฮม", "ทาวน์เฮาส์"], type: "townhouse" },
  { kw: ["ที่ดิน"], type: "land" },
  { kw: ["พาณิชย์", "อาคารพาณิชย์"], type: "commercial" },
];

function mockParse(message: string): ParsedIntent {
  const intent = createEmptyIntent();
  const msg = message.toLowerCase();

  // Search goal — "ซื้อ" takes priority (even when paired with "ปล่อยเช่า" as purpose)
  if (/ซื้อ|ขาย/.test(message)) {
    intent.search_goal = "buy";
    if (/ปล่อยเช่า|ลงทุนปล่อย/.test(message)) intent.purpose_context = "rental_income";
    else if (/ลงทุน/.test(message)) intent.purpose_context = "investment";
    else if (/อยู่เอง/.test(message)) intent.purpose_context = "own_use";
  } else if (/เช่า|บาท\s*\/?\s*เดือน|\/เดือน/.test(message)) {
    intent.search_goal = "rent";
  }

  // Budget: "3 ล้าน", "3M", "ไม่เกิน 5 ล้าน", "15,000"
  const millionMatch = message.match(/(\d+(?:\.\d+)?)\s*(?:ล้าน|m\b|M\b)/);
  if (millionMatch) {
    const amt = Math.round(parseFloat(millionMatch[1]) * 1_000_000);
    if (/ไม่เกิน|ต่ำกว่า|ภายใน|<=/.test(message)) intent.budget_max = amt;
    else intent.budget_max = amt;
  } else {
    const rentMatch = message.match(/(\d{1,3}(?:,\d{3})*|\d+)\s*(?:บาท)?\s*\/?\s*เดือน/);
    if (rentMatch) {
      intent.budget_max = parseInt(rentMatch[1].replace(/,/g, ""));
      intent.search_goal = intent.search_goal ?? "rent";
    } else {
      const plainNumber = message.match(/ไม่เกิน\s*(\d{1,3}(?:,\d{3})+|\d+)/);
      if (plainNumber) intent.budget_max = parseInt(plainNumber[1].replace(/,/g, ""));
    }
  }

  // Property types
  for (const p of PROPERTY_KEYWORDS) {
    if (p.kw.some((k) => msg.includes(k.toLowerCase()))) {
      intent.property_types.push(p.type);
    }
  }
  intent.property_types = Array.from(new Set(intent.property_types));

  // Bedrooms
  const bedMatch = message.match(/(\d+)\s*(?:ห้องนอน|นอน|bed|bedroom)/);
  if (bedMatch) {
    intent.bedrooms = parseInt(bedMatch[1]);
    intent.bedrooms_flexible = /อย่างน้อย/.test(message);
  }

  // Transit
  if (/bts|BTS/.test(message)) intent.transit_preference.push("BTS");
  if (/mrt|MRT/.test(message)) intent.transit_preference.push("MRT");
  if (/arl|ARL|airport\s*link/i.test(message)) intent.transit_preference.push("ARL");

  // Stations
  for (const s of BTS_STATIONS) if (message.includes(s)) intent.preferred_stations.push(s);
  for (const s of MRT_STATIONS) if (message.includes(s)) intent.preferred_stations.push(s);
  intent.preferred_stations = Array.from(new Set(intent.preferred_stations));

  // Districts
  for (const d of DISTRICTS) if (message.includes(d)) intent.preferred_districts.push(d);
  intent.preferred_districts = Array.from(new Set(intent.preferred_districts));

  // Furnishing
  if (/เฟอร์(นิเจอร์)?ครบ|พร้อมอยู่|fully/i.test(message)) intent.furnishing_preference = "fully_furnished";
  else if (/ไม่มีเฟอร์|unfurnished/i.test(message)) intent.furnishing_preference = "unfurnished";

  // Lifestyle
  if (/pet|สัตว์เลี้ยง|น้องหมา|น้องแมว/i.test(message)) intent.lifestyle_tags.push("pet_friendly");
  if (/เงียบ|สงบ/.test(message)) intent.lifestyle_tags.push("quiet_neighborhood");

  // Confidence
  const hasGoal = intent.search_goal !== null;
  const hasBudget = intent.budget_max !== null || intent.budget_min !== null;
  const hasLoc = intent.preferred_districts.length + intent.preferred_stations.length > 0 || intent.transit_preference.length > 0;
  intent.confidence_score = (Number(hasGoal) + Number(hasBudget) + Number(hasLoc)) / 3;

  intent.interpreted_as = buildInterpretedText(intent);
  return intent;
}

function buildInterpretedText(i: ParsedIntent): string {
  const parts: string[] = [];
  parts.push(`กำลังหา${i.property_types[0] === "condo" ? "คอนโด" : i.property_types[0] === "house" ? "บ้านเดี่ยว" : i.property_types[0] === "townhouse" ? "ทาวน์โฮม" : i.property_types[0] === "land" ? "ที่ดิน" : i.property_types[0] === "commercial" ? "อาคารพาณิชย์" : "ทรัพย์"}`);
  if (i.search_goal) parts.push(i.search_goal === "buy" ? "สำหรับซื้อ" : "สำหรับเช่า");
  if (i.budget_max) {
    const amt = i.budget_max >= 1_000_000
      ? `${(i.budget_max / 1_000_000).toFixed(i.budget_max % 1_000_000 === 0 ? 0 : 2)} ล้าน`
      : `${i.budget_max.toLocaleString()} บาท`;
    parts.push(`ราคาไม่เกิน ${amt}`);
  }
  if (i.bedrooms) parts.push(`${i.bedrooms} ห้องนอน`);
  if (i.preferred_stations.length) parts.push(`ใกล้ ${i.preferred_stations.slice(0, 2).join("/")}`);
  else if (i.transit_preference.length) parts.push(`ใกล้ ${i.transit_preference.join("/")}`);
  if (i.preferred_districts.length) parts.push(`ย่าน${i.preferred_districts.slice(0, 2).join(", ")}`);
  return parts.join(" ");
}

import { geminiJSON } from "./client";
import {
  createEmptyIntent,
  type ParsedIntent,
  type PropertyType,
  type MissingField,
  type TransitLine,
  type AmenityToken,
  type NeighborhoodVibe,
  type POICategoryToken,
  type ViewPreference,
  type InvestmentSignal,
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

การแปลงระยะ (max_distance_to_transit_m):
- "เดินถึง" / "เดินไปได้" → 500
- "ใกล้รถไฟฟ้า" / "ติดรถไฟฟ้า" → 800
- "ไม่ไกลรถไฟฟ้า" → 1500
- "ในระยะเดิน X นาที" → X * 80 (m)

การแยก required vs nice_to_have (สำคัญมาก!):
- คำที่บ่งชี้ "ต้องมี" → required_amenities: "ต้องมี", "ต้องการ", "จำเป็น", "ขาดไม่ได้", "must", "need"
- คำที่บ่งชี้ "อยากได้" → nice_to_have_amenities: "อยากได้", "ถ้ามีก็ดี", "หากมี", "ชอบ", "want", "would like"
- ถ้าไม่ระบุชัดเจน → ใช้ nice_to_have_amenities เป็นค่า default (ไม่ใช่ required)
- ตัวอย่าง: "อยากได้คอนโดมีสระ" → nice_to_have_amenities: ["pool"]
- ตัวอย่าง: "ต้องมีสระ" → required_amenities: ["pool"]

การแปลง amenity tokens (ใช้กับทั้ง required และ nice_to_have):
- "ต้องมีสระ" / "มีสระว่ายน้ำ" → ["pool"]
- "ฟิตเนส" / "ยิม" → ["gym"]
- "เลี้ยงสัตว์" / "petfriendly" → ["pet_friendly"]
- "ที่จอดรถ" / "มีที่จอด" → ["parking"]
- "EV charger" / "ที่ชาร์จรถ" → ["ev_charger"]
- "รปภ. 24" / "security 24" → ["security_24h"]
- "co-working" / "โคเวิร์คกิ้ง" → ["co_working"]
- "ลิฟต์" → ["elevator"]
- "วิวแม่น้ำ" → ["river_view"], "วิวเมือง" → ["city_view"], "วิวสวน" → ["park_view"]

nice_to_have_amenities: สิ่งที่ "อยากได้ถ้ามี" / "ถ้ามีก็ดี" — ใส่ใน nice ไม่ใช่ required

neighborhood_vibe (เลือกได้หลายค่า):
- "ใจกลางเมือง" / "CBD" → ["central"]
- "เงียบ" / "สงบ" → ["quiet"]
- "ย่านบันเทิง" / "ไนท์ไลฟ์" / "ผับบาร์" → ["nightlife"]
- "ครอบครัว" / "ปลอดภัย" → ["family"]
- "ลงทุนน่าสนใจ" / "ทำเลทอง" → ["investment_hot"]
- "ใกล้สวน" / "พื้นที่สีเขียว" → ["green"]
- "เดินสะดวก" → ["walkable"]
- "ย่านช้อปปิ้ง" / "ใกล้ห้าง" → ["shopping_district"]
- "ย่านการศึกษา" / "ใกล้โรงเรียน" → ["education_hub"]
- "ใกล้โรงพยาบาล" → ["medical_hub"]

nearby_poi (POI ที่ต้องอยู่ใกล้):
- "ใกล้ห้าง" / "shopping mall" → ["shopping"]
- "โรงเรียนนานาชาติ" → ["international_school"]
- "มหาวิทยาลัย" → ["university"]
- "โรงพยาบาล" → ["hospital"]
- "สวน" / "สวนสาธารณะ" → ["park"]
- "ออฟฟิศ" / "ใกล้ที่ทำงาน" → ["office_district"]

view_preference: ["city","river","park","garden","any"]
floor_preference:
- "ห้องสูง" / "ชั้นสูง" / "วิวสูง" → "high"
- "ชั้นล่าง" / "ชั้นต่ำ" → "low"

building_age_max_years:
- "มือหนึ่ง" / "โครงการใหม่ป้ายแดง" → 0
- "ใหม่" / "สร้างใหม่" → 5
- "อายุไม่เกิน X ปี" → X

investment_signals (เมื่อ search_goal=buy):
- "yield ดี" / "เน้น yield" / "ผลตอบแทนเช่า" → ["yield_focused"]
- "ราคาขึ้น" / "capital gain" / "เก็งกำไร" → ["capital_gain"]
- "airbnb" / "short-term rental" / "ปล่อยรายวัน" → ["airbnb_friendly"]
- "ถือยาว" / "long term" → ["long_term_hold"]

raw_keywords: ดึงคำสำคัญที่ user พูดเชิงไลฟ์สไตล์/บรรยากาศ ที่ไม่เข้า slot อื่น (เช่น "เดินทางสะดวก","ใกล้ที่ทำงาน","ห้องสว่าง","วิวดี") เก็บเป็น array ของวลีไทย ใช้สำหรับ semantic match กับ description ภายหลัง

confidence_score: 0.9+ = ข้อมูลครบ, 0.6-0.9 = พอสมควร, <0.6 = ไม่เพียงพอ

missing_required_fields (ใส่เฉพาะที่ยังขาดจริง):
- "search_goal" ถ้ายังไม่รู้ว่าซื้อหรือเช่า
- "budget" ถ้าไม่มีข้อมูลงบประมาณ
- "location" ถ้าไม่มีทั้งสถานีและเขต

interpreted_as: เขียนสรุปภาษาไทยธรรมชาติ 1 ประโยคสะท้อน intent ครบถ้วน
ตัวอย่าง: "กำลังหาคอนโดซื้อ 6 ล้าน ใกล้ MRT พระราม 9 เพื่อปล่อยเช่า ต้องมีสระและฟิตเนส"

ห้ามเดาข้อมูลที่ไม่มีในข้อความ ให้ใส่ null/[] แทน

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
  "required_amenities": string[],
  "nice_to_have_amenities": string[],
  "max_distance_to_transit_m": number | null,
  "neighborhood_vibe": string[],
  "nearby_poi": string[],
  "view_preference": ("city"|"river"|"park"|"garden"|"any")[],
  "floor_preference": "high"|"low"|"any"|null,
  "building_age_max_years": number | null,
  "investment_signals": ("yield_focused"|"capital_gain"|"airbnb_friendly"|"long_term_hold")[],
  "raw_keywords": string[],
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

  const parsed = await geminiJSON<Partial<ParsedIntent>>(prompt, { temperature: 0.1 });

  const result = parsed ? hydrate(parsed) : mockParse(userMessage);

  // Sanitize & normalize
  result.missing_required_fields = computeMissing(result);

  return sessionContext ? mergeIntents(sessionContext, result) : result;
}

/** Fill missing fields on a partial intent (LLM may omit any). */
function hydrate(partial: Partial<ParsedIntent>): ParsedIntent {
  const base = createEmptyIntent();
  return { ...base, ...partial } as ParsedIntent;
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

function dedupe<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function mergeIntents(existing: ParsedIntent, next: ParsedIntent): ParsedIntent {
  const merged: ParsedIntent = {
    ...existing,
    ...Object.fromEntries(
      Object.entries(next).filter(([, v]) => v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0))
    ),
    property_types: dedupe([...existing.property_types, ...next.property_types]) as PropertyType[],
    transit_preference: dedupe([...existing.transit_preference, ...next.transit_preference]) as TransitLine[],
    preferred_stations: dedupe([...existing.preferred_stations, ...next.preferred_stations]),
    preferred_districts: dedupe([...existing.preferred_districts, ...next.preferred_districts]),
    lifestyle_tags: dedupe([...existing.lifestyle_tags, ...next.lifestyle_tags]),
    required_amenities: dedupe([...existing.required_amenities, ...next.required_amenities]) as AmenityToken[],
    nice_to_have_amenities: dedupe([
      ...existing.nice_to_have_amenities,
      ...next.nice_to_have_amenities,
    ]) as AmenityToken[],
    neighborhood_vibe: dedupe([...existing.neighborhood_vibe, ...next.neighborhood_vibe]) as NeighborhoodVibe[],
    nearby_poi: dedupe([...existing.nearby_poi, ...next.nearby_poi]) as POICategoryToken[],
    view_preference: dedupe([...existing.view_preference, ...next.view_preference]) as ViewPreference[],
    investment_signals: dedupe([
      ...existing.investment_signals,
      ...next.investment_signals,
    ]) as InvestmentSignal[],
    raw_keywords: dedupe([...existing.raw_keywords, ...next.raw_keywords]),
  } as ParsedIntent;
  merged.missing_required_fields = computeMissing(merged);
  merged.interpreted_as = buildInterpretedText(merged);
  return merged;
}

// ---------- Mock parser (no API key) ----------

const BTS_STATIONS = [
  "อโศก", "พร้อมพงษ์", "ทองหล่อ", "เอกมัย", "พระโขนง", "อ่อนนุช", "บางจาก", "ปุณณวิถี", "อุดมสุข", "บางนา", "แบริ่ง",
  "สยาม", "ชิดลม", "เพลินจิต", "นานา", "ราชดำริ", "ศาลาแดง",
  "สุรศักดิ์", "สะพานตากสิน", "กรุงธนบุรี", "วงเวียนใหญ่", "โพธิ์นิมิตร", "ตลาดพลู", "วุฒากาศ", "บางหว้า",
  "สนามกีฬาแห่งชาติ", "ราชเทวี", "พญาไท", "อนุสาวรีย์ชัยสมรภูมิ", "สนามเป้า", "อารีย์", "สะพานควาย",
  "หมอชิต", "ห้าแยกลาดพร้าว", "พหลโยธิน 24", "รัชโยธิน", "เสนานิคม", "มหาวิทยาลัยเกษตรศาสตร์", "กรมป่าไม้",
  "บางบัว", "กรมทหารราบที่ 11", "วัดพระศรีมหาธาตุ", "พหลโยธิน 59", "สายหยุด", "สะพานใหม่", "คูคต",
];
const MRT_STATIONS = [
  "พระราม 9", "เพชรบุรี", "สุขุมวิท", "ศูนย์การประชุมแห่งชาติสิริกิติ์", "คลองเตย", "ลุมพินี", "สีลม",
  "สามย่าน", "หัวลำโพง", "สนามไชย", "อิสรภาพ", "ท่าพระ",
  "ห้วยขวาง", "ศูนย์วัฒนธรรมแห่งประเทศไทย", "ลาดพร้าว", "พหลโยธิน", "จตุจักร", "บางซื่อ", "เตาปูน",
  "ยศเส", "ราชดำริ", "บำรุงเมือง", "วัดมังกร", "สามยอด",
];
const ARL_STATIONS = ["พญาไท", "ราชปรารภ", "มักกะสัน", "รามคำแหง", "หัวหมาก", "บ้านทับช้าง", "ลาดกระบัง", "สุวรรณภูมิ"];
const DISTRICTS = [
  "สุขุมวิท", "สาทร", "สีลม", "พระราม 9", "อารีย์", "พหลโยธิน", "รัชดา", "รัชดาภิเษก",
  "ลาดพร้าว", "บางนา", "รามอินทรา", "ห้วยขวาง", "วัฒนา", "คลองเตย", "ปทุมวัน", "บางรัก",
  "จตุจักร", "ดินแดง", "บางซื่อ", "ทุ่งครุ", "พระโขนง", "ประเวศ", "บางกะปิ", "บางพลัด",
  "ธนบุรี", "ภาษีเจริญ", "ตลิ่งชัน", "บางแค", "หนองแขม", "บางบอน", "จอมทอง",
];

const PROPERTY_KEYWORDS: { kw: string[]; type: PropertyType }[] = [
  { kw: ["คอนโด", "คอนโดมิเนียม"], type: "condo" },
  { kw: ["บ้านเดี่ยว", "บ้าน"], type: "house" },
  { kw: ["ทาวน์โฮม", "ทาวน์เฮาส์"], type: "townhouse" },
  { kw: ["ที่ดิน"], type: "land" },
  { kw: ["พาณิชย์", "อาคารพาณิชย์"], type: "commercial" },
];

const AMENITY_REQUIRED_KEYWORDS: { kw: RegExp; token: AmenityToken }[] = [
  { kw: /สระว่ายน้ำ|สระ\b|swimming\s*pool/i, token: "pool" },
  { kw: /ฟิตเนส|ยิม\b|fitness|gym/i, token: "gym" },
  { kw: /ซาวน่า|sauna/i, token: "sauna" },
  { kw: /ห้องเด็กเล่น|kids?\s*room|playroom/i, token: "kids_room" },
  { kw: /co.?working|โคเวิร์คกิ้ง|coworking/i, token: "co_working" },
  { kw: /ที่จอดรถ|จอดรถ|parking/i, token: "parking" },
  { kw: /ev\s*charg|ที่ชาร์จรถ|ชาร์จ\s*ev/i, token: "ev_charger" },
  { kw: /รปภ\.?\s*24|security\s*24|24\s*ชม\.?/i, token: "security_24h" },
  { kw: /cctv|กล้องวงจร/i, token: "cctv" },
  { kw: /key\s*card|คีย์การ์ด/i, token: "key_card" },
  { kw: /ลิฟต์|elevator|lift/i, token: "elevator" },
  { kw: /pet\s*friendly|เลี้ยงสัตว์|น้องหมา|น้องแมว|petfriendly/i, token: "pet_friendly" },
  { kw: /concierge|คอนเซียร์/i, token: "concierge" },
  { kw: /shuttle|รถรับส่ง/i, token: "shuttle" },
  { kw: /rooftop|รูฟท็อป/i, token: "rooftop" },
  { kw: /วิวแม่น้ำ|river\s*view/i, token: "river_view" },
  { kw: /วิวเมือง|city\s*view/i, token: "city_view" },
  { kw: /วิวสวน|park\s*view/i, token: "park_view" },
];

const VIBE_KEYWORDS: { kw: RegExp; vibe: NeighborhoodVibe }[] = [
  { kw: /ใจกลางเมือง|cbd|กลางเมือง/i, vibe: "central" },
  { kw: /เงียบ|สงบ|peaceful/i, vibe: "quiet" },
  { kw: /ไนท์ไลฟ์|nightlife|ผับ|บาร์/i, vibe: "nightlife" },
  { kw: /ครอบครัว|family|ปลอดภัย/i, vibe: "family" },
  { kw: /ทำเลทอง|ลงทุนน่าสนใจ|hot\s*spot/i, vibe: "investment_hot" },
  { kw: /ใกล้สวน|พื้นที่สีเขียว|green/i, vibe: "green" },
  { kw: /เดินสะดวก|walkable/i, vibe: "walkable" },
  { kw: /ย่านช้อปปิ้ง|ใกล้ห้าง|shopping/i, vibe: "shopping_district" },
  { kw: /ย่านการศึกษา|ใกล้โรงเรียน/i, vibe: "education_hub" },
  { kw: /ใกล้โรงพยาบาล/i, vibe: "medical_hub" },
];

const POI_KEYWORDS: { kw: RegExp; poi: POICategoryToken }[] = [
  { kw: /ใกล้ห้าง|shopping\s*mall|เซ็นทรัล|the\s*mall|ไอคอน/i, poi: "shopping" },
  { kw: /โรงเรียนนานาชาติ|international\s*school/i, poi: "international_school" },
  { kw: /มหาวิทยาลัย|university|จุฬา|ธรรมศาสตร์|เกษตร|มหิดล/i, poi: "university" },
  { kw: /โรงเรียน(?!นานาชาติ)/i, poi: "school" },
  { kw: /โรงพยาบาล|hospital|clinic/i, poi: "hospital" },
  { kw: /สวนสาธารณะ|สวน(?!อาหาร)/i, poi: "park" },
  { kw: /ออฟฟิศ|ที่ทำงาน|business\s*district/i, poi: "office_district" },
];

const INVESTMENT_KEYWORDS: { kw: RegExp; sig: InvestmentSignal }[] = [
  { kw: /yield|ผลตอบแทนเช่า|กระแสเงินสด/i, sig: "yield_focused" },
  { kw: /capital\s*gain|ราคาขึ้น|เก็งกำไร/i, sig: "capital_gain" },
  { kw: /airbnb|รายวัน|short.?term/i, sig: "airbnb_friendly" },
  { kw: /ถือยาว|long.?term/i, sig: "long_term_hold" },
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
    intent.budget_max = amt;
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
  intent.property_types = dedupe(intent.property_types);

  // Bedrooms
  const bedMatch = message.match(/(\d+)\s*(?:ห้องนอน|นอน|bed|bedroom)/);
  if (bedMatch) {
    intent.bedrooms = parseInt(bedMatch[1]);
    intent.bedrooms_flexible = /อย่างน้อย/.test(message);
  }

  // Usable area
  const areaMatch = message.match(/(\d+)\s*(?:ตร\.?ม\.?|ตารางเมตร|sqm|sq\.?m\.?)/i);
  if (areaMatch) intent.usable_area_min = parseInt(areaMatch[1]);

  // Transit preference
  if (/bts|BTS/.test(message)) intent.transit_preference.push("BTS");
  if (/mrt|MRT/.test(message)) intent.transit_preference.push("MRT");
  if (/arl|ARL|airport\s*link/i.test(message)) intent.transit_preference.push("ARL");

  // Stations
  for (const s of [...BTS_STATIONS, ...MRT_STATIONS, ...ARL_STATIONS]) {
    if (message.includes(s)) intent.preferred_stations.push(s);
  }
  intent.preferred_stations = dedupe(intent.preferred_stations);

  // Districts
  for (const d of DISTRICTS) if (message.includes(d)) intent.preferred_districts.push(d);
  intent.preferred_districts = dedupe(intent.preferred_districts);

  // Furnishing
  if (/เฟอร์(นิเจอร์)?ครบ|พร้อมอยู่|fully/i.test(message)) intent.furnishing_preference = "fully_furnished";
  else if (/ไม่มีเฟอร์|unfurnished/i.test(message)) intent.furnishing_preference = "unfurnished";

  // Distance to transit
  if (/เดินถึง|เดินไปได้/.test(message)) intent.max_distance_to_transit_m = 500;
  else if (/ใกล้รถไฟฟ้า|ติดรถไฟฟ้า/.test(message)) intent.max_distance_to_transit_m = 800;
  else if (/ไม่ไกลรถไฟฟ้า/.test(message)) intent.max_distance_to_transit_m = 1500;
  const walkMin = message.match(/เดิน\s*(\d+)\s*นาที/);
  if (walkMin) intent.max_distance_to_transit_m = parseInt(walkMin[1]) * 80;

  // Required amenities
  for (const a of AMENITY_REQUIRED_KEYWORDS) {
    if (a.kw.test(message)) {
      // Heuristic: "ต้องมี"/"ต้อง" → required; otherwise nice_to_have
      const idx = message.search(a.kw);
      const before = message.slice(Math.max(0, idx - 20), idx);
      if (/ต้อง(มี)?|จำเป็น|must/i.test(before)) intent.required_amenities.push(a.token);
      else intent.nice_to_have_amenities.push(a.token);
    }
  }
  intent.required_amenities = dedupe(intent.required_amenities) as AmenityToken[];
  intent.nice_to_have_amenities = dedupe(
    intent.nice_to_have_amenities.filter((t) => !intent.required_amenities.includes(t))
  ) as AmenityToken[];

  // Vibe
  for (const v of VIBE_KEYWORDS) if (v.kw.test(message)) intent.neighborhood_vibe.push(v.vibe);
  intent.neighborhood_vibe = dedupe(intent.neighborhood_vibe) as NeighborhoodVibe[];

  // POI
  for (const p of POI_KEYWORDS) if (p.kw.test(message)) intent.nearby_poi.push(p.poi);
  intent.nearby_poi = dedupe(intent.nearby_poi) as POICategoryToken[];

  // View
  if (/วิวแม่น้ำ|river\s*view/i.test(message)) intent.view_preference.push("river");
  if (/วิวเมือง|city\s*view/i.test(message)) intent.view_preference.push("city");
  if (/วิวสวน|park\s*view/i.test(message)) intent.view_preference.push("park");
  intent.view_preference = dedupe(intent.view_preference) as ViewPreference[];

  // Floor
  if (/ห้องสูง|ชั้นสูง|วิวสูง|high\s*floor/i.test(message)) intent.floor_preference = "high";
  else if (/ชั้นล่าง|ชั้นต่ำ|low\s*floor/i.test(message)) intent.floor_preference = "low";

  // Building age
  if (/มือหนึ่ง|ป้ายแดง|brand\s*new/i.test(message)) intent.building_age_max_years = 0;
  else if (/สร้างใหม่|โครงการใหม่|new\s*build/i.test(message)) intent.building_age_max_years = 5;
  const ageMatch = message.match(/อายุไม่เกิน\s*(\d+)\s*ปี/);
  if (ageMatch) intent.building_age_max_years = parseInt(ageMatch[1]);

  // Investment signals
  for (const i of INVESTMENT_KEYWORDS) if (i.kw.test(message)) intent.investment_signals.push(i.sig);
  intent.investment_signals = dedupe(intent.investment_signals) as InvestmentSignal[];

  // Lifestyle (kept for back-compat)
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
  if (i.required_amenities.length) parts.push(`ต้องมี ${i.required_amenities.slice(0, 3).join("/")}`);
  if (i.neighborhood_vibe.length) parts.push(`บรรยากาศ ${i.neighborhood_vibe.slice(0, 2).join("/")}`);
  return parts.join(" ");
}

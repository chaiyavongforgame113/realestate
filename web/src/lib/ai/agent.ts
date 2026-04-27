/**
 * Conversational Property AI Agent.
 *
 * Replaces the rigid "field-by-field clarification" pipeline with a single
 * Gemini call per turn that:
 *   1. Maintains natural Thai conversation flow
 *   2. Updates the structured ParsedIntent based on the full conversation
 *   3. Decides when enough info has been gathered to run a search
 *   4. Generates context-aware quick-reply suggestions
 *
 * Falls back to a deterministic state machine when Gemini is unavailable
 * (quota exhausted / network error). The fallback still produces polite
 * Thai responses — never a raw error to the user.
 */

import { geminiJSON } from "./client";
import {
  createEmptyIntent,
  type ParsedIntent,
} from "./types";

export type AgentTurn = {
  role: "user" | "assistant";
  content: string;
};

export type AgentDecision = {
  reply: string;
  quick_replies: string[];
  intent: ParsedIntent;
  next_action: "continue" | "ready_to_search";
  /** True when the deterministic fallback was used (UI may show subtle cue). */
  fallback?: boolean;
};

const SYSTEM_PROMPT = `คุณคือ "ผู้ช่วยอสังหาริมทรัพย์" ที่เป็นมิตรและพูดเป็นธรรมชาติแบบคนไทย

หน้าที่ของคุณ:
1. ทักทายและเข้าใจความต้องการของลูกค้าเรื่องการหาที่อยู่อาศัย (ซื้อ/เช่า บ้าน/คอนโด/ที่ดิน)
2. ค่อย ๆ ดึงข้อมูลที่จำเป็นต่อการค้นหาผ่านบทสนทนาที่ลื่นไหล
3. ตัดสินใจเองว่าเมื่อไหร่ข้อมูลเพียงพอที่จะค้นหา

หลักการคุย (สำคัญมาก!):
- พูดแบบคนคุยกับคน — มี acknowledge ("ได้เลยครับ", "เข้าใจแล้วครับ", "เยี่ยม!")
- ถามทีละ 1 เรื่อง อย่ายิงคำถามต่อกันเป็นรายการ (avoid "งบเท่าไหร่ ที่ไหน กี่ห้องนอน")
- ใช้ emoji พอประมาณ ไม่ใช้ทุกประโยค (✓ 😊 🪄)
- ห้ามตอบแบบหุ่นยนต์ เช่น "กรุณาระบุงบประมาณ" → ใช้ "งบประมาณประมาณเท่าไหร่ดีครับ?"
- อย่าถามซ้ำสิ่งที่ user บอกมาแล้ว
- ถ้า user พูดกำกวม เช่น "แบบไหนก็ได้" → set search_goal_flexible=true และเดินหน้าต่อ ไม่ต้องคะยั้นคะยอ
- ถ้า user บอก "ค้นเลย", "พอแล้ว", "ดูได้เลย" → next_action="ready_to_search" ทันที

ข้อมูลที่อยากได้ (ตามลำดับความสำคัญ):
1. search_goal: ซื้อ/เช่า/ทั้งสอง (สำคัญที่สุด)
2. property_types: คอนโด/บ้าน/ทาวน์โฮม/ที่ดิน
3. budget_max: งบประมาณ (หรือ budget_max_buy + budget_max_rent ถ้า flexible)
4. location: สถานี BTS/MRT หรือเขต
5. amenity / vibe: pet-friendly, สระ, ฟิตเนส, ใจกลางเมือง, เงียบสงบ ฯลฯ

ตัดสินใจ next_action:
- "continue" — ยังขาดข้อมูลสำคัญ (ขั้นต่ำ: รู้ goal + อย่างน้อย 1 ใน [budget, location])
- "ready_to_search" — มี goal + budget OR location แล้ว และ user ดูเหมือนพอแล้ว
  หรือ user บอก "ดูเลย" / "พอแล้ว"
  หรือคุยมาเกิน 5 รอบแล้ว (ป้องกันคุยยืด)

quick_replies: เลือกตาม context ของคำถาม (ไม่เกิน 4 ข้อ)
- ถาม goal → ["💰 ซื้อ", "🔑 เช่า", "🤔 ดูทั้งสอง"]
- ถาม location → ["ใกล้ BTS", "ใกล้ MRT", "ใจกลางเมือง", "ชานเมือง"]
- ถาม budget rent → ["≤15,000", "15-25k", "25-40k", ">40k"]
- ถาม budget buy → ["≤3 ล้าน", "3-5 ล้าน", "5-10 ล้าน", ">10 ล้าน"]
- พร้อมค้น → ["👀 ดูผลลัพธ์เลย", "เพิ่มเงื่อนไข"]
- ห้ามใช้ quick_replies ถ้าคำถามเป็น open-ended

reply: ภาษาไทย ความยาว 1-3 ประโยค ตามธรรมชาติ ไม่ใช้ markdown ไม่ใส่ bullet

intent: คืนค่า ParsedIntent ที่อัปเดตตามบทสนทนาทั้งหมด
- search_goal_flexible: true เมื่อ user บอก "แบบไหนก็ได้" / "ทั้งสอง"
- เก็บ raw_keywords จากคำที่ user พูดที่ไม่ตรงกับ slot อื่น เช่น "ห้องสว่าง" "บรรยากาศดี"
- nice_to_have_amenities: ใช้สำหรับ "อยากได้/ถ้ามีก็ดี"
- required_amenities: ใช้สำหรับ "ต้องมี/จำเป็นต้องมี"

⚠️ สำคัญมาก — ใช้ค่า canonical token (อังกฤษ) เท่านั้น ห้ามใช้ภาษาไทยใน enum:
- search_goal: "buy" | "rent" | null  (ไม่ใช่ "ซื้อ"/"เช่า")
- property_types: ["condo","house","townhouse","land","commercial"] (ไม่ใช่ "คอนโด")
  • คอนโด/คอนโดมิเนียม → "condo"
  • บ้าน/บ้านเดี่ยว → "house"
  • ทาวน์โฮม/ทาวน์เฮาส์ → "townhouse"
  • ที่ดิน → "land"
  • อาคารพาณิชย์ → "commercial"
- transit_preference: ["BTS","MRT","ARL"]
- furnishing_preference: "fully_furnished" | "partially_furnished" | "unfurnished" | null
- floor_preference: "high" | "low" | "any" | null
- view_preference: ["city","river","park","garden","any"]
- required_amenities / nice_to_have_amenities: ["pool","gym","sauna","garden","playground","kids_room","co_working","library","parking","ev_charger","security_24h","cctv","key_card","elevator","pet_friendly","concierge","shuttle","laundry","rooftop","river_view","city_view","park_view"]
- neighborhood_vibe: ["central","quiet","nightlife","family","investment_hot","green","walkable","shopping_district","education_hub","medical_hub"]
- nearby_poi: ["transit","school","international_school","university","hospital","food","shopping","park","office_district"]
- investment_signals: ["yield_focused","capital_gain","airbnb_friendly","long_term_hold"]
- preferred_stations / preferred_districts: เก็บเป็นภาษาไทยตามที่ user พูด
- บ้านเลี้ยงสัตว์ได้ → required_amenities: ["pet_friendly"]
- ตัวเลขงบประมาณ: "3 ล้าน"=3000000, "15,000/เดือน"=15000+set search_goal="rent"

Schema response (JSON เท่านั้น):
{
  "reply": string,
  "quick_replies": string[],
  "next_action": "continue" | "ready_to_search",
  "intent": ParsedIntent
}`;

export async function runAgentTurn(
  history: AgentTurn[],
  currentIntent: ParsedIntent
): Promise<AgentDecision> {
  const conversation = history
    .map((m) => `${m.role === "user" ? "User" : "AI"}: ${m.content}`)
    .join("\n");

  const prompt = `${SYSTEM_PROMPT}

บทสนทนาที่ผ่านมา:
${conversation || "(ยังไม่มีข้อความ — นี่คือ turn แรก ทักทายและถามจุดประสงค์)"}

intent ปัจจุบัน:
${JSON.stringify(currentIntent, null, 2)}

ตอบเป็น JSON ตาม schema เท่านั้น`;

  const result = await geminiJSON<{
    reply: string;
    quick_replies: string[];
    next_action: "continue" | "ready_to_search";
    intent: Partial<ParsedIntent>;
  }>(prompt, { temperature: 0.6 });

  if (result && typeof result.reply === "string") {
    const merged: ParsedIntent = sanitizeIntent({
      ...createEmptyIntent(),
      ...currentIntent,
      ...result.intent,
    });
    return {
      reply: result.reply,
      quick_replies: Array.isArray(result.quick_replies) ? result.quick_replies.slice(0, 4) : [],
      intent: merged,
      next_action: result.next_action === "ready_to_search" ? "ready_to_search" : "continue",
    };
  }

  // Fallback to deterministic state machine
  return fallbackAgentTurn(history, currentIntent);
}

// ─── Intent sanitizer — coerce stray Thai/loose values back to canonical tokens ─

const PROPERTY_THAI_MAP: Record<string, string> = {
  คอนโด: "condo",
  คอนโดมิเนียม: "condo",
  condominium: "condo",
  บ้าน: "house",
  บ้านเดี่ยว: "house",
  ทาวน์โฮม: "townhouse",
  ทาวน์เฮาส์: "townhouse",
  ที่ดิน: "land",
  พาณิชย์: "commercial",
  อาคารพาณิชย์: "commercial",
};

const VALID_PROPERTY = new Set(["condo", "house", "townhouse", "land", "commercial"]);
const VALID_TRANSIT = new Set(["BTS", "MRT", "ARL"]);
const VALID_VIEW = new Set(["city", "river", "park", "garden", "any"]);
const VALID_FLOOR = new Set(["high", "low", "any"]);
const VALID_FURNISHING = new Set(["fully_furnished", "partially_furnished", "unfurnished"]);
const VALID_GOAL = new Set(["buy", "rent"]);

function coerceProperty(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const lower = v.toLowerCase().trim();
  if (VALID_PROPERTY.has(lower)) return lower;
  return PROPERTY_THAI_MAP[v] ?? PROPERTY_THAI_MAP[lower] ?? null;
}

function coerceGoal(v: unknown): "buy" | "rent" | null {
  if (typeof v !== "string") return null;
  const lower = v.toLowerCase().trim();
  if (VALID_GOAL.has(lower)) return lower as "buy" | "rent";
  if (/ซื้อ|buy|purchase/i.test(v)) return "buy";
  if (/เช่า|rent/i.test(v)) return "rent";
  return null;
}

function sanitizeIntent(i: ParsedIntent): ParsedIntent {
  const out = { ...i };
  out.search_goal = coerceGoal(out.search_goal);
  out.property_types = (Array.isArray(out.property_types) ? out.property_types : [])
    .map(coerceProperty)
    .filter((v): v is string => !!v) as ParsedIntent["property_types"];
  out.transit_preference = (Array.isArray(out.transit_preference) ? out.transit_preference : [])
    .filter((v) => typeof v === "string" && VALID_TRANSIT.has(v.toUpperCase()))
    .map((v) => (v as string).toUpperCase()) as ParsedIntent["transit_preference"];
  out.view_preference = (Array.isArray(out.view_preference) ? out.view_preference : [])
    .filter((v) => typeof v === "string" && VALID_VIEW.has(v)) as ParsedIntent["view_preference"];
  if (out.floor_preference && !VALID_FLOOR.has(out.floor_preference)) {
    out.floor_preference = null;
  }
  if (out.furnishing_preference && !VALID_FURNISHING.has(out.furnishing_preference)) {
    out.furnishing_preference = null;
  }
  return out;
}

// ─── Deterministic fallback state machine ─────────────────────────────────
//
// Used when Gemini is unavailable. Produces natural-sounding Thai but follows
// a fixed priority order. Inferior to the LLM but never errors out.

import { parsePropertyIntent } from "./intent-parser";

const GREETING_RESPONSES = [
  "สวัสดีครับ! กำลังมองหาที่อยู่อาศัยแบบไหนอยู่ในใจหรือเปล่าครับ 😊",
  "สวัสดีครับ ผมยินดีช่วยหาบ้าน/คอนโดที่ใช่ให้คุณเลย เริ่มจากคุณกำลังมองอะไรอยู่ครับ?",
];

const ACK_PHRASES = ["ได้เลยครับ", "เข้าใจแล้วครับ", "โอเคครับ", "เยี่ยมครับ"];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function fallbackAgentTurn(
  history: AgentTurn[],
  currentIntent: ParsedIntent
): Promise<AgentDecision> {
  const lastUser = [...history].reverse().find((m) => m.role === "user");
  const userTurns = history.filter((m) => m.role === "user").length;

  // First turn — greet
  if (history.length === 0 || (userTurns === 0 && history.length === 0)) {
    return {
      reply: pickRandom(GREETING_RESPONSES),
      quick_replies: ["🏠 หาคอนโด", "🏡 หาบ้าน", "🌍 หาที่ดิน"],
      intent: currentIntent,
      next_action: "continue",
      fallback: true,
    };
  }

  // Update intent from latest user message
  const newIntent = lastUser
    ? await parsePropertyIntent(lastUser.content, currentIntent)
    : currentIntent;

  const isGreetingOnly = lastUser && /^(สวัสดี|hi|hello|เฮ(ล)?โล)/i.test(lastUser.content.trim());
  if (isGreetingOnly) {
    return {
      reply: "สวัสดีครับ! บอกผมได้เลยว่าสนใจที่อยู่อาศัยแบบไหน ซื้อหรือเช่า มีย่านที่ชอบไหมครับ?",
      quick_replies: ["💰 ซื้อ", "🔑 เช่า", "🤔 ดูทั้งสอง"],
      intent: newIntent,
      next_action: "continue",
      fallback: true,
    };
  }

  const ack = pickRandom(ACK_PHRASES);
  const missing = newIntent.missing_required_fields;

  // Force search if user said "ค้นเลย" / "พอแล้ว"
  if (lastUser && /(ค้นเลย|ดูเลย|พอแล้ว|ดูผลลัพธ์)/i.test(lastUser.content)) {
    return {
      reply: `${ack} กำลังค้นหาให้นะครับ ✨`,
      quick_replies: [],
      intent: newIntent,
      next_action: "ready_to_search",
      fallback: true,
    };
  }

  // Ask the next missing field — natural phrasing
  if (missing.includes("search_goal")) {
    return {
      reply: `${ack} ก่อนอื่นขอถามนิดนึง — สนใจแบบ "ซื้อ" หรือ "เช่า" ครับ?`,
      quick_replies: ["💰 ซื้อ", "🔑 เช่า", "🤔 ดูทั้งสอง"],
      intent: newIntent,
      next_action: "continue",
      fallback: true,
    };
  }

  if (missing.includes("location")) {
    return {
      reply: `${ack} แล้วทำเลที่อยากได้ มีย่านในใจไหมครับ หรือเอาใกล้รถไฟฟ้าสายไหนเป็นพิเศษ?`,
      quick_replies: ["ใกล้ BTS", "ใกล้ MRT", "ใจกลางเมือง", "ชานเมือง"],
      intent: newIntent,
      next_action: "continue",
      fallback: true,
    };
  }

  if (missing.includes("budget")) {
    const isRent = newIntent.search_goal === "rent";
    const replies = isRent
      ? ["≤15,000", "15-25k", "25-40k", ">40k"]
      : ["≤3 ล้าน", "3-5 ล้าน", "5-10 ล้าน", ">10 ล้าน"];
    return {
      reply: `${ack} แล้วเรื่องงบประมาณ${isRent ? "ต่อเดือน" : ""}คิดไว้ประมาณเท่าไหร่ดีครับ?`,
      quick_replies: replies,
      intent: newIntent,
      next_action: "continue",
      fallback: true,
    };
  }

  // Have core fields — ask one bonus question if amenities/vibe both empty,
  // otherwise wrap up.
  const noExtras =
    newIntent.required_amenities.length === 0 &&
    newIntent.nice_to_have_amenities.length === 0 &&
    newIntent.neighborhood_vibe.length === 0;

  if (noExtras && userTurns < 4) {
    return {
      reply: `${ack} แล้วเรื่องสิ่งอำนวยความสะดวก อยากได้อะไรเพิ่มไหมครับ เช่น สระ ฟิตเนส เลี้ยงสัตว์ได้?`,
      quick_replies: ["มีสระ", "ฟิตเนส", "Pet-friendly", "ดูผลลัพธ์เลย"],
      intent: newIntent,
      next_action: "continue",
      fallback: true,
    };
  }

  // Ready to search
  return {
    reply: `${ack} ผมเช็คให้แล้ว เดี๋ยวแสดงผลที่ตรงเงื่อนไขให้ดูเลยนะครับ ✨`,
    quick_replies: [],
    intent: newIntent,
    next_action: "ready_to_search",
    fallback: true,
  };
}

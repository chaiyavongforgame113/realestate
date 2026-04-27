"use client";

import { Sparkles, ChevronDown, ChevronUp, Bookmark, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Badge } from "../ui/badge";

export interface ParsedChips {
  search_goal?: "buy" | "rent" | null;
  property_types?: string[];
  budget_max?: number | null;
  bedrooms?: number | null;
  preferred_stations?: string[];
  preferred_districts?: string[];
  // ── Enriched signals (Phase 1+) ──────────────────────────────
  required_amenities?: string[];
  nice_to_have_amenities?: string[];
  neighborhood_vibe?: string[];
  nearby_poi?: string[];
  view_preference?: string[];
  floor_preference?: "high" | "low" | "any" | null;
  building_age_max_years?: number | null;
  max_distance_to_transit_m?: number | null;
  raw_keywords?: string[];
  /** When AI relaxed constraints to find matches, list what was relaxed. */
  relaxed?: { key: string; label: string }[];
}

const AMENITY_LABEL: Record<string, string> = {
  pool: "สระ", gym: "ฟิตเนส", sauna: "ซาวน่า", garden: "สวน", playground: "สนามเด็กเล่น",
  kids_room: "ห้องเด็ก", co_working: "Co-working", library: "ห้องสมุด",
  parking: "ที่จอดรถ", ev_charger: "EV Charger", security_24h: "รปภ. 24ชม.",
  cctv: "CCTV", key_card: "Key Card", elevator: "ลิฟต์", pet_friendly: "Pet Friendly",
  concierge: "Concierge", shuttle: "รถรับส่ง", laundry: "ซักรีด", rooftop: "Rooftop",
  river_view: "วิวแม่น้ำ", city_view: "วิวเมือง", park_view: "วิวสวน",
};

const VIBE_LABEL: Record<string, string> = {
  central: "ใจกลางเมือง", quiet: "เงียบสงบ", nightlife: "ไนท์ไลฟ์", family: "ครอบครัว",
  investment_hot: "ทำเลทอง", green: "พื้นที่สีเขียว", walkable: "เดินสะดวก",
  shopping_district: "ย่านช้อปปิ้ง", education_hub: "ย่านการศึกษา", medical_hub: "ใกล้รพ.",
};

const POI_LABEL: Record<string, string> = {
  transit: "ขนส่งสาธารณะ", school: "โรงเรียน", international_school: "โรงเรียนนานาชาติ",
  university: "มหาวิทยาลัย", hospital: "โรงพยาบาล", food: "ร้านอาหาร",
  shopping: "ห้าง/ตลาด", park: "สวน", office_district: "ย่านออฟฟิศ",
};

const VIEW_LABEL: Record<string, string> = {
  city: "วิวเมือง", river: "วิวแม่น้ำ", park: "วิวสวน", garden: "วิวสวนโครงการ", any: "วิวใดก็ได้",
};

export function AIInterpretation({
  interpreted,
  chips,
  resultCount,
  onSave,
  saved,
}: {
  interpreted: string;
  chips: ParsedChips;
  resultCount: number;
  onSave?: () => void;
  saved?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const chipItems: { label: string; tone?: "brand" | "accent" | "neutral" }[] = [];
  if (chips.search_goal) chipItems.push({ label: chips.search_goal === "buy" ? "ซื้อ" : "เช่า", tone: "brand" });
  if (chips.property_types?.length)
    chips.property_types.forEach((t) => chipItems.push({ label: t, tone: "neutral" }));
  if (chips.budget_max)
    chipItems.push({ label: `ไม่เกิน ${chips.budget_max.toLocaleString()}`, tone: "accent" });
  if (chips.bedrooms) chipItems.push({ label: `${chips.bedrooms} ห้องนอน`, tone: "neutral" });
  chips.preferred_stations?.forEach((s) => chipItems.push({ label: s, tone: "neutral" }));
  chips.preferred_districts?.forEach((d) => chipItems.push({ label: d, tone: "neutral" }));
  chips.required_amenities?.forEach((a) =>
    chipItems.push({ label: `ต้องมี ${AMENITY_LABEL[a] ?? a}`, tone: "brand" })
  );
  chips.nice_to_have_amenities?.forEach((a) =>
    chipItems.push({ label: `อยากได้ ${AMENITY_LABEL[a] ?? a}`, tone: "neutral" })
  );
  chips.neighborhood_vibe?.forEach((v) =>
    chipItems.push({ label: VIBE_LABEL[v] ?? v, tone: "accent" })
  );
  chips.nearby_poi?.forEach((p) =>
    chipItems.push({ label: `ใกล้ ${POI_LABEL[p] ?? p}`, tone: "neutral" })
  );
  chips.view_preference?.forEach((v) =>
    chipItems.push({ label: VIEW_LABEL[v] ?? v, tone: "neutral" })
  );
  if (chips.floor_preference === "high") chipItems.push({ label: "ชั้นสูง", tone: "neutral" });
  if (chips.floor_preference === "low") chipItems.push({ label: "ชั้นล่าง", tone: "neutral" });
  if (chips.max_distance_to_transit_m)
    chipItems.push({ label: `เดินถึงสถานี ≤${chips.max_distance_to_transit_m}ม.`, tone: "neutral" });
  if (chips.building_age_max_years !== null && chips.building_age_max_years !== undefined) {
    chipItems.push({
      label:
        chips.building_age_max_years === 0
          ? "มือหนึ่ง"
          : `อายุ ≤${chips.building_age_max_years} ปี`,
      tone: "neutral",
    });
  }
  chips.raw_keywords?.forEach((k) => chipItems.push({ label: `"${k}"`, tone: "neutral" }));

  return (
    <div className="relative overflow-hidden rounded-2xl border border-brand-100 bg-gradient-to-r from-brand-50 via-white to-accent-50 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-soft">
          <Sparkles className="h-4 w-4" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-800">
              AI ตีความเป็น
            </span>
            <span className="h-1 w-1 rounded-full bg-brand-400" />
            <span className="text-xs font-medium text-ink-muted">
              พบ {resultCount.toLocaleString()} ผลลัพธ์
            </span>
          </div>

          <p className="mt-1 text-[15px] font-medium text-ink">{interpreted}</p>

          {chips.relaxed && chips.relaxed.length > 0 && (
            <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2 text-xs text-amber-900 dark:border-amber-700/40 dark:bg-amber-900/20 dark:text-amber-200">
              <span className="font-semibold">ไม่พบที่ตรงเป๊ะ — ปรับเงื่อนไข: </span>
              {chips.relaxed.map((r) => r.label).join(" · ")}
            </div>
          )}

          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {chipItems.map((c, i) => (
                    <Badge key={i} tone={c.tone ?? "neutral"}>
                      {c.label}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-1">
          {onSave && (
            <button
              onClick={onSave}
              disabled={saved}
              className={`inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-medium transition-colors ${
                saved
                  ? "bg-brand-100 text-brand-900"
                  : "bg-white/70 text-brand-700 hover:bg-white"
              }`}
            >
              {saved ? <Check className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
              {saved ? "บันทึกแล้ว" : "บันทึกการค้นหา"}
            </button>
          )}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-medium text-brand-700 hover:bg-white/60"
          >
            {expanded ? "ซ่อน" : "ดูรายละเอียด"}
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

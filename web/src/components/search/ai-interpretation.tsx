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
}

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

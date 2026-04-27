"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  Train,
  Building,
  GraduationCap,
  ShoppingCart,
  Coffee,
  Stethoscope,
  TreePine,
  Footprints,
  Bus,
  Loader2,
  Sparkles,
} from "lucide-react";
import type { SampleListing } from "@/lib/sample-data";

type AmenityCategory =
  | "transit"
  | "school"
  | "international_school"
  | "university"
  | "hospital"
  | "food"
  | "shopping"
  | "mall"
  | "park"
  | "office";

type ListingInsights = {
  walkScore: number;
  transitScore: number;
  poiCounts: Record<AmenityCategory, number>;
  nearbyHighlights: { name: string; category: AmenityCategory; distanceMeters: number }[];
  vibeTags: string[];
  computedAt: string;
};

const VIBE_TH: Record<string, string> = {
  central: "ใจกลางเมือง",
  quiet: "เงียบสงบ",
  nightlife: "ไนท์ไลฟ์",
  family: "ครอบครัว",
  investment_hot: "ทำเลทอง",
  green: "พื้นที่สีเขียว",
  walkable: "เดินสะดวก",
  shopping_district: "ย่านช้อปปิ้ง",
  education_hub: "ย่านการศึกษา",
  medical_hub: "ใกล้รพ.",
};

function ScoreBar({
  label,
  score,
  icon: Icon,
  delay,
}: {
  label: string;
  score: number;
  icon: typeof Footprints;
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <div ref={ref} className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium text-ink-soft">{label}</span>
          <span className="text-xs font-bold text-brand-700 dark:text-brand-300">{score}/100</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-surface-sunken">
          <motion.div
            initial={{ width: 0 }}
            animate={inView ? { width: `${score}%` } : { width: 0 }}
            transition={{ duration: 1, delay, ease: [0.2, 0.8, 0.2, 1] }}
            className="h-full rounded-full bg-gradient-brand"
          />
        </div>
      </div>
    </div>
  );
}

const CAT_META: { key: AmenityCategory; label: string; icon: typeof Footprints; combine?: AmenityCategory[] }[] = [
  { key: "hospital", label: "โรงพยาบาล", icon: Stethoscope },
  { key: "school", label: "โรงเรียน/รร.นานาชาติ", icon: GraduationCap, combine: ["school", "international_school", "university"] },
  { key: "mall", label: "ห้าง/ดีพาร์ทเมนต์", icon: ShoppingCart, combine: ["mall", "shopping"] },
  { key: "food", label: "คาเฟ่/ร้านอาหาร", icon: Coffee },
  { key: "park", label: "สวนสาธารณะ", icon: TreePine },
  { key: "transit", label: "ขนส่งสาธารณะ", icon: Building },
];

export function NeighborhoodInsights({ listing }: { listing: SampleListing }) {
  const [data, setData] = useState<ListingInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);
    fetch(`/api/listings/${listing.id}/insights`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((j) => {
        if (j.error) throw new Error(j.error);
        setData(j.insights);
      })
      .catch((e) => {
        if (e?.name !== "AbortError") setError("โหลดข้อมูลย่านไม่สำเร็จ");
      })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [listing.id]);

  return (
    <div className="rounded-3xl border border-line bg-white p-6 shadow-card dark:bg-surface-raised md:p-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">
          สิ่งที่อยู่รอบๆ (รัศมี 3 กม.)
        </p>
        <h3 className="mt-1 font-display text-xl font-bold text-ink">Neighborhood Insights</h3>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-10 text-sm text-ink-muted">
          <Loader2 className="h-4 w-4 animate-spin" /> กำลังคำนวณข้อมูลย่าน...
        </div>
      ) : error || !data ? (
        <div className="rounded-2xl bg-surface-sunken p-4 text-sm text-ink-muted">
          {error ?? "ยังไม่มีข้อมูลย่านสำหรับทรัพย์นี้"}
        </div>
      ) : (
        <>
          {/* Transit info — uses listing-level data which is more accurate (BTS/MRT name) */}
          {listing.nearestTransit && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl bg-brand-50/70 p-4 dark:bg-brand-900/20">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-soft">
                <Train className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-ink">{listing.nearestTransit}</div>
                <div className="text-sm text-ink-muted">
                  {listing.transitDistance ?? "—"} ม. · เดิน{" "}
                  {Math.max(1, Math.round((listing.transitDistance ?? 0) / 80))} นาที
                </div>
              </div>
            </div>
          )}

          {/* Vibe tags */}
          {data.vibeTags.length > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-700" />
              {data.vibeTags.map((v) => (
                <span
                  key={v}
                  className="rounded-full border border-brand-200 bg-brand-50/60 px-3 py-1 text-xs font-medium text-brand-800 dark:border-brand-700/40 dark:bg-brand-900/30 dark:text-brand-200"
                >
                  {VIBE_TH[v] ?? v}
                </span>
              ))}
            </div>
          )}

          {/* POI counts */}
          <div className="mb-6 grid grid-cols-3 gap-3">
            {CAT_META.map((c, i) => (
              <motion.div
                key={c.key}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className="group flex flex-col items-center rounded-2xl border border-line bg-surface p-3 text-center transition-all hover:border-brand-200 hover:shadow-soft dark:hover:border-brand-700/40"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-sunken text-ink-muted transition-all group-hover:bg-brand-50 group-hover:text-brand-700 dark:group-hover:bg-brand-900/30 dark:group-hover:text-brand-300">
                  <c.icon className="h-4 w-4" />
                </div>
                <div className="mt-2 font-display text-lg font-bold text-ink">
                  {(c.combine ?? [c.key]).reduce(
                    (sum, k) => sum + (data.poiCounts[k] ?? 0),
                    0
                  )}
                </div>
                <div className="text-[10px] text-ink-muted">{c.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Highlights */}
          {data.nearbyHighlights.length > 0 && (
            <div className="mb-6 space-y-1.5">
              <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-ink-muted">
                ใกล้คุณที่สุด
              </div>
              {data.nearbyHighlights.slice(0, 5).map((h) => (
                <div
                  key={`${h.name}-${h.distanceMeters}`}
                  className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 hover:bg-surface-sunken"
                >
                  <div className="min-w-0 truncate text-sm text-ink">{h.name}</div>
                  <div className="shrink-0 text-xs font-medium text-ink-muted">
                    {h.distanceMeters < 1000
                      ? `${h.distanceMeters} ม.`
                      : `${(h.distanceMeters / 1000).toFixed(1)} กม.`}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Scores */}
          <div className="space-y-3">
            <ScoreBar label="Walk Score" score={data.walkScore} icon={Footprints} delay={0.2} />
            <ScoreBar
              label="Transit Score"
              score={data.transitScore}
              icon={Bus}
              delay={0.35}
            />
          </div>
        </>
      )}
    </div>
  );
}

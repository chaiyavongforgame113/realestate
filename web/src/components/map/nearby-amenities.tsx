"use client";

import { useEffect, useMemo, useState } from "react";
import { Train, GraduationCap, Hospital, UtensilsCrossed, ShoppingBag, Trees, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Amenity, AmenityCategory } from "@/lib/map/overpass";

const CATS: {
  key: AmenityCategory;
  label: string;
  Icon: typeof Train;
  color: string;
}[] = [
  { key: "transit", label: "ขนส่งสาธารณะ", Icon: Train, color: "text-blue-700 bg-blue-50 dark:bg-blue-900/40 dark:text-blue-200" },
  { key: "school", label: "โรงเรียน/ม.", Icon: GraduationCap, color: "text-emerald-700 bg-emerald-50 dark:bg-emerald-900/40 dark:text-emerald-200" },
  { key: "hospital", label: "โรงพยาบาล", Icon: Hospital, color: "text-rose-700 bg-rose-50 dark:bg-rose-900/40 dark:text-rose-200" },
  { key: "food", label: "อาหาร/คาเฟ่", Icon: UtensilsCrossed, color: "text-orange-700 bg-orange-50 dark:bg-orange-900/40 dark:text-orange-200" },
  { key: "shopping", label: "ช้อปปิ้ง", Icon: ShoppingBag, color: "text-violet-700 bg-violet-50 dark:bg-violet-900/40 dark:text-violet-200" },
  { key: "park", label: "สวน/พักผ่อน", Icon: Trees, color: "text-teal-700 bg-teal-50 dark:bg-teal-900/40 dark:text-teal-200" },
];

function formatDistance(m: number) {
  if (m < 1000) return `${Math.round(m)} ม.`;
  return `${(m / 1000).toFixed(1)} กม.`;
}

export function NearbyAmenities({ lat, lng, radius = 1200 }: { lat: number; lng: number; radius?: number }) {
  const [items, setItems] = useState<Amenity[]>([]);
  const [active, setActive] = useState<AmenityCategory>("transit");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);
    fetch(`/api/amenities?lat=${lat}&lng=${lng}&radius=${radius}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((j) => {
        if (j.error) throw new Error(j.error);
        setItems(j.items ?? []);
      })
      .catch((e) => {
        if (e?.name !== "AbortError") setError("โหลดไม่สำเร็จ");
      })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [lat, lng, radius]);

  const bucketed = useMemo(() => {
    const map = new Map<AmenityCategory, Amenity[]>();
    for (const c of CATS) map.set(c.key, []);
    for (const it of items) {
      const arr = map.get(it.category);
      if (arr) arr.push(it);
    }
    return map;
  }, [items]);

  const filtered = (bucketed.get(active) ?? []).slice(0, 10);

  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-soft md:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-ink">สถานที่ใกล้เคียง</h3>
        <span className="text-xs text-ink-muted">ภายใน {Math.round(radius)} ม.</span>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        {CATS.map((c) => {
          const count = bucketed.get(c.key)?.length ?? 0;
          const isActive = active === c.key;
          return (
            <button
              key={c.key}
              onClick={() => setActive(c.key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                isActive
                  ? "border-brand-600 bg-brand-50 text-brand-800 dark:bg-brand-900/50 dark:text-brand-100 dark:border-brand-700"
                  : "border-line bg-surface text-ink-muted hover:text-ink"
              )}
            >
              <c.Icon className="h-3.5 w-3.5" />
              {c.label}
              <span className={cn("rounded-full px-1.5 text-[10px] font-semibold", isActive ? "bg-brand-700 text-white" : "bg-surface-sunken text-ink-muted")}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="mt-4 space-y-1.5">
        {loading ? (
          <div className="flex items-center gap-2 py-6 text-sm text-ink-muted">
            <Loader2 className="h-4 w-4 animate-spin" /> กำลังค้นหา POI...
          </div>
        ) : error ? (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-200">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-6 text-center text-sm text-ink-muted">
            ไม่พบใน {Math.round(radius)} ม.
          </div>
        ) : (
          filtered.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 hover:bg-surface-sunken"
            >
              <div className="min-w-0 truncate text-sm text-ink">{a.name}</div>
              <div className="shrink-0 text-xs font-medium text-ink-muted">
                {formatDistance(a.distanceMeters)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

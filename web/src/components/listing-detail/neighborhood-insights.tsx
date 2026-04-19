"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
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
} from "lucide-react";
import type { SampleListing } from "@/lib/sample-data";

// Simple deterministic hash-based pseudo-random from a string seed
function seededRandom(seed: string, index: number): number {
  let hash = 0;
  const str = seed + String(index);
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return ((hash & 0x7fffffff) % 1000) / 1000; // 0..0.999
}

function seededInt(seed: string, index: number, min: number, max: number) {
  return Math.floor(seededRandom(seed, index) * (max - min + 1)) + min;
}

// Mock nearby data — in production this would come from an API
function getNearbyData(listing: SampleListing) {
  const seed = listing.id;
  return {
    transit: {
      name: listing.nearestTransit ?? "BTS อ่อนนุช",
      distance: listing.transitDistance ?? 450,
      walkMinutes: Math.round((listing.transitDistance ?? 450) / 80),
    },
    walkScore: seededInt(seed, 0, 75, 94),
    transitScore: seededInt(seed, 1, 80, 94),
    amenities: [
      { icon: Stethoscope, label: "โรงพยาบาล", count: seededInt(seed, 2, 2, 4) },
      { icon: GraduationCap, label: "โรงเรียน", count: seededInt(seed, 3, 3, 7) },
      { icon: ShoppingCart, label: "ห้าง/มาร์เก็ต", count: seededInt(seed, 4, 4, 9) },
      { icon: Coffee, label: "คาเฟ่/ร้านอาหาร", count: seededInt(seed, 5, 8, 17) },
      { icon: TreePine, label: "สวนสาธารณะ", count: seededInt(seed, 6, 1, 2) },
      { icon: Building, label: "ออฟฟิศ", count: seededInt(seed, 7, 5, 12) },
    ],
  };
}

function ScoreBar({ label, score, icon: Icon, delay }: { label: string; score: number; icon: typeof Footprints; delay: number }) {
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

export function NeighborhoodInsights({ listing }: { listing: SampleListing }) {
  const data = getNearbyData(listing);

  return (
    <div className="rounded-3xl border border-line bg-white p-6 shadow-card dark:bg-surface-raised md:p-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">
          สิ่งที่อยู่รอบๆ
        </p>
        <h3 className="mt-1 font-display text-xl font-bold text-ink">
          Neighborhood Insights
        </h3>
      </div>

      {/* Transit info */}
      <div className="mb-6 flex items-center gap-3 rounded-2xl bg-brand-50/70 p-4 dark:bg-brand-900/20">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-soft">
          <Train className="h-5 w-5" />
        </div>
        <div>
          <div className="font-semibold text-ink">{data.transit.name}</div>
          <div className="text-sm text-ink-muted">
            {data.transit.distance} ม. · เดิน {data.transit.walkMinutes} นาที
          </div>
        </div>
      </div>

      {/* Amenity grid */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        {data.amenities.map((a, i) => (
          <motion.div
            key={a.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
            className="group flex flex-col items-center rounded-2xl border border-line bg-surface p-3 text-center transition-all hover:border-brand-200 hover:shadow-soft dark:hover:border-brand-700/40"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-sunken text-ink-muted transition-all group-hover:bg-brand-50 group-hover:text-brand-700 dark:group-hover:bg-brand-900/30 dark:group-hover:text-brand-300">
              <a.icon className="h-4 w-4" />
            </div>
            <div className="mt-2 font-display text-lg font-bold text-ink">{a.count}</div>
            <div className="text-[10px] text-ink-muted">{a.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Scores */}
      <div className="space-y-3">
        <ScoreBar label="Walk Score" score={data.walkScore} icon={Footprints} delay={0.2} />
        <ScoreBar label="Transit Score" score={data.transitScore} icon={Bus} delay={0.35} />
      </div>
    </div>
  );
}

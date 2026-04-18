"use client";

import { motion } from "framer-motion";
import { formatPrice } from "@/lib/utils";

export type CompareMetric = {
  key: string;
  label: string;
  unit?: string;
  values: { id: string; label: string; value: number; color?: string }[];
  formatter?: (v: number) => string;
};

const DEFAULT_COLORS = ["#dc2626", "#f59e0b", "#10b981", "#3b82f6"];

/**
 * Simple comparative horizontal bar chart — pure SVG, no chart lib.
 * Reveals bars on scroll with spring animation.
 */
export function CompareChart({ metric }: { metric: CompareMetric }) {
  const max = Math.max(...metric.values.map((v) => v.value), 1);

  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-soft md:p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <h4 className="font-display text-sm font-semibold text-ink">{metric.label}</h4>
        {metric.unit && <span className="text-xs text-ink-muted">{metric.unit}</span>}
      </div>
      <div className="space-y-2.5">
        {metric.values.map((v, i) => {
          const pct = (v.value / max) * 100;
          const color = v.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length];
          const formatted = metric.formatter ? metric.formatter(v.value) : v.value.toLocaleString();
          return (
            <div key={v.id}>
              <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                <span className="truncate text-ink-soft">{v.label}</span>
                <span className="font-semibold tabular-nums text-ink">{formatted}</span>
              </div>
              <div className="relative h-2 overflow-hidden rounded-full bg-surface-sunken">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${pct}%` }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.08,
                    ease: [0.2, 0.8, 0.2, 1],
                  }}
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${color} 0%, ${color}aa 100%)`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Builder helper — pass listings, get a grid of common metrics. */
export function buildListingMetrics(
  listings: Array<{
    id: string;
    title: string;
    price: number;
    priceUnit: string;
    usableArea: number;
    bedrooms: number;
    bathrooms: number;
  }>
): CompareMetric[] {
  const safeLabel = (t: string, i: number) => t.slice(0, 18) || `รายการ ${i + 1}`;
  return [
    {
      key: "price",
      label: "ราคา",
      values: listings.map((l, i) => ({
        id: l.id,
        label: safeLabel(l.title, i),
        value: l.price,
      })),
      formatter: (v) => formatPrice(v, "total"),
    },
    {
      key: "ppsqm",
      label: "ราคา / ตร.ม.",
      unit: "บาท",
      values: listings.map((l, i) => ({
        id: l.id,
        label: safeLabel(l.title, i),
        value: l.priceUnit === "total" ? Math.round(l.price / Math.max(1, l.usableArea)) : 0,
      })),
      formatter: (v) => `฿${v.toLocaleString()}`,
    },
    {
      key: "area",
      label: "พื้นที่ใช้สอย",
      unit: "ตร.ม.",
      values: listings.map((l, i) => ({
        id: l.id,
        label: safeLabel(l.title, i),
        value: l.usableArea,
      })),
    },
    {
      key: "bedrooms",
      label: "ห้องนอน",
      values: listings.map((l, i) => ({
        id: l.id,
        label: safeLabel(l.title, i),
        value: l.bedrooms,
      })),
    },
  ];
}

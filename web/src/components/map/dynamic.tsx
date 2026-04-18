"use client";

import dynamic from "next/dynamic";

export const DynamicMapView = dynamic(
  () => import("./map-view").then((m) => m.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-80 items-center justify-center rounded-xl border border-line bg-surface-sunken text-sm text-ink-muted">
        กำลังโหลดแผนที่...
      </div>
    ),
  }
);

export const DynamicMapPicker = dynamic(
  () => import("./map-picker").then((m) => m.MapPicker),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-80 items-center justify-center rounded-xl border border-line bg-surface-sunken text-sm text-ink-muted">
        กำลังโหลดแผนที่...
      </div>
    ),
  }
);

export const DynamicPriceHeatmap = dynamic(
  () => import("./price-heatmap").then((m) => m.PriceHeatmap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[480px] items-center justify-center rounded-2xl border border-line bg-surface-sunken text-sm text-ink-muted">
        กำลังโหลด heatmap...
      </div>
    ),
  }
);

export const DynamicCommuteFilter = dynamic(
  () => import("./commute-filter").then((m) => m.CommuteFilter),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[520px] items-center justify-center rounded-2xl border border-line bg-surface-sunken text-sm text-ink-muted">
        กำลังโหลด commute filter...
      </div>
    ),
  }
);

export const DynamicDrawSearch = dynamic(
  () => import("./draw-search").then((m) => m.DrawSearch),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[520px] items-center justify-center rounded-2xl border border-line bg-surface-sunken text-sm text-ink-muted">
        กำลังโหลดแผนที่...
      </div>
    ),
  }
);

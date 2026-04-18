"use client";

import { LayoutGrid, List, Map as MapIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewMode = "grid" | "list" | "map";
export type SortKey = "relevance" | "price_asc" | "price_desc" | "newest";

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "relevance", label: "ตรงความต้องการ" },
  { key: "newest", label: "ใหม่ล่าสุด" },
  { key: "price_asc", label: "ราคาต่ำสุด" },
  { key: "price_desc", label: "ราคาสูงสุด" },
];

export function ResultsToolbar({
  view,
  onViewChange,
  sort,
  onSortChange,
  totalCount,
}: {
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  sort: SortKey;
  onSortChange: (s: SortKey) => void;
  totalCount: number;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-ink-muted">
        พบ <span className="font-semibold text-ink">{totalCount.toLocaleString()}</span> รายการ
      </p>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs text-ink-muted">เรียง:</label>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortKey)}
            className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm font-medium text-ink focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          >
            {sortOptions.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center rounded-lg border border-line bg-white p-0.5">
          {[
            { key: "grid" as const, Icon: LayoutGrid, label: "Grid" },
            { key: "list" as const, Icon: List, label: "List" },
            { key: "map" as const, Icon: MapIcon, label: "Map" },
          ].map(({ key, Icon, label }) => (
            <button
              key={key}
              onClick={() => onViewChange(key)}
              title={label}
              className={cn(
                "flex h-8 w-9 items-center justify-center rounded-md transition-colors",
                view === key
                  ? "bg-ink text-white"
                  : "text-ink-muted hover:bg-surface-sunken hover:text-ink"
              )}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

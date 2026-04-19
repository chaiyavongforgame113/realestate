"use client";

import dynamic from "next/dynamic";

export const DynamicSearchMap = dynamic(
  () => import("./search-map").then((m) => m.SearchMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center rounded-2xl border border-line bg-surface-sunken">
        <div className="text-center">
          <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
          <p className="text-sm text-ink-muted">กำลังโหลดแผนที่...</p>
        </div>
      </div>
    ),
  }
);

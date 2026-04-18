"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterState {
  listingType: "all" | "sale" | "rent";
  propertyTypes: string[];
  priceMin: number;
  priceMax: number;
  bedrooms: number[];
  bathrooms: number[];
  amenities: string[];
  furnishing: string[];
}

const defaultState: FilterState = {
  listingType: "all",
  propertyTypes: [],
  priceMin: 0,
  priceMax: 20_000_000,
  bedrooms: [],
  bathrooms: [],
  amenities: [],
  furnishing: [],
};

const propertyOptions = [
  { key: "condo", label: "คอนโด" },
  { key: "house", label: "บ้านเดี่ยว" },
  { key: "townhouse", label: "ทาวน์เฮาส์" },
  { key: "land", label: "ที่ดิน" },
  { key: "commercial", label: "พาณิชย์" },
];

const amenityOptions = [
  "สระว่ายน้ำ",
  "ฟิตเนส",
  "รักษาความปลอดภัย 24 ชม.",
  "ที่จอดรถ",
  "สวน",
  "เครื่องปรับอากาศ",
  "ลิฟต์",
];

const furnishingOptions = [
  { key: "fully_furnished", label: "เฟอร์นิเจอร์ครบ" },
  { key: "partially_furnished", label: "เฟอร์นิเจอร์บางส่วน" },
  { key: "unfurnished", label: "ไม่มีเฟอร์นิเจอร์" },
];

function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-line py-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="font-display text-[15px] font-semibold text-ink">{title}</span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-ink-muted" />
        ) : (
          <ChevronDown className="h-4 w-4 text-ink-muted" />
        )}
      </button>
      {open && <div className="pt-3">{children}</div>}
    </div>
  );
}

function Pill({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
        active
          ? "border-brand-600 bg-brand-50 text-brand-800 shadow-soft"
          : "border-line bg-white text-ink-muted hover:border-brand-300 hover:text-ink"
      )}
    >
      {children}
    </button>
  );
}

function toggleFromArray<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
}

export function FilterSidebar() {
  const [state, setState] = useState<FilterState>(defaultState);

  const activeCount =
    (state.listingType !== "all" ? 1 : 0) +
    state.propertyTypes.length +
    state.bedrooms.length +
    state.bathrooms.length +
    state.amenities.length +
    state.furnishing.length +
    (state.priceMin > 0 || state.priceMax < 20_000_000 ? 1 : 0);

  return (
    <aside className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-line bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-bold text-ink">
          ตัวกรอง {activeCount > 0 && <span className="text-brand-700">({activeCount})</span>}
        </h3>
        <button
          onClick={() => setState(defaultState)}
          className="inline-flex items-center gap-1 text-xs font-medium text-ink-muted hover:text-brand-700"
        >
          <RotateCcw className="h-3 w-3" /> ล้าง
        </button>
      </div>

      <Section title="ประเภทธุรกรรม">
        <div className="flex gap-2">
          {[
            { key: "all", label: "ทั้งหมด" },
            { key: "sale", label: "ขาย" },
            { key: "rent", label: "เช่า" },
          ].map((o) => (
            <Pill
              key={o.key}
              active={state.listingType === o.key}
              onClick={() =>
                setState((s) => ({ ...s, listingType: o.key as FilterState["listingType"] }))
              }
            >
              {o.label}
            </Pill>
          ))}
        </div>
      </Section>

      <Section title="ประเภททรัพย์">
        <div className="flex flex-wrap gap-2">
          {propertyOptions.map((p) => (
            <Pill
              key={p.key}
              active={state.propertyTypes.includes(p.key)}
              onClick={() =>
                setState((s) => ({
                  ...s,
                  propertyTypes: toggleFromArray(s.propertyTypes, p.key),
                }))
              }
            >
              {p.label}
            </Pill>
          ))}
        </div>
      </Section>

      <Section title="ช่วงราคา (บาท)">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-[11px] font-medium text-ink-muted">ต่ำสุด</label>
              <input
                type="number"
                value={state.priceMin || ""}
                onChange={(e) => setState((s) => ({ ...s, priceMin: Number(e.target.value) || 0 }))}
                placeholder="0"
                className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <span className="mt-5 text-ink-subtle">—</span>
            <div className="flex-1">
              <label className="mb-1 block text-[11px] font-medium text-ink-muted">สูงสุด</label>
              <input
                type="number"
                value={state.priceMax < 20_000_000 ? state.priceMax : ""}
                onChange={(e) =>
                  setState((s) => ({ ...s, priceMax: Number(e.target.value) || 20_000_000 }))
                }
                placeholder="ไม่จำกัด"
                className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: "≤ 2 ล้าน", max: 2_000_000 },
              { label: "2-5 ล้าน", min: 2_000_000, max: 5_000_000 },
              { label: "5-10 ล้าน", min: 5_000_000, max: 10_000_000 },
              { label: "> 10 ล้าน", min: 10_000_000, max: 20_000_000 },
            ].map((q) => (
              <button
                key={q.label}
                onClick={() =>
                  setState((s) => ({ ...s, priceMin: q.min ?? 0, priceMax: q.max }))
                }
                className="rounded-full border border-line bg-white px-2.5 py-1 text-xs text-ink-muted transition-colors hover:border-brand-300 hover:text-brand-800"
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>
      </Section>

      <Section title="ห้องนอน">
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <Pill
              key={n}
              active={state.bedrooms.includes(n)}
              onClick={() =>
                setState((s) => ({ ...s, bedrooms: toggleFromArray(s.bedrooms, n) }))
              }
            >
              {n === 5 ? "5+" : n}
            </Pill>
          ))}
        </div>
      </Section>

      <Section title="ห้องน้ำ">
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((n) => (
            <Pill
              key={n}
              active={state.bathrooms.includes(n)}
              onClick={() =>
                setState((s) => ({ ...s, bathrooms: toggleFromArray(s.bathrooms, n) }))
              }
            >
              {n === 4 ? "4+" : n}
            </Pill>
          ))}
        </div>
      </Section>

      <Section title="เฟอร์นิเจอร์" defaultOpen={false}>
        <div className="space-y-2">
          {furnishingOptions.map((f) => (
            <label
              key={f.key}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1.5 hover:bg-surface-sunken"
            >
              <input
                type="checkbox"
                checked={state.furnishing.includes(f.key)}
                onChange={() =>
                  setState((s) => ({ ...s, furnishing: toggleFromArray(s.furnishing, f.key) }))
                }
                className="h-4 w-4 rounded border-line text-brand-600 focus:ring-brand-400"
              />
              <span className="text-sm text-ink-soft">{f.label}</span>
            </label>
          ))}
        </div>
      </Section>

      <Section title="สิ่งอำนวยความสะดวก" defaultOpen={false}>
        <div className="space-y-2">
          {amenityOptions.map((a) => (
            <label
              key={a}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1.5 hover:bg-surface-sunken"
            >
              <input
                type="checkbox"
                checked={state.amenities.includes(a)}
                onChange={() =>
                  setState((s) => ({ ...s, amenities: toggleFromArray(s.amenities, a) }))
                }
                className="h-4 w-4 rounded border-line text-brand-600 focus:ring-brand-400"
              />
              <span className="text-sm text-ink-soft">{a}</span>
            </label>
          ))}
        </div>
      </Section>
    </aside>
  );
}

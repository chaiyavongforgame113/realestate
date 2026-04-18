import { MapPin, Train, Navigation } from "lucide-react";
import type { SampleListing } from "@/lib/sample-data";
import { DynamicMapView } from "@/components/map/dynamic";

const BANGKOK_CENTER: [number, number] = [13.7563, 100.5018];

export function LocationMap({ listing }: { listing: SampleListing }) {
  const lat = listing.latitude ?? BANGKOK_CENTER[0];
  const lng = listing.longitude ?? BANGKOK_CENTER[1];

  return (
    <section className="rounded-2xl border border-line bg-white p-6 shadow-soft md:p-8">
      <h3 className="font-display text-lg font-bold text-ink">ที่ตั้งและการเดินทาง</h3>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-muted">
        <MapPin className="h-4 w-4 text-brand-600" />
        {listing.district}
      </p>

      <div className="mt-5">
        <DynamicMapView latitude={lat} longitude={lng} height={360} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
        {[
          {
            Icon: Train,
            label: listing.nearestTransit ?? "BTS อโศก",
            desc: `${listing.transitDistance ?? 180} เมตร (เดิน ${Math.max(1, Math.round((listing.transitDistance ?? 180) / 80))} นาที)`,
          },
          { Icon: Navigation, label: "Terminal 21", desc: "400 เมตร · ห้างสรรพสินค้า" },
          { Icon: Navigation, label: "โรงพยาบาลกรุงเทพ", desc: "1.2 กม." },
          { Icon: Navigation, label: "โรงเรียนนานาชาติ", desc: "800 เมตร" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-3 rounded-lg border border-line p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <item.Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-ink">{item.label}</div>
              <div className="text-xs text-ink-muted">{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Car, Footprints, Bus, Train, MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "walk" | "cycle" | "drive" | "transit";

const MODE_SPEED_KMH: Record<Mode, number> = {
  walk: 5,
  cycle: 15,
  drive: 35,
  transit: 28,
};

const MODE_LABEL: Record<Mode, { label: string; Icon: typeof Footprints }> = {
  walk: { label: "เดิน", Icon: Footprints },
  cycle: { label: "จักรยาน", Icon: Train },
  drive: { label: "ขับรถ", Icon: Car },
  transit: { label: "รถเมล์/BTS", Icon: Bus },
};

export type CommuteResult = {
  center: { lat: number; lng: number };
  mode: Mode;
  minutes: number;
  radiusMeters: number;
};

/**
 * CommuteFilter — click on the map to drop an anchor (work / school),
 * pick mode + minutes, and get a radius circle. Calls back with the shape
 * so parent can filter listings.
 *
 * Uses simple radial approximation (distance / avg speed) instead of calling
 * a routing API — reliable, free, and good enough for UX.
 */
export function CommuteFilter({
  defaultCenter = [13.7563, 100.5018],
  height = 520,
  onChange,
}: {
  defaultCenter?: [number, number];
  height?: number;
  onChange?: (r: CommuteResult | null) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const anchorRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  const [anchor, setAnchor] = useState<{ lat: number; lng: number } | null>(null);
  const [mode, setMode] = useState<Mode>("drive");
  const [minutes, setMinutes] = useState<number>(15);

  const radiusMeters = useMemo(() => (MODE_SPEED_KMH[mode] * 1000 * minutes) / 60, [
    mode,
    minutes,
  ]);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = L.map(ref.current).setView(defaultCenter, 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);

    const icon = L.divIcon({
      className: "anchor-pin",
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      html: `<div style="position:relative;width:40px;height:40px;">
        <div style="position:absolute;inset:4px;background:linear-gradient(135deg,#7f1d1d,#dc2626);border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 6px 16px rgba(185,28,28,0.4);"></div>
        <div style="position:absolute;left:50%;top:38%;transform:translate(-50%,-50%);width:14px;height:14px;border-radius:50%;background:white;"></div>
      </div>`,
    });

    map.on("click", (e) => {
      const p = { lat: e.latlng.lat, lng: e.latlng.lng };
      setAnchor(p);
      if (anchorRef.current) anchorRef.current.setLatLng(e.latlng);
      else anchorRef.current = L.marker(e.latlng, { icon }).addTo(map);
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      anchorRef.current = null;
      circleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update the circle as anchor/radius change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!anchor) {
      if (circleRef.current) {
        map.removeLayer(circleRef.current);
        circleRef.current = null;
      }
      onChange?.(null);
      return;
    }
    if (!circleRef.current) {
      circleRef.current = L.circle([anchor.lat, anchor.lng], {
        radius: radiusMeters,
        color: "#dc2626",
        weight: 2,
        fillColor: "#f87171",
        fillOpacity: 0.14,
      }).addTo(map);
    } else {
      circleRef.current.setLatLng([anchor.lat, anchor.lng]);
      circleRef.current.setRadius(radiusMeters);
    }
    onChange?.({ center: anchor, mode, minutes, radiusMeters });
  }, [anchor, radiusMeters, mode, minutes, onChange]);

  function reset() {
    setAnchor(null);
    if (anchorRef.current && mapRef.current) {
      mapRef.current.removeLayer(anchorRef.current);
      anchorRef.current = null;
    }
  }

  return (
    <div className="relative">
      <div
        ref={ref}
        className="overflow-hidden rounded-2xl border border-line"
        style={{ height }}
      />

      {/* Bottom sheet controls */}
      <div className="glass-card absolute inset-x-3 bottom-3 z-[400] p-3 shadow-lift md:left-auto md:right-3 md:w-80">
        {!anchor ? (
          <div className="flex items-center gap-2 text-sm text-ink">
            <MapPin className="h-4 w-4 text-brand-700" />
            คลิกบนแผนที่เพื่อวางจุดเริ่มต้น (บ้าน/ที่ทำงาน)
          </div>
        ) : (
          <>
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-widest text-brand-700">
                ช่วงเวลาเดินทาง
              </div>
              <button
                onClick={reset}
                className="text-ink-muted hover:text-ink"
                aria-label="ล้าง"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-1 rounded-xl bg-surface-sunken p-1">
              {(Object.keys(MODE_LABEL) as Mode[]).map((m) => {
                const { Icon, label } = MODE_LABEL[m];
                const active = mode === m;
                return (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={cn(
                      "flex flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-[11px] font-medium transition-all",
                      active
                        ? "bg-gradient-brand text-white shadow-soft"
                        : "text-ink-muted hover:text-ink"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="mt-3">
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-ink-muted">ไม่เกิน</span>
                <span className="font-display font-bold text-ink">
                  {minutes} นาที
                  <span className="ml-1 text-xs text-ink-muted">
                    (~{Math.round(radiusMeters / 100) / 10} กม.)
                  </span>
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={60}
                step={5}
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
                className="mt-1 w-full accent-brand-600"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

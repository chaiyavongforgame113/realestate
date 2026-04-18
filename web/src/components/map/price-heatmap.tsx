"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type HeatPoint = {
  lat: number;
  lng: number;
  pricePerSqm: number; // baht / sqm
};

/**
 * Price heatmap — buckets points into a coarse grid, computes median price
 * per cell, and paints colored circles. No external plugins required — we
 * compose from Leaflet primitives to keep the bundle small.
 */
export function PriceHeatmap({
  points,
  center = [13.7563, 100.5018], // Bangkok
  zoom = 12,
  height = 480,
  cellSize = 0.008, // ~800m
}: {
  points: HeatPoint[];
  center?: [number, number];
  zoom?: number;
  height?: number;
  cellSize?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const [hover, setHover] = useState<{
    lat: number;
    lng: number;
    median: number;
    count: number;
  } | null>(null);

  const grid = useMemo(() => computeGrid(points, cellSize), [points, cellSize]);
  const range = useMemo(() => {
    const values = Array.from(grid.values()).map((c) => c.median);
    if (!values.length) return { min: 0, max: 1 };
    return { min: Math.min(...values), max: Math.max(...values) };
  }, [grid]);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = L.map(ref.current, { scrollWheelZoom: true, zoomControl: true }).setView(
      center,
      zoom
    );
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!layerRef.current) return;
    layerRef.current.clearLayers();
    for (const cell of grid.values()) {
      const t = (cell.median - range.min) / Math.max(1, range.max - range.min);
      const color = heatColor(t);
      const circle = L.circle([cell.lat, cell.lng], {
        radius: cellSize * 60000, // meters approx
        color,
        weight: 0,
        fillColor: color,
        fillOpacity: 0.38,
      });
      circle.on("mouseover", () =>
        setHover({
          lat: cell.lat,
          lng: cell.lng,
          median: cell.median,
          count: cell.count,
        })
      );
      circle.on("mouseout", () => setHover(null));
      circle.addTo(layerRef.current!);
    }
  }, [grid, range, cellSize]);

  return (
    <div className="relative">
      <div
        ref={ref}
        className="overflow-hidden rounded-2xl border border-line"
        style={{ height }}
      />
      {/* Legend */}
      <div className="glass-card absolute bottom-3 left-3 z-[400] flex items-center gap-3 px-3 py-2 text-[11px] text-ink">
        <span className="font-semibold">฿/ตร.ม.</span>
        <div className="flex h-2 w-32 overflow-hidden rounded-full">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex-1" style={{ background: heatColor(i / 9) }} />
          ))}
        </div>
        <span className="text-ink-muted">
          {formatK(range.min)} – {formatK(range.max)}
        </span>
      </div>

      {hover && (
        <div className="glass-card pointer-events-none absolute right-3 top-3 z-[400] px-3 py-2 text-xs">
          <div className="font-semibold text-ink">
            ~฿{Math.round(hover.median).toLocaleString()}/ตร.ม.
          </div>
          <div className="text-ink-muted">{hover.count} ประกาศในพื้นที่</div>
        </div>
      )}
    </div>
  );
}

function computeGrid(points: HeatPoint[], cellSize: number) {
  const cells = new Map<
    string,
    { lat: number; lng: number; values: number[]; count: number; median: number }
  >();
  for (const p of points) {
    const la = Math.floor(p.lat / cellSize) * cellSize + cellSize / 2;
    const ln = Math.floor(p.lng / cellSize) * cellSize + cellSize / 2;
    const key = `${la.toFixed(5)}|${ln.toFixed(5)}`;
    const existing = cells.get(key);
    if (existing) {
      existing.values.push(p.pricePerSqm);
      existing.count += 1;
    } else {
      cells.set(key, {
        lat: la,
        lng: ln,
        values: [p.pricePerSqm],
        count: 1,
        median: p.pricePerSqm,
      });
    }
  }
  for (const c of cells.values()) {
    const sorted = [...c.values].sort((a, b) => a - b);
    c.median = sorted[Math.floor(sorted.length / 2)];
  }
  return cells;
}

function heatColor(t: number) {
  // t: 0..1 → green → amber → red
  const clamped = Math.max(0, Math.min(1, t));
  if (clamped < 0.5) {
    // green → amber
    const k = clamped / 0.5;
    const r = lerp(34, 245, k);
    const g = lerp(197, 158, k);
    const b = lerp(94, 11, k);
    return `rgb(${r},${g},${b})`;
  }
  // amber → red
  const k = (clamped - 0.5) / 0.5;
  const r = lerp(245, 220, k);
  const g = lerp(158, 38, k);
  const b = lerp(11, 38, k);
  return `rgb(${r},${g},${b})`;
}

function lerp(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t);
}

function formatK(v: number) {
  if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
  return `${Math.round(v)}`;
}

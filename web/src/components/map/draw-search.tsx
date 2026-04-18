"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Pencil, X, Check } from "lucide-react";

export type LatLng = { lat: number; lng: number };

/**
 * DrawSearch — lets the user draw a freehand polygon on the map by holding
 * the mouse/finger. Polygon points are passed to `onFinish`. No extra deps
 * (we don't pull in leaflet-draw to keep bundle light).
 */
export function DrawSearch({
  center = [13.7563, 100.5018],
  zoom = 12,
  height = 520,
  onFinish,
  markers = [],
}: {
  center?: [number, number];
  zoom?: number;
  height?: number;
  onFinish?: (polygon: LatLng[]) => void;
  markers?: { lat: number; lng: number; id: string; title?: string }[];
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const polyLayerRef = useRef<L.Polyline | L.Polygon | null>(null);
  const pointsRef = useRef<LatLng[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [hasShape, setHasShape] = useState(false);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = L.map(ref.current, { scrollWheelZoom: true }).setView(center, zoom);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);
    mapRef.current = map;

    markers.forEach((m) => {
      const icon = L.divIcon({
        className: "draw-pin",
        iconSize: [14, 14],
        html: `<div style="width:14px;height:14px;border-radius:50%;background:#dc2626;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
      });
      L.marker([m.lat, m.lng], { icon, title: m.title }).addTo(map);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Enable/disable draw mode. While drawing, we disable map dragging.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (drawing) {
      map.dragging.disable();
      map.doubleClickZoom.disable();
      map.getContainer().style.cursor = "crosshair";
    } else {
      map.dragging.enable();
      map.doubleClickZoom.enable();
      map.getContainer().style.cursor = "";
    }
  }, [drawing]);

  // Handle pointer events on map
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    let active = false;

    const onDown = (e: L.LeafletMouseEvent) => {
      if (!drawing) return;
      active = true;
      pointsRef.current = [{ lat: e.latlng.lat, lng: e.latlng.lng }];
      if (polyLayerRef.current) {
        map.removeLayer(polyLayerRef.current);
        polyLayerRef.current = null;
      }
      polyLayerRef.current = L.polyline([e.latlng], {
        color: "#dc2626",
        weight: 3,
        opacity: 0.9,
        dashArray: "4 6",
      }).addTo(map);
    };
    const onMove = (e: L.LeafletMouseEvent) => {
      if (!drawing || !active || !polyLayerRef.current) return;
      pointsRef.current.push({ lat: e.latlng.lat, lng: e.latlng.lng });
      (polyLayerRef.current as L.Polyline).addLatLng(e.latlng);
    };
    const onUp = () => {
      if (!drawing || !active) return;
      active = false;
      const pts = pointsRef.current;
      if (pts.length < 3) {
        if (polyLayerRef.current) map.removeLayer(polyLayerRef.current);
        polyLayerRef.current = null;
        pointsRef.current = [];
        setHasShape(false);
        return;
      }
      // Close polygon visually
      if (polyLayerRef.current) map.removeLayer(polyLayerRef.current);
      polyLayerRef.current = L.polygon(pts, {
        color: "#dc2626",
        weight: 2.5,
        fillColor: "#f87171",
        fillOpacity: 0.18,
      }).addTo(map);
      setHasShape(true);
      setDrawing(false);
    };

    map.on("mousedown", onDown);
    map.on("mousemove", onMove);
    map.on("mouseup", onUp);
    map.on("mouseout", () => {
      if (active) onUp();
    });
    return () => {
      map.off("mousedown", onDown);
      map.off("mousemove", onMove);
      map.off("mouseup", onUp);
    };
  }, [drawing]);

  function startDraw() {
    setDrawing(true);
    setHasShape(false);
    if (polyLayerRef.current && mapRef.current) {
      mapRef.current.removeLayer(polyLayerRef.current);
      polyLayerRef.current = null;
    }
    pointsRef.current = [];
  }

  function clearDraw() {
    if (polyLayerRef.current && mapRef.current) {
      mapRef.current.removeLayer(polyLayerRef.current);
      polyLayerRef.current = null;
    }
    pointsRef.current = [];
    setHasShape(false);
    setDrawing(false);
  }

  function applyShape() {
    if (!pointsRef.current.length) return;
    onFinish?.(pointsRef.current);
  }

  return (
    <div className="relative">
      <div
        ref={ref}
        className="overflow-hidden rounded-2xl border border-line"
        style={{ height }}
      />
      <div className="absolute right-3 top-3 z-[400] flex flex-col gap-2">
        {!drawing && !hasShape && (
          <button
            onClick={startDraw}
            className="glass-card flex items-center gap-2 px-3 py-2 text-sm font-medium text-ink shadow-lift hover:text-brand-700"
          >
            <Pencil className="h-4 w-4" />
            วาดขอบเขต
          </button>
        )}
        {drawing && (
          <div className="glass-card flex items-center gap-2 px-3 py-2 text-sm font-medium text-brand-800 shadow-lift">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-brand-600" />
            ลากเพื่อวาด...
          </div>
        )}
        {hasShape && (
          <div className="flex flex-col gap-2">
            <button
              onClick={applyShape}
              className="flex items-center gap-2 rounded-xl bg-brand-700 px-3 py-2 text-sm font-semibold text-white shadow-lift hover:bg-brand-800"
            >
              <Check className="h-4 w-4" />
              ค้นหาในพื้นที่นี้
            </button>
            <button
              onClick={clearDraw}
              className="glass-card flex items-center gap-2 px-3 py-2 text-sm font-medium text-ink"
            >
              <X className="h-4 w-4" />
              ล้าง
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Point-in-polygon test — use on server or client to filter listings. */
export function pointInPolygon(point: LatLng, polygon: LatLng[]) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng,
      yi = polygon[i].lat;
    const xj = polygon[j].lng,
      yj = polygon[j].lat;
    const intersect =
      yi > point.lat !== yj > point.lat &&
      point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi + 1e-12) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

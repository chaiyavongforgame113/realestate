"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation } from "lucide-react";

const brandIcon = L.divIcon({
  className: "brand-pin",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  html: `<div style="position:relative;width:32px;height:32px;">
    <div style="position:absolute;inset:0;background:linear-gradient(135deg,#7f1d1d,#dc2626);border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 4px 12px rgba(185,28,28,0.45);"></div>
    <div style="position:absolute;left:50%;top:40%;transform:translate(-50%,-50%);width:12px;height:12px;border-radius:50%;background:white;"></div>
  </div>`,
});

export function MapPicker({
  lat,
  lng,
  onChange,
  height = 320,
}: {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
  height?: number;
}) {
  const [pos, setPos] = useState<[number, number]>([lat, lng]);
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = L.map(ref.current).setView([lat, lng], 14);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    const marker = L.marker([lat, lng], { icon: brandIcon, draggable: true }).addTo(map);
    markerRef.current = marker;
    mapRef.current = map;

    const onClick = (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      setPos([e.latlng.lat, e.latlng.lng]);
      onChangeRef.current(e.latlng.lat, e.latlng.lng);
    };
    map.on("click", onClick);
    marker.on("dragend", () => {
      const p = marker.getLatLng();
      setPos([p.lat, p.lng]);
      onChangeRef.current(p.lat, p.lng);
    });

    return () => {
      map.off("click", onClick);
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-2">
      <div
        ref={ref}
        className="cursor-crosshair overflow-hidden rounded-xl border border-line"
        style={{ height }}
      />
      <div className="flex items-center justify-between gap-3 rounded-lg bg-brand-50/60 px-3 py-2 text-xs">
        <div className="flex items-center gap-2 text-brand-900">
          <MapPin className="h-3.5 w-3.5" />
          <span className="font-medium">คลิกหรือลากหมุดเพื่อเลือกตำแหน่ง</span>
        </div>
        <span className="text-ink-muted">
          <Navigation className="mr-1 inline h-3 w-3" />
          {pos[0].toFixed(5)}, {pos[1].toFixed(5)}
        </span>
      </div>
    </div>
  );
}

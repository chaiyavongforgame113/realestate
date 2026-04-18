"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const brandIcon = L.divIcon({
  className: "brand-pin",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  html: `<div style="position:relative;width:32px;height:32px;">
    <div style="position:absolute;inset:0;background:linear-gradient(135deg,#7f1d1d,#dc2626);border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 4px 12px rgba(185,28,28,0.35);"></div>
    <div style="position:absolute;left:50%;top:40%;transform:translate(-50%,-50%);width:12px;height:12px;border-radius:50%;background:white;"></div>
  </div>`,
});

export function MapView({
  latitude,
  longitude,
  zoom = 15,
  height = 320,
}: {
  latitude: number;
  longitude: number;
  zoom?: number;
  height?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = L.map(ref.current, { scrollWheelZoom: false }).setView([latitude, longitude], zoom);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    markerRef.current = L.marker([latitude, longitude], { icon: brandIcon }).addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      mapRef.current.setView([latitude, longitude], zoom);
      markerRef.current.setLatLng([latitude, longitude]);
    }
  }, [latitude, longitude, zoom]);

  return <div ref={ref} className="overflow-hidden rounded-xl border border-line" style={{ height }} />;
}

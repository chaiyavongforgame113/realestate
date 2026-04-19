"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { SampleListing } from "@/lib/sample-data";
import { formatPrice } from "@/lib/utils";

// Bangkok district coordinates for generating mock locations
const DISTRICT_COORDS: Record<string, [number, number]> = {
  "วัฒนา": [13.7363, 100.5651],
  "ปทุมวัน": [13.7435, 100.5340],
  "ห้วยขวาง": [13.7690, 100.5847],
  "ยานนาวา": [13.6915, 100.5440],
  "สัมพันธวงศ์": [13.7367, 100.5083],
  "คันนายาว": [13.8175, 100.6760],
  "บางขุนเทียน": [13.6340, 100.4350],
  "บางพลี": [13.6139, 100.7285],
};

const DEFAULT_CENTER: [number, number] = [13.7563, 100.5018]; // Bangkok
const DEFAULT_ZOOM = 12;

function getListingCoords(listing: SampleListing): [number, number] {
  if (listing.latitude && listing.longitude) {
    return [listing.latitude, listing.longitude];
  }
  // Extract district from the listing district string
  const districtName = listing.district.split(",")[0].trim();
  const base = DISTRICT_COORDS[districtName] ?? DEFAULT_CENTER;
  // Add small random offset so pins don't stack
  const jitter = () => (Math.random() - 0.5) * 0.02;
  return [base[0] + jitter(), base[1] + jitter()];
}

function createPriceIcon(price: number, priceUnit: "total" | "per_month", isActive: boolean) {
  const label = priceUnit === "per_month"
    ? `฿${(price / 1000).toFixed(0)}K/mo`
    : price >= 1_000_000
    ? `฿${(price / 1_000_000).toFixed(1)}M`
    : `฿${(price / 1000).toFixed(0)}K`;

  return L.divIcon({
    className: "price-marker",
    iconSize: [80, 32],
    iconAnchor: [40, 32],
    html: `<div style="
      display:inline-flex;align-items:center;justify-content:center;
      padding:4px 10px;border-radius:9999px;
      font-size:12px;font-weight:700;white-space:nowrap;
      background:${isActive ? "linear-gradient(135deg,#7f1d1d,#dc2626)" : "#fff"};
      color:${isActive ? "#fff" : "#1c1917"};
      border:2px solid ${isActive ? "#dc2626" : "#e7e5e4"};
      box-shadow:0 2px 8px rgba(0,0,0,${isActive ? "0.3" : "0.12"});
      transform:${isActive ? "scale(1.15)" : "scale(1)"};
      transition:all 0.2s ease;
      cursor:pointer;
    ">${label}</div>`,
  });
}

interface SearchMapProps {
  listings: SampleListing[];
  hoveredId: string | null;
  onHoverListing: (id: string | null) => void;
  onClickListing: (id: string) => void;
}

export function SearchMap({ listings, hoveredId, onHoverListing, onClickListing }: SearchMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      scrollWheelZoom: true,
      zoomControl: false,
    }).setView(DEFAULT_CENTER, DEFAULT_ZOOM);

    // Add zoom control to bottom-right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers when listings change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current.clear();

    if (listings.length === 0) return;

    const bounds = L.latLngBounds([]);

    listings.forEach((listing) => {
      const coords = getListingCoords(listing);
      bounds.extend(coords);

      const icon = createPriceIcon(listing.price, listing.priceUnit, false);
      const marker = L.marker(coords, { icon }).addTo(map);

      marker.on("click", () => onClickListing(listing.id));
      marker.on("mouseover", () => onHoverListing(listing.id));
      marker.on("mouseout", () => onHoverListing(null));

      markersRef.current.set(listing.id, marker);
    });

    // Fit bounds with padding
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [listings, onClickListing, onHoverListing]);

  // Highlight marker on hover
  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const listing = listings.find((l) => l.id === id);
      if (!listing) return;
      const isActive = id === hoveredId;
      marker.setIcon(createPriceIcon(listing.price, listing.priceUnit, isActive));
      if (isActive) marker.setZIndexOffset(1000);
      else marker.setZIndexOffset(0);
    });
  }, [hoveredId, listings]);

  return (
    <div ref={containerRef} className="h-full w-full rounded-2xl" />
  );
}

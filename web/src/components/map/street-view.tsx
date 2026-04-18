"use client";

import { useState } from "react";
import { ExternalLink, Compass, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Street View embed — prefers Google Maps Embed API (requires NEXT_PUBLIC_GOOGLE_MAPS_KEY).
 * Falls back to a Mapillary embed, and finally a link-out if neither is configured.
 *
 * Google: https://developers.google.com/maps/documentation/embed/embedding-map
 */
export function StreetView({
  lat,
  lng,
  heading = 0,
  pitch = 0,
  fov = 90,
  className,
  height = 360,
}: {
  lat: number;
  lng: number;
  heading?: number;
  pitch?: number;
  fov?: number;
  className?: string;
  height?: number;
}) {
  const [fullscreen, setFullscreen] = useState(false);
  const googleKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

  const src = googleKey
    ? `https://www.google.com/maps/embed/v1/streetview?key=${googleKey}&location=${lat},${lng}&heading=${heading}&pitch=${pitch}&fov=${fov}`
    : `https://www.mapillary.com/embed?map_style=OpenStreetMap&image_key=&x=${lng}&y=${lat}&z=17&style=classic`;

  const provider = googleKey ? "Google Street View" : "Mapillary";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-line bg-surface-sunken",
        fullscreen && "fixed inset-4 z-[100] !rounded-2xl shadow-lift md:inset-10",
        className
      )}
      style={fullscreen ? undefined : { height }}
    >
      <iframe
        src={src}
        className="h-full w-full"
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      />
      <div className="absolute left-3 top-3 z-10 flex items-center gap-2 rounded-full bg-ink/70 px-3 py-1 text-xs font-medium text-white backdrop-blur">
        <Compass className="h-3.5 w-3.5" />
        {provider}
      </div>
      <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
        <button
          onClick={() => setFullscreen((f) => !f)}
          className="rounded-full bg-ink/70 p-1.5 text-white backdrop-blur hover:bg-ink"
          aria-label={fullscreen ? "ย่อหน้าจอ" : "ขยายเต็มจอ"}
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </button>
        <a
          href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 rounded-full bg-ink/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur hover:bg-ink"
        >
          <ExternalLink className="h-3 w-3" />
          เปิด
        </a>
      </div>
    </div>
  );
}

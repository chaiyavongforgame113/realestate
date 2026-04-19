"use client";

import Image from "next/image";
import { ArrowLeft, Heart, Share2, Expand } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { SampleListing } from "@/lib/sample-data";
import { Badge } from "../ui/badge";
import { Lightbox } from "../ui/lightbox";

const DEMO_GALLERY = [
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80",
];

function resolveImages(listing: SampleListing): string[] {
  // Prefer real uploaded images if present (cover first)
  if (listing.images && listing.images.length > 0) {
    const sorted = [...listing.images].sort((a, b) => Number(b.isCover) - Number(a.isCover));
    return sorted.map((i) => i.url);
  }
  return [listing.imageUrl, ...DEMO_GALLERY];
}

export function ListingGallery({ listing }: { listing: SampleListing }) {
  const [active, setActive] = useState(0);
  const [liked, setLiked] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const imgs = resolveImages(listing);

  function openLightbox(idx: number) {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  }

  return (
    <div>
      {/* Breadcrumb / back */}
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/search"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับสู่ผลการค้นหา
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLiked((v) => !v)}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-white px-3 text-sm font-medium shadow-soft transition-colors",
              liked ? "text-red-500" : "text-ink-muted hover:text-ink"
            )}
          >
            <Heart className={cn("h-4 w-4", liked && "fill-red-500")} />
            บันทึก
          </button>
          <button className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-white px-3 text-sm font-medium text-ink-muted shadow-soft hover:text-ink">
            <Share2 className="h-4 w-4" />
            แชร์
          </button>
        </div>
      </div>

      {/* Gallery grid */}
      <div className="grid grid-cols-4 gap-2 md:gap-3">
        <div className="group relative col-span-4 aspect-[16/10] overflow-hidden rounded-2xl md:col-span-3 md:aspect-[3/2]">
          <Image
            src={imgs[active]}
            alt={listing.title}
            fill
            sizes="(min-width: 1024px) 66vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            priority
          />
          <div className="absolute left-4 top-4 flex gap-2">
            <Badge tone={listing.listingType === "sale" ? "sale" : "rent"}>
              {listing.listingType === "sale" ? "ขาย" : "เช่า"}
            </Badge>
            {listing.aiRecommended && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-brand-700 to-accent-500 px-2.5 py-0.5 text-xs font-semibold text-white shadow-soft">
                AI แนะนำ
              </span>
            )}
          </div>
          <button
            onClick={() => openLightbox(active)}
            className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-ink backdrop-blur-sm transition-all hover:bg-white hover:shadow-lift"
          >
            <Expand className="h-3.5 w-3.5" />
            ดูทั้งหมด {imgs.length} รูป
          </button>
        </div>

        <div className="col-span-4 grid grid-cols-4 gap-2 md:col-span-1 md:grid-cols-1 md:gap-3">
          {imgs.slice(1, 5).map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i + 1)}
              className={cn(
                "relative aspect-[4/3] overflow-hidden rounded-lg transition-all md:aspect-[16/10]",
                active === i + 1
                  ? "ring-2 ring-brand-500 ring-offset-2"
                  : "opacity-80 hover:opacity-100"
              )}
            >
              <Image src={img} alt="" fill sizes="200px" className="object-cover" />
            </button>
          ))}
        </div>
      </div>

      <Lightbox
        images={imgs}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}

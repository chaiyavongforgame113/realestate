"use client";

import Image from "next/image";
import { ArrowLeft, Heart, Share2, Expand, Check, Scale } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { SampleListing } from "@/lib/sample-data";
import { Badge } from "../ui/badge";
import { Lightbox } from "../ui/lightbox";
import { useCompare } from "@/lib/compare/store";

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
  const compare = useCompare();
  const inCompare = compare.has(listing.id);
  const compareFull = compare.count >= compare.max && !inCompare;
  const [active, setActive] = useState(0);
  const [liked, setLiked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const imgs = resolveImages(listing);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/favorites")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data?.favorites) return;
        if (data.favorites.some((f: { listing: { id: string } }) => f.listing.id === listing.id)) {
          setLiked(true);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [listing.id]);

  async function toggleFavorite() {
    if (saving) return;
    const nextLiked = !liked;
    setLiked(nextLiked);
    setSaving(true);
    try {
      const res = nextLiked
        ? await fetch("/api/favorites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ listingId: listing.id }),
          })
        : await fetch(`/api/favorites?listingId=${encodeURIComponent(listing.id)}`, {
            method: "DELETE",
          });
      if (res.status === 401) {
        setLiked(false);
        window.location.href =
          "/login?reason=account&redirect=" + encodeURIComponent(window.location.pathname);
        return;
      }
      if (!res.ok) throw new Error();
      if (nextLiked) {
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 1500);
      }
    } catch {
      setLiked(!nextLiked);
    } finally {
      setSaving(false);
    }
  }

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
            onClick={() => !compareFull && compare.toggle(listing.id)}
            disabled={compareFull}
            title={
              compareFull
                ? `เปรียบเทียบเต็มแล้ว (${compare.max} รายการ)`
                : inCompare
                ? "เอาออกจากการเปรียบเทียบ"
                : "เพิ่มเข้าการเปรียบเทียบ"
            }
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-sm font-medium shadow-soft transition-all disabled:cursor-not-allowed disabled:opacity-60",
              inCompare
                ? "border-brand-600 bg-brand-600 text-white hover:bg-brand-700"
                : "border-line bg-white text-ink-muted hover:border-brand-300 hover:text-brand-700"
            )}
          >
            {inCompare ? (
              <>
                <Check className="h-4 w-4" />
                เปรียบเทียบ ({compare.count})
              </>
            ) : (
              <>
                <Scale className="h-4 w-4" />
                เปรียบเทียบ
                {compare.count > 0 && (
                  <span className="ml-0.5 rounded-full bg-brand-100 px-1.5 text-[10px] font-bold text-brand-800">
                    +{compare.count}
                  </span>
                )}
              </>
            )}
          </button>
          <button
            onClick={toggleFavorite}
            disabled={saving}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-white px-3 text-sm font-medium shadow-soft transition-colors disabled:opacity-60",
              liked ? "text-red-500" : "text-ink-muted hover:text-ink"
            )}
          >
            {justSaved ? (
              <Check className="h-4 w-4 text-red-500" />
            ) : (
              <Heart className={cn("h-4 w-4", liked && "fill-red-500")} />
            )}
            {justSaved ? "บันทึกแล้ว" : liked ? "บันทึกไว้" : "บันทึก"}
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

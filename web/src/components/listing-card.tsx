"use client";

import Image from "next/image";
import Link from "next/link";
import { Bed, Bath, Maximize2, MapPin, Heart, Sparkles, Train, Check, Plus, Bookmark } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Badge } from "./ui/badge";
import { cn, formatPrice } from "@/lib/utils";
import type { SampleListing } from "@/lib/sample-data";
import { useCompare } from "@/lib/compare/store";
import { SaveToBoardDialog } from "./wishlist/save-to-board-dialog";

export function ListingCard({
  listing,
  index = 0,
  inCompare,
  onToggleCompare,
  initialLiked = false,
}: {
  listing: SampleListing;
  index?: number;
  inCompare?: boolean;
  onToggleCompare?: (id: string) => void;
  initialLiked?: boolean;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [boardOpen, setBoardOpen] = useState(false);
  const compare = useCompare();
  const finalInCompare = inCompare ?? compare.has(listing.id);
  const handleToggleCompare = onToggleCompare ?? ((id: string) => compare.toggle(id));
  const showCompareBtn = true;

  async function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const nextLiked = !liked;
    setLiked(nextLiked); // optimistic
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
    } catch {
      setLiked(!nextLiked); // revert
    }
  }
  const propertyLabel = {
    condo: "คอนโด",
    house: "บ้านเดี่ยว",
    townhouse: "ทาวน์เฮาส์",
    land: "ที่ดิน",
    commercial: "พาณิชย์",
  }[listing.propertyType];

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.45, delay: (index % 4) * 0.08, ease: [0.2, 0.8, 0.2, 1] }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-soft transition-shadow duration-300 hover:shadow-lift dark:hover:border-brand-700/60"
    >
      <Link
        href={`/listing/${listing.id}`}
        aria-label={listing.title}
        className="absolute inset-0 z-[1]"
      />
      {/* Image */}
      <div className="pointer-events-none relative aspect-[4/3] overflow-hidden bg-surface-sunken">
        <Image
          src={listing.imageUrl}
          alt={listing.title}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.08]"
        />
        {/* Top overlays */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone={listing.listingType === "sale" ? "sale" : "rent"}>
              {listing.listingType === "sale" ? "ขาย" : "เช่า"}
            </Badge>
            <Badge tone="neutral" className="bg-white/90 backdrop-blur-sm">
              {propertyLabel}
            </Badge>
          </div>
          <div className="pointer-events-auto relative z-[2] flex items-center gap-1">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setBoardOpen(true);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-all hover:scale-110"
              aria-label="บันทึกลงบอร์ด"
              title="บันทึกลงบอร์ด"
            >
              <Bookmark className="h-4 w-4 text-ink-muted" />
            </button>
            <button
              onClick={toggleFavorite}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-all hover:scale-110",
                liked && "bg-red-50"
              )}
              aria-label="ถูกใจ"
            >
              <Heart
                className={cn(
                  "h-4 w-4 transition-all",
                  liked ? "fill-red-500 text-red-500" : "text-ink-muted"
                )}
              />
            </button>
          </div>
        </div>

        {/* AI Recommended badge */}
        {listing.aiRecommended && (
          <div className="absolute bottom-3 left-3">
            <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-700 to-accent-500 px-2.5 py-1 text-xs font-semibold text-white shadow-soft">
              <Sparkles className="h-3 w-3" strokeWidth={2.5} />
              AI แนะนำ
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="pointer-events-none relative z-[1] flex flex-1 flex-col p-4">
        <div className="flex items-baseline justify-between gap-3">
          <div className="font-display text-xl font-bold text-ink">
            {formatPrice(listing.price, listing.priceUnit)}
          </div>
          {listing.nearestTransit && (
            <div className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-800">
              <Train className="h-3 w-3" />
              {listing.transitDistance}ม.
            </div>
          )}
        </div>

        <h3 className="mt-1.5 line-clamp-2 text-[15px] font-medium leading-snug text-ink-soft">
          {listing.title}
        </h3>

        {/* Attributes */}
        <div className="mt-3 flex items-center gap-4 text-sm text-ink-muted">
          {listing.bedrooms > 0 && (
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              <span>{listing.bedrooms}</span>
            </div>
          )}
          {listing.bathrooms > 0 && (
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              <span>{listing.bathrooms}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Maximize2 className="h-4 w-4" />
            <span>
              {listing.usableArea.toLocaleString()} {listing.propertyType === "land" ? "ตร.ว." : "ตร.ม."}
            </span>
          </div>
        </div>

        <div className="mt-2.5 flex items-center gap-1 text-sm text-ink-muted">
          <MapPin className="h-3.5 w-3.5" />
          <span className="truncate">{listing.district}</span>
        </div>

        {/* AI match reason */}
        {listing.matchReason && (
          <div className="mt-3 rounded-lg border border-accent-100 bg-accent-50/70 px-2.5 py-1.5 text-[12px] text-accent-900">
            <span className="font-semibold">ทำไมตรงกับคุณ:</span> {listing.matchReason}
          </div>
        )}

        {/* Agent */}
        <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
          <div className="flex items-center gap-2">
            <div className="relative h-7 w-7 overflow-hidden rounded-full ring-2 ring-white">
              <Image src={listing.agent.avatar} alt={listing.agent.name} fill sizes="28px" className="object-cover" />
            </div>
            <span className="text-xs text-ink-muted">{listing.agent.name}</span>
          </div>

          <div className="flex items-center gap-1">
            {showCompareBtn && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleToggleCompare(listing.id);
                }}
                className={cn(
                  "pointer-events-auto inline-flex h-7 items-center gap-1 rounded-full border px-2 text-[11px] font-medium transition-all",
                  finalInCompare
                    ? "border-brand-600 bg-brand-50 text-brand-800 dark:bg-brand-900/50 dark:text-brand-100 dark:border-brand-700"
                    : "border-line bg-surface text-ink-muted hover:border-brand-300 hover:text-brand-800"
                )}
              >
                {finalInCompare ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                เปรียบเทียบ
              </button>
            )}
            <span className="text-[11px] font-medium text-brand-700 opacity-0 transition-opacity group-hover:opacity-100">
              ดูรายละเอียด →
            </span>
          </div>
        </div>
      </div>
      <SaveToBoardDialog
        open={boardOpen}
        listingId={listing.id}
        onClose={() => setBoardOpen(false)}
      />
    </motion.article>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Bed, Maximize2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export type InlineListing = {
  id: string;
  title: string;
  price: number;
  priceUnit: string;
  bedrooms: number;
  usableArea: number;
  district: string;
  province?: string;
  coverImageUrl: string;
  nearestBts?: string | null;
  nearestBtsDistance?: number | null;
  nearestMrt?: string | null;
  match_score?: number;
  match_reasons?: string[];
};

function formatPrice(price: number, unit: string) {
  if (unit === "per_month") {
    return `${price.toLocaleString()} บ./ด.`;
  }
  if (price >= 1_000_000) {
    return `${(price / 1_000_000).toFixed(price % 1_000_000 === 0 ? 0 : 2)} ล้าน`;
  }
  return price.toLocaleString();
}

export function InlineListingCard({ listing, index }: { listing: InlineListing; index: number }) {
  const transit = listing.nearestBts
    ? `BTS ${listing.nearestBts}${listing.nearestBtsDistance ? ` ${listing.nearestBtsDistance}ม.` : ""}`
    : listing.nearestMrt
    ? `MRT ${listing.nearestMrt}`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      className="ml-10"
    >
      <Link
        href={`/listing/${listing.id}`}
        className={cn(
          "group flex gap-3 overflow-hidden rounded-2xl border border-line bg-white p-2 transition-all dark:bg-stone-900",
          "hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lift"
        )}
      >
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-surface-sunken">
          <Image
            src={listing.coverImageUrl}
            alt={listing.title}
            fill
            sizes="96px"
            className="object-cover"
          />
          {typeof listing.match_score === "number" && (
            <div className="absolute right-1 top-1 rounded-full bg-brand-700 px-2 py-0.5 text-[10px] font-bold text-white shadow-soft">
              {listing.match_score}%
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[11px] text-ink-muted">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{listing.district}</span>
          </div>
          <h4 className="mt-0.5 line-clamp-2 text-[14px] font-semibold text-stone-900 dark:text-stone-50">{listing.title}</h4>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-ink-muted">
            <span className="inline-flex items-center gap-1">
              <Bed className="h-3 w-3" /> {listing.bedrooms}
            </span>
            <span className="inline-flex items-center gap-1">
              <Maximize2 className="h-3 w-3" /> {listing.usableArea} ตร.ม.
            </span>
            {transit && <span className="text-brand-700">· {transit}</span>}
          </div>
          <div className="mt-1.5 flex items-baseline justify-between gap-2">
            <span className="font-display text-[15px] font-bold text-brand-700">
              {formatPrice(listing.price, listing.priceUnit)}
            </span>
            <ExternalLink className="h-3.5 w-3.5 text-ink-muted opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          {listing.match_reasons && listing.match_reasons.length > 0 && (
            <p className="mt-1 line-clamp-1 text-[11px] text-ink-muted">
              ✓ {listing.match_reasons.slice(0, 2).join(" · ")}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

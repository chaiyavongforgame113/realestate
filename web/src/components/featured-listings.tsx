"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Container } from "./ui/container";
import { ListingCard } from "./listing-card";
import { fetchListings } from "@/lib/listings/client";
import { toCardView } from "@/lib/listings/adapter";
import type { SampleListing } from "@/lib/sample-data";
import { cn } from "@/lib/utils";
import { ListingCardSkeleton } from "./ui/skeleton";

const filters = [
  { key: "all", label: "ทั้งหมด" },
  { key: "sale", label: "ขาย" },
  { key: "rent", label: "เช่า" },
  { key: "ai", label: "AI แนะนำ" },
] as const;

export function FeaturedListings() {
  const [filter, setFilter] = useState<(typeof filters)[number]["key"]>("all");
  const [items, setItems] = useState<SampleListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListings({ limit: 8 })
      .then((res) => setItems(res.listings.map(toCardView)))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter((l) => {
    if (filter === "all") return true;
    if (filter === "ai") return l.aiRecommended ?? false;
    return l.listingType === filter;
  });

  return (
    <section id="featured" className="relative py-16 md:py-24">
      <Container>
        <div className="mb-8 flex flex-col gap-5 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">
              ประกาศเด่น
            </p>
            <h2 className="mt-2 font-display text-display-md font-bold text-ink">
              ทรัพย์คัดสรรจากทั่วประเทศ
            </h2>
            <p className="mt-2 max-w-xl text-ink-muted">
              ทรัพย์ที่ตรงกับผู้ใช้ส่วนใหญ่ กลั่นกรองโดย Agent ที่ผ่านการยืนยันตัวตน
            </p>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto rounded-full border border-line bg-surface p-1 shadow-soft">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "relative shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  filter === f.key ? "text-white" : "text-ink-muted hover:text-ink"
                )}
              >
                {filter === f.key && (
                  <motion.div
                    layoutId="featuredFilterBg"
                    className="absolute inset-0 rounded-full bg-gradient-brand"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{f.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="skeletons"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="col-span-full grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <ListingCardSkeleton key={i} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="col-span-full grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
              >
                {filtered.map((listing, i) => (
                  <ListingCard key={listing.id} listing={listing} index={i} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {!loading && filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-line bg-surface/60 p-10 text-center text-sm text-ink-muted">
            ยังไม่มีประกาศในหมวดนี้
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Link
            href="/search"
            className="group inline-flex items-center gap-2 rounded-full border border-line bg-surface px-6 py-3 text-sm font-semibold text-ink shadow-soft transition-all hover:border-brand-300 hover:shadow-lift"
          >
            ดูประกาศทั้งหมด
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </Container>
    </section>
  );
}

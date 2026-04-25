"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Scale, X, ArrowRight } from "lucide-react";
import { useCompare } from "@/lib/compare/store";
import { fetchListing } from "@/lib/listings/client";
import { cn } from "@/lib/utils";

type Mini = { id: string; title: string; coverImageUrl: string };

/**
 * Global floating tray — shows whenever compare store has items, on any page.
 * Bold dark capsule with thumbnails so it's clearly visible over photo backgrounds.
 */
export function GlobalCompareTray() {
  const { count, max, clear, ids, remove } = useCompare();
  const show = count > 0;
  const canCompare = count >= 2;

  // Fetch tiny thumbnails so the tray actually shows what you've picked
  const [items, setItems] = useState<Mini[]>([]);
  useEffect(() => {
    if (!show) return;
    let cancelled = false;
    Promise.all(
      ids.map((id) =>
        fetchListing(id)
          .then((res) => ({
            id,
            title: res.listing.title,
            coverImageUrl: res.listing.coverImageUrl,
          }))
          .catch(() => null)
      )
    ).then((res) => {
      if (!cancelled) setItems(res.filter((x): x is Mini => x !== null));
    });
    return () => {
      cancelled = true;
    };
  }, [ids, show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-ink/95 px-3 py-2.5 text-white shadow-[0_20px_60px_-15px_rgba(127,29,29,0.55)] backdrop-blur-xl">
            {/* Icon */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-brand shadow-soft">
              <Scale className="h-5 w-5" />
            </div>

            {/* Counter + Thumbnails */}
            <div className="flex items-center gap-3 pr-1">
              <div className="text-sm">
                <div className="font-display text-base font-bold leading-tight">
                  เปรียบเทียบ <span className="text-accent-300">{count}</span>
                  <span className="text-white/40">/{max}</span>
                </div>
                <div className="text-[11px] font-medium text-white/60">
                  {canCompare ? "พร้อมเปรียบเทียบ" : `เลือกอีก ${2 - count} รายการ`}
                </div>
              </div>

              {/* Thumbnails — overlap, hover-pop */}
              <div className="flex -space-x-2">
                {items.map((it) => (
                  <button
                    key={it.id}
                    onClick={() => remove(it.id)}
                    title={`เอา "${it.title}" ออก`}
                    className="group relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border-2 border-ink/95 bg-surface-sunken transition-transform hover:z-10 hover:-translate-y-0.5 hover:scale-110"
                  >
                    <Image
                      src={it.coverImageUrl}
                      alt={it.title}
                      fill
                      sizes="40px"
                      className="object-cover transition-opacity group-hover:opacity-50"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-red-500/0 opacity-0 transition-all group-hover:bg-red-600/80 group-hover:opacity-100">
                      <X className="h-4 w-4 text-white" strokeWidth={3} />
                    </span>
                  </button>
                ))}
                {/* Empty slots */}
                {Array.from({ length: Math.max(0, 2 - count) }).map((_, i) => (
                  <div
                    key={`slot-${i}`}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-white/20 bg-white/5 text-[10px] font-bold text-white/30"
                  >
                    +
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <span className="hidden h-9 w-px bg-white/15 md:block" />

            {/* CTA */}
            <Link
              href={canCompare ? `/compare?ids=${ids.join(",")}` : "#"}
              aria-disabled={!canCompare}
              onClick={(e) => !canCompare && e.preventDefault()}
              className={cn(
                "group inline-flex h-10 items-center gap-1.5 rounded-xl px-4 text-sm font-bold shadow-soft transition-all",
                canCompare
                  ? "bg-gradient-to-br from-brand-500 to-brand-700 text-white hover:shadow-lift"
                  : "cursor-not-allowed bg-white/10 text-white/40"
              )}
            >
              ไปเปรียบเทียบ
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>

            {/* Clear all */}
            <button
              onClick={clear}
              aria-label="ล้างรายการเปรียบเทียบ"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              title="ล้างทั้งหมด"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

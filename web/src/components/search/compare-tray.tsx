"use client";

import Image from "next/image";
import Link from "next/link";
import { X, Scale, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { SampleListing } from "@/lib/sample-data";
import { formatPrice } from "@/lib/utils";

export function CompareTray({
  items,
  onRemove,
  onClear,
}: {
  items: SampleListing[];
  onRemove: (id: string) => void;
  onClear: () => void;
}) {
  const count = items.length;
  const show = count > 0;
  const canCompare = count >= 2;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 32 }}
          className="fixed inset-x-0 bottom-0 z-40"
        >
          <div className="mx-auto max-w-[1200px] px-4 pb-4">
            <div className="rounded-2xl border border-line bg-white/95 p-3 shadow-lift backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-brand text-white">
                  <Scale className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold uppercase tracking-widest text-brand-800">
                    เปรียบเทียบ
                  </div>
                  <div className="text-sm text-ink-muted">
                    เลือกแล้ว {count}/5 รายการ {canCompare ? "— พร้อมเปรียบเทียบ" : "— เลือกอย่างน้อย 2"}
                  </div>
                </div>

                {/* Item thumbnails */}
                <div className="hidden items-center gap-2 md:flex">
                  {items.map((l) => (
                    <div
                      key={l.id}
                      className="group relative h-14 w-14 overflow-hidden rounded-lg border border-line"
                    >
                      <Image src={l.imageUrl} alt={l.title} fill sizes="56px" className="object-cover" />
                      <button
                        onClick={() => onRemove(l.id)}
                        className="absolute inset-0 flex items-center justify-center bg-ink/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        aria-label="remove"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {Array.from({ length: 5 - count }).map((_, i) => (
                    <div
                      key={i}
                      className="h-14 w-14 rounded-lg border border-dashed border-line bg-surface-sunken/60"
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onClear}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-ink-muted hover:bg-surface-sunken hover:text-ink"
                  >
                    ล้าง
                  </button>
                  <Link
                    href={canCompare ? `/compare?ids=${items.map((l) => l.id).join(",")}` : "#"}
                    aria-disabled={!canCompare}
                    className={
                      canCompare
                        ? "group inline-flex h-10 items-center gap-1.5 rounded-xl bg-brand-700 px-4 text-sm font-semibold text-white shadow-soft transition-all hover:bg-brand-800 hover:shadow-lift"
                        : "inline-flex h-10 items-center gap-1.5 rounded-xl bg-surface-sunken px-4 text-sm font-semibold text-ink-subtle"
                    }
                  >
                    เปรียบเทียบเลย
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>

              {/* Mobile thumbnails row */}
              <div className="mt-3 flex items-center gap-2 overflow-x-auto md:hidden">
                {items.map((l) => (
                  <div
                    key={l.id}
                    className="flex shrink-0 items-center gap-2 rounded-full border border-line bg-white px-2 py-1"
                  >
                    <div className="relative h-8 w-8 overflow-hidden rounded-md">
                      <Image src={l.imageUrl} alt={l.title} fill sizes="32px" className="object-cover" />
                    </div>
                    <span className="max-w-[100px] truncate text-xs text-ink-soft">
                      {formatPrice(l.price, l.priceUnit)}
                    </span>
                    <button onClick={() => onRemove(l.id)} aria-label="remove">
                      <X className="h-3.5 w-3.5 text-ink-subtle" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

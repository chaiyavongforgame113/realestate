"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Scale, X, ArrowRight } from "lucide-react";
import { useCompare } from "@/lib/compare/store";

/**
 * Global floating tray — shows whenever compare store has items, on any page.
 * Thin bar with counter + CTA. Detailed thumbnails live in search's CompareTray.
 */
export function GlobalCompareTray() {
  const { count, max, clear, ids } = useCompare();
  const show = count > 0;
  const canCompare = count >= 2;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2"
        >
          <div className="glass-card flex items-center gap-3 px-4 py-2.5 shadow-lift">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-brand text-white">
              <Scale className="h-4 w-4" />
            </div>
            <div className="text-sm">
              <div className="font-semibold text-ink">
                เปรียบเทียบ {count}/{max}
              </div>
              <div className="text-xs text-ink-muted">
                {canCompare ? "พร้อมเปรียบเทียบ" : "เลือกอย่างน้อย 2"}
              </div>
            </div>
            <Link
              href={canCompare ? `/compare?ids=${ids.join(",")}` : "#"}
              aria-disabled={!canCompare}
              className={
                canCompare
                  ? "group inline-flex h-9 items-center gap-1.5 rounded-full bg-brand-700 px-4 text-xs font-semibold text-white hover:bg-brand-800"
                  : "inline-flex h-9 cursor-not-allowed items-center gap-1.5 rounded-full bg-surface-sunken px-4 text-xs font-semibold text-ink-subtle"
              }
            >
              ไปเปรียบเทียบ
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <button
              onClick={clear}
              aria-label="ล้างรายการเปรียบเทียบ"
              className="text-ink-muted hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

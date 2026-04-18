"use client";

import { useState } from "react";
import { Play, X, Maximize2, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function VirtualTour({ url, title }: { url: string; title: string }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
      <div className="relative aspect-[16/7]">
        <iframe
          src={url}
          title={`Virtual tour: ${title}`}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; xr-spatial-tracking; fullscreen"
          allowFullScreen
          loading="lazy"
        />
        <button
          onClick={() => setOpen(true)}
          className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-ink shadow-lift backdrop-blur-sm hover:bg-white"
        >
          <Maximize2 className="h-3 w-3" />
          ขยายเต็มจอ
        </button>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand text-white">
            <Play className="h-4 w-4" fill="currentColor" />
          </div>
          <div>
            <div className="font-display text-sm font-bold text-ink">Virtual Tour 360°</div>
            <div className="text-xs text-ink-muted">คลิกและลากเพื่อหมุนชมรอบห้อง</div>
          </div>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800"
        >
          เปิดแท็บใหม่ <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/90 p-4 backdrop-blur-sm"
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-lift"
            >
              <X className="h-5 w-5" />
            </button>
            <iframe
              src={url}
              className="aspect-video h-auto w-full max-w-6xl rounded-2xl"
              allowFullScreen
              allow="fullscreen"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

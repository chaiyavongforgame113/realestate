"use client";

import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

interface LightboxProps {
  images: string[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
}

export function Lightbox({ images, initialIndex = 0, open, onClose }: LightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    if (open) setIndex(initialIndex);
  }, [open, initialIndex]);

  const next = useCallback(() => {
    setZoomed(false);
    setIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  const prev = useCallback(() => {
    setZoomed(false);
    setIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    // Prevent body scroll
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, next, prev, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[200] flex flex-col bg-ink/95 backdrop-blur-lg"
          onClick={onClose}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3 md:px-6" onClick={(e) => e.stopPropagation()}>
            <div className="text-sm font-medium text-white/70">
              <span className="font-bold text-white">{index + 1}</span>
              <span className="mx-1">/</span>
              <span>{images.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomed((z) => !z)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                aria-label={zoomed ? "ย่อ" : "ขยาย"}
              >
                {zoomed ? <ZoomOut className="h-5 w-5" /> : <ZoomIn className="h-5 w-5" />}
              </button>
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="ปิด"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Main image area */}
          <div
            className="relative flex flex-1 items-center justify-center px-4 md:px-16"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prev arrow */}
            <button
              onClick={prev}
              className="absolute left-2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-110 md:left-6"
              aria-label="ก่อนหน้า"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Image */}
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
                className={`relative w-full ${
                  zoomed ? "h-full cursor-zoom-out" : "h-[60vh] md:h-[70vh] cursor-zoom-in"
                } transition-all duration-300`}
                onClick={() => setZoomed((z) => !z)}
              >
                <Image
                  src={images[index]}
                  alt={`รูปที่ ${index + 1}`}
                  fill
                  sizes="100vw"
                  className={`transition-all duration-300 ${
                    zoomed ? "object-contain" : "object-contain"
                  }`}
                  priority
                />
              </motion.div>
            </AnimatePresence>

            {/* Next arrow */}
            <button
              onClick={next}
              className="absolute right-2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-110 md:right-6"
              aria-label="ถัดไป"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Thumbnail strip */}
          <div
            className="flex items-center justify-center gap-2 overflow-x-auto px-4 py-4 no-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => {
                  setZoomed(false);
                  setIndex(i);
                }}
                className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg transition-all duration-300 ${
                  i === index
                    ? "ring-2 ring-white ring-offset-2 ring-offset-ink/95 scale-110"
                    : "opacity-50 hover:opacity-80"
                }`}
              >
                <Image src={img} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

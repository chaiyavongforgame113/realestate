"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Sparkles, ArrowDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Container } from "./ui/container";
import { AISearchBox } from "./ai-search-box";

const stats = [
  { value: "12,000+", label: "ประกาศทั่วประเทศ" },
  { value: "2,500+", label: "Agent ที่ผ่านการยืนยัน" },
  { value: "98%", label: "ผู้ใช้พึงพอใจ AI Search" },
];

export function Hero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Parallax layers — background moves slower, blobs drift, content slight lift.
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const blobLY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const blobRY = useTransform(scrollYProgress, [0, 1], ["0%", "-40%"]);
  const gridY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-6%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.9], [1, 0.3]);

  return (
    <section ref={ref} className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24">
      {/* Background layers (parallax) — static on SSR to avoid hydration mismatch */}
      {mounted && !reduce ? (
        <>
          <motion.div
            style={{ y: bgY }}
            className="absolute inset-0 -z-10 bg-gradient-mesh opacity-90 dark:bg-gradient-mesh-dark dark:opacity-60"
          />
          <motion.div
            style={{ y: gridY }}
            className="absolute inset-0 -z-10 grid-bg"
          />
        </>
      ) : (
        <>
          <div className="absolute inset-0 -z-10 bg-gradient-mesh opacity-90 dark:bg-gradient-mesh-dark dark:opacity-60" />
          <div className="absolute inset-0 -z-10 grid-bg" />
        </>
      )}
      <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-b from-transparent to-surface-soft" />

      {/* Floating decorative blobs with parallax — client-only */}
      {mounted && !reduce ? (
        <>
          <motion.div
            aria-hidden
            style={{ y: blobLY }}
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-[6%] top-28 -z-10 h-24 w-24 rounded-full bg-brand-200/60 blur-2xl dark:bg-brand-800/30 md:h-40 md:w-40"
          />
          <motion.div
            aria-hidden
            style={{ y: blobRY }}
            animate={{ y: [0, 14, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-[8%] top-48 -z-10 h-32 w-32 rounded-full bg-accent-200/70 blur-2xl dark:bg-accent-800/30 md:h-56 md:w-56"
          />
        </>
      ) : (
        <>
          <div aria-hidden className="absolute left-[6%] top-28 -z-10 h-24 w-24 rounded-full bg-brand-200/60 blur-2xl dark:bg-brand-800/30 md:h-40 md:w-40" />
          <div aria-hidden className="absolute right-[8%] top-48 -z-10 h-32 w-32 rounded-full bg-accent-200/70 blur-2xl dark:bg-accent-800/30 md:h-56 md:w-56" />
        </>
      )}

      <motion.div style={mounted && !reduce ? { y: contentY, opacity: contentOpacity } : undefined}>
        <Container>
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200/60 bg-white/70 px-4 py-1.5 text-xs font-semibold text-brand-800 backdrop-blur-sm dark:border-brand-800/40 dark:bg-surface-raised/60 dark:text-brand-200"
            >
              <Sparkles className="h-3.5 w-3.5 text-accent-500" />
              <span>ขับเคลื่อนด้วย AI</span>
              <span className="h-1 w-1 rounded-full bg-brand-400" />
              <span>ตีความความต้องการภาษาไทย</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="font-display text-display-xl font-bold text-ink"
            >
              หาบ้านในฝัน{" "}
              <span className="relative inline-block">
                <span className="text-gradient-brand">แค่บอกเรา</span>
                <svg
                  className="absolute -bottom-2 left-0 w-full text-accent-400"
                  viewBox="0 0 300 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.2, delay: 0.8, ease: "easeInOut" }}
                    d="M2 8 C 80 2, 220 2, 298 8"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </span>
              <br />
              ที่เหลือให้ AI จัดการ
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mx-auto mt-6 max-w-2xl text-lg text-ink-muted md:text-xl"
            >
              พิมพ์ความต้องการเป็นภาษาไทยธรรมชาติ ระบบจะตีความ เปรียบเทียบ
              และแนะนำคอนโด บ้าน ที่ดิน ที่ตรงใจคุณมากที่สุด
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-10"
            >
              <AISearchBox />
            </motion.div>

            {/* Stats row — glass card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="glass-card mt-14 grid grid-cols-3 divide-x divide-line/60 md:mt-16"
            >
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="px-4 py-5 md:px-6 md:py-6"
                >
                  <div className="font-display text-2xl font-bold text-ink md:text-3xl">
                    {s.value}
                  </div>
                  <div className="mt-1 text-xs text-ink-muted md:text-sm">{s.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Scroll hint */}
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mx-auto mt-16 flex w-max items-center gap-2 text-xs uppercase tracking-widest text-ink-subtle"
          >
            <ArrowDown className="h-3.5 w-3.5" />
            เลื่อนเพื่อดูเพิ่มเติม
          </motion.div>
        </Container>
      </motion.div>
    </section>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Container } from "./ui/container";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    name: "คุณธนพล ส.",
    role: "ซื้อคอนโด Ashton Asoke",
    avatar: "ธ",
    rating: 5,
    text: "พิมพ์ไทยธรรมดาแล้วเจอคอนโดที่ใช่ใน 5 นาที! ไม่ต้องกดกรองทีละอัน AI เข้าใจเลยว่าเราอยากได้อะไร",
    highlight: "หาเจอใน 5 นาที",
  },
  {
    name: "คุณปราณี ม.",
    role: "เช่าบ้าน สุขุมวิท 39",
    avatar: "ป",
    rating: 5,
    text: "ฟีเจอร์เปรียบเทียบทรัพย์ของ AI ช่วยตัดสินใจได้ง่ายมาก เห็นจุดแข็ง-จุดอ่อนชัดเจน เลือกได้เร็วกว่าที่คิด",
    highlight: "เปรียบเทียบได้ชัดเจน",
  },
  {
    name: "คุณวิชัย ร.",
    role: "Agent · 156 รายการ",
    avatar: "ว",
    rating: 5,
    text: "ตั้งแต่ใช้ Estate AI ได้ lead คุณภาพเพิ่มขึ้น 3 เท่า ผู้ซื้อที่มาจาก AI match ตรงกับทรัพย์ที่ลงจริงๆ ปิดดีลได้เร็วกว่าเดิม",
    highlight: "Lead เพิ่ม 3 เท่า",
  },
  {
    name: "คุณแพรว จ.",
    role: "ซื้อทาวน์เฮาส์ รามอินทรา",
    avatar: "แ",
    rating: 5,
    text: "Voice search ยอดมาก! พูดไทยปกติว่า 'อยากได้ทาวน์เฮาส์ใกล้โรงเรียน งบ 5 ล้าน' ระบบหาให้ตรงเป๊ะ ชอบมาก!",
    highlight: "พูดไทยแล้วเข้าใจทันที",
  },
  {
    name: "คุณสมศักดิ์ ก.",
    role: "ลงทุนที่ดิน บางนา",
    avatar: "ส",
    rating: 4,
    text: "เครื่องมือวิเคราะห์ราคาช่วยให้เข้าใจ market value ของที่ดินที่สนใจ ข้อมูลครบถ้วน ตัดสินใจลงทุนได้มั่นใจขึ้น",
    highlight: "วิเคราะห์ราคาแม่นยำ",
  },
];

const gradients = [
  "from-brand-500 to-accent-500",
  "from-accent-500 to-brand-400",
  "from-brand-600 to-brand-400",
  "from-accent-400 to-brand-500",
  "from-brand-400 to-accent-600",
];

export function Testimonials() {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);

  const next = useCallback(() => {
    setDirection(1);
    setActive((i) => (i + 1) % testimonials.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setActive((i) => (i - 1 + testimonials.length) % testimonials.length);
  }, []);

  // Auto-rotate
  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const t = testimonials[active];

  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      {/* Background decoration */}
      <div
        aria-hidden
        className="absolute left-1/2 top-0 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-100 opacity-30 blur-3xl dark:bg-brand-900/20"
      />

      <Container>
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">
            เสียงจากผู้ใช้งาน
          </p>
          <h2 className="mt-2 font-display text-display-md font-bold text-ink">
            คนไทยกว่าหมื่นคนเชื่อใจเรา
          </h2>
        </div>

        <div className="relative mx-auto max-w-3xl">
          {/* Quote icon */}
          <div className="absolute -left-4 -top-4 z-0 opacity-[0.06] md:-left-8 md:-top-8">
            <Quote className="h-24 w-24 md:h-32 md:w-32" strokeWidth={1} />
          </div>

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={active}
              custom={direction}
              initial={{ opacity: 0, x: direction * 60, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: direction * -60, scale: 0.96 }}
              transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
              className="relative z-10"
            >
              <div className="rounded-3xl border border-line bg-white p-8 shadow-card dark:border-line dark:bg-surface-raised md:p-12">
                {/* Stars */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-5 w-5",
                        i < t.rating
                          ? "fill-accent-400 text-accent-400"
                          : "fill-surface-sunken text-surface-sunken"
                      )}
                    />
                  ))}
                </div>

                {/* Highlight badge */}
                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800 dark:bg-brand-900/30 dark:text-brand-200">
                  ✨ {t.highlight}
                </div>

                {/* Quote text */}
                <p className="mt-5 font-display text-xl font-medium leading-relaxed text-ink md:text-2xl">
                  "{t.text}"
                </p>

                {/* Author */}
                <div className="mt-8 flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br text-lg font-bold text-white shadow-soft",
                      gradients[active % gradients.length]
                    )}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-ink">{t.name}</div>
                    <div className="text-sm text-ink-muted">{t.role}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={prev}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-ink-muted shadow-soft transition-all hover:border-brand-300 hover:text-brand-700 hover:shadow-lift dark:bg-surface-raised"
              aria-label="ก่อนหน้า"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Dots */}
            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > active ? 1 : -1);
                    setActive(i);
                  }}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    i === active
                      ? "w-8 bg-gradient-brand"
                      : "w-2 bg-ink-subtle/40 hover:bg-ink-subtle"
                  )}
                  aria-label={`Testimonial ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-ink-muted shadow-soft transition-all hover:border-brand-300 hover:text-brand-700 hover:shadow-lift dark:bg-surface-raised"
              aria-label="ถัดไป"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
}

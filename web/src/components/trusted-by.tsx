"use client";

import { motion } from "framer-motion";
import { Container } from "./ui/container";

const partners = [
  "Sansiri",
  "AP Thailand",
  "LPN Development",
  "Pruksa Holding",
  "SC Asset",
  "Ananda Development",
  "Origin Property",
  "Land & Houses",
  "Supalai",
  "Noble Development",
  "Major Development",
  "Raimon Land",
];

export function TrustedBy() {
  // Double the array for seamless looping
  const items = [...partners, ...partners];

  return (
    <section className="relative overflow-hidden border-y border-line/60 bg-surface/80 py-10 backdrop-blur-sm">
      <Container className="mb-6">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-ink-subtle">
          ร่วมกับผู้พัฒนาอสังหาริมทรัพย์ชั้นนำ
        </p>
      </Container>

      {/* Marquee — CSS-driven infinite scroll */}
      <div className="relative">
        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-surface-soft to-transparent md:w-40" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-surface-soft to-transparent md:w-40" />

        <div className="flex animate-marquee items-center gap-12 md:gap-16">
          {items.map((name, i) => (
            <div
              key={`${name}-${i}`}
              className="group flex shrink-0 items-center gap-3 transition-all duration-500"
            >
              {/* Logo placeholder — abstract shape */}
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-sunken text-sm font-bold text-ink-subtle transition-all duration-500 group-hover:bg-brand-50 group-hover:text-brand-700 group-hover:shadow-soft">
                {name[0]}
              </div>
              <span className="whitespace-nowrap text-sm font-semibold text-ink-subtle transition-colors duration-500 group-hover:text-ink">
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

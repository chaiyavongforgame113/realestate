"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { Container } from "./ui/container";
import { popularAreas } from "@/lib/sample-data";

export function PopularAreas() {
  return (
    <section className="bg-surface-sunken/60 py-16 md:py-24">
      <Container>
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">
            ทำเลยอดนิยม
          </p>
          <h2 className="mt-2 font-display text-display-md font-bold text-ink">
            เจาะย่านที่ผู้คนกำลังมองหา
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-ink-muted">
            อัปเดตตามการค้นหาและ enquiry ใน 30 วันที่ผ่านมา
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5">
          {popularAreas.map((area, i) => (
            <Link
              key={area.name}
              href={`/search?districts=${encodeURIComponent(area.name)}`}
              className="group relative block h-48 overflow-hidden rounded-2xl shadow-soft md:h-56 lg:h-64"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="relative h-full w-full"
              >
              <Image
                src={area.image}
                alt={area.name}
                fill
                sizes="(min-width: 768px) 33vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.08]"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/30 to-transparent" />
              {/* Ring on hover */}
              <div className="absolute inset-0 rounded-2xl ring-0 ring-brand-400/0 transition-all duration-500 group-hover:ring-4 group-hover:ring-brand-400/30" />

              <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                <div className="flex items-end justify-between">
                  <div className="transition-transform duration-500 group-hover:-translate-y-1">
                    <div className="flex items-center gap-1.5 text-white/80">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="text-xs uppercase tracking-widest">ทำเล</span>
                    </div>
                    <div className="mt-1 font-display text-xl font-bold text-white md:text-2xl">
                      {area.name}
                    </div>
                    <div className="mt-0.5 text-xs text-white/80">
                      {area.count.toLocaleString()} ประกาศ
                    </div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-all group-hover:bg-accent-500 group-hover:text-ink">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

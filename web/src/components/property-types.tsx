"use client";

import { Building2, Home, Warehouse, Map, Store, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Container } from "./ui/container";
import { propertyTypes } from "@/lib/sample-data";

const iconMap = { Building2, Home, Warehouse, Map, Store };

export function PropertyTypes() {
  return (
    <section id="property-types" className="py-16 md:py-24">
      <Container>
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">
              หมวดหมู่ทรัพย์
            </p>
            <h2 className="mt-2 font-display text-display-md font-bold text-ink">
              เลือกประเภทที่คุณสนใจ
            </h2>
          </div>
          <Link
            href="/search"
            className="hidden items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800 md:inline-flex"
          >
            ดูทั้งหมด <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5 lg:grid-cols-5">
          {propertyTypes.map((type, i) => {
            const Icon = iconMap[type.icon as keyof typeof iconMap];
            return (
              <Link key={type.kind} href={`/search?property_types=${type.kind}`}>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  whileHover={{ y: -4 }}
                  className="group relative overflow-hidden rounded-2xl border border-line bg-surface p-5 transition-all hover:border-brand-300 hover:shadow-lift dark:hover:border-brand-700/60"
                >
                  {/* Radial hover glow */}
                  <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-brand-900/30" />

                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition-all duration-300 group-hover:scale-110 group-hover:rotate-[-6deg] group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-900/40 dark:text-brand-200">
                      <Icon className="h-6 w-6" strokeWidth={2} />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-ink-subtle opacity-0 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-brand-700 group-hover:opacity-100" />
                  </div>
                  <div className="mt-5">
                    <div className="font-display text-base font-semibold text-ink">
                      {type.label}
                    </div>
                    <div className="mt-0.5 text-sm text-ink-muted">
                      {type.count.toLocaleString()} รายการ
                    </div>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

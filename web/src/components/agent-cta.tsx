"use client";

import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Users, BadgeCheck } from "lucide-react";
import Link from "next/link";
import { Container } from "./ui/container";
import { Button } from "./ui/button";

const perks = [
  { icon: Users, label: "2,500+ Agent ใช้งาน" },
  { icon: TrendingUp, label: "เฉลี่ย 8 leads/เดือน" },
  { icon: BadgeCheck, label: "ฟรีไม่มีค่าสมาชิก" },
];

export function AgentCTA() {
  return (
    <section className="py-16 md:py-24">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[32px] bg-gradient-brand px-6 py-12 shadow-lift md:px-16 md:py-16"
        >
          {/* Decorative mesh */}
          <div
            aria-hidden
            className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent-400 opacity-30 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-brand-300 opacity-40 blur-3xl"
          />
          <div aria-hidden className="absolute inset-0 grid-bg opacity-20" />

          <div className="relative grid grid-cols-1 items-center gap-8 md:grid-cols-2">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-400" />
                สำหรับ Agent & เจ้าของทรัพย์
              </div>

              <h2 className="mt-5 font-display text-display-md font-bold leading-tight">
                ลงประกาศฟรี <br />
                รับ Lead คุณภาพจาก AI
              </h2>

              <p className="mt-4 max-w-md text-white/85">
                ระบบของเราส่ง lead ที่ "ตรงใจจริง" ให้คุณ ไม่ใช่แค่ผู้ที่คลิกดู
                — เพราะ AI ช่วยคัดกรองจากความต้องการผู้ใช้แล้ว
              </p>

              <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {perks.map((p) => (
                  <div key={p.label} className="flex items-center gap-2 text-sm text-white/90">
                    <p.icon className="h-4 w-4 text-accent-300" />
                    {p.label}
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/become-agent">
                  <Button variant="accent" size="lg" className="group">
                    สมัครเป็น Agent
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </Link>
                <Link href="/search">
                  <Button variant="ghost" size="lg" className="text-white hover:bg-white/10 hover:text-white">
                    ดูแพ็กเกจ
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right side mock card */}
            <div className="relative hidden md:block">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative mx-auto w-full max-w-sm rounded-2xl bg-white p-5 shadow-lift"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-brand-400 to-accent-400" />
                    <div>
                      <div className="text-xs text-ink-muted">New Lead · 2 นาทีที่แล้ว</div>
                      <div className="font-semibold text-ink">คุณธนพล</div>
                    </div>
                  </div>
                  <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
                    HOT
                  </span>
                </div>
                <div className="mt-4 rounded-xl bg-surface-sunken p-3 text-sm text-ink-soft">
                  "สนใจคอนโดของคุณที่อโศก ราคาตรงงบ ขอดูห้องได้เสาร์นี้ไหมครับ?"
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-ink-muted">Ashton Asoke · ฿6.9M</span>
                  <span className="font-semibold text-brand-700">AI Match 94%</span>
                </div>
              </motion.div>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-6 -left-4 w-48 rounded-xl bg-white/95 p-3 shadow-lift backdrop-blur"
              >
                <div className="text-[10px] font-semibold uppercase tracking-widest text-brand-700">
                  This month
                </div>
                <div className="mt-1 font-display text-2xl font-bold text-ink">+24 Leads</div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-sunken">
                  <div className="h-full w-3/4 rounded-full bg-gradient-brand" />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}

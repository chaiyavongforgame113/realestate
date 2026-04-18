"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, MessageSquare, CheckCircle2, Send } from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <main>
      <Navbar />
      <div className="pt-24 md:pt-28">
        <Container className="max-w-4xl">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-brand-700">
            <ArrowLeft className="h-4 w-4" />
            กลับหน้าแรก
          </Link>

          <h1 className="mt-4 font-display text-display-md font-bold text-ink">ติดต่อเรา</h1>
          <p className="mt-2 text-ink-muted">เราตอบกลับภายใน 24 ชั่วโมงในวันทำการ</p>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
            <motion.form
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="rounded-2xl border border-line bg-white p-6 shadow-soft"
            >
              {sent ? (
                <div className="py-10 text-center">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-brand-600" />
                  <h3 className="mt-3 font-display text-lg font-bold">ได้รับข้อความแล้ว</h3>
                  <p className="mt-1 text-sm text-ink-muted">จะติดต่อกลับทางอีเมลโดยเร็วที่สุด</p>
                </div>
              ) : (
                <>
                  <h3 className="font-display text-base font-bold">ส่งข้อความถึงเรา</h3>
                  <div className="mt-4 space-y-3">
                    <input
                      required
                      placeholder="ชื่อ"
                      className="h-11 w-full rounded-xl border border-line px-3.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    />
                    <input
                      required
                      type="email"
                      placeholder="อีเมล"
                      className="h-11 w-full rounded-xl border border-line px-3.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    />
                    <input
                      placeholder="เรื่อง"
                      className="h-11 w-full rounded-xl border border-line px-3.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    />
                    <textarea
                      required
                      rows={5}
                      placeholder="ข้อความ"
                      className="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    />
                  </div>
                  <Button type="submit" variant="primary" size="md" className="mt-4 w-full">
                    <Send className="h-4 w-4" />
                    ส่งข้อความ
                  </Button>
                </>
              )}
            </motion.form>

            <aside className="space-y-3">
              {[
                { Icon: Mail, label: "อีเมล", value: "hello@estate.ai" },
                { Icon: Phone, label: "โทรศัพท์", value: "02-123-4567" },
                { Icon: MessageSquare, label: "Line", value: "@estate-ai" },
              ].map((x) => (
                <div key={x.label} className="rounded-2xl border border-line bg-white p-5 shadow-soft">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                      <x.Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs text-ink-muted">{x.label}</div>
                      <div className="font-display font-semibold text-ink">{x.value}</div>
                    </div>
                  </div>
                </div>
              ))}
            </aside>
          </div>
        </Container>
      </div>
      <Footer />
    </main>
  );
}

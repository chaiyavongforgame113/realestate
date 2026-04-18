"use client";

import { useState } from "react";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { SampleListing } from "@/lib/sample-data";
import { formatPrice } from "@/lib/utils";

export function EnquiryForm({ listing }: { listing: SampleListing }) {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: `สนใจทรัพย์ ${listing.title} ราคา ${formatPrice(listing.price, listing.priceUnit)} ต้องการนัดชมห้องในสัปดาห์นี้ครับ/ค่ะ`,
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing.id,
          name: form.name,
          phone: form.phone,
          email: form.email,
          message: form.message,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.details?.fieldErrors
          ? Object.values(data.details.fieldErrors).flat().join(", ")
          : data.error;
        throw new Error(msg ?? "ส่งไม่สำเร็จ");
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-soft">
      <h3 className="font-display text-base font-bold text-ink">ติดต่อ Agent</h3>
      <p className="mt-0.5 text-xs text-ink-muted">กรอกข้อมูลเพื่อให้ Agent ติดต่อกลับ</p>

      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-xl border border-brand-100 bg-brand-50 p-4 text-center"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white">
              <CheckCircle2 className="h-6 w-6 text-brand-600" />
            </div>
            <div className="mt-3 font-display font-bold text-brand-900">ส่งคำขอเรียบร้อย</div>
            <p className="mt-1 text-xs text-ink-muted">Agent จะติดต่อกลับภายใน 24 ชม.</p>
            <button
              onClick={() => setSent(false)}
              className="mt-3 text-xs font-semibold text-brand-700 hover:text-brand-800"
            >
              ส่งอีกคำขอ
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={onSubmit}
            className="mt-4 space-y-3"
          >
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <input
                required
                placeholder="ชื่อ"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
              <input
                required
                type="tel"
                placeholder="เบอร์โทร"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="rounded-lg border border-line bg-white px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <input
              type="email"
              placeholder="อีเมล"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            <textarea
              rows={4}
              placeholder="ข้อความ"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full resize-none rounded-lg border border-line bg-white px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            <button
              type="submit"
              disabled={loading}
              className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand text-sm font-semibold text-white shadow-soft transition-all hover:shadow-lift disabled:opacity-50"
            >
              {loading ? "กำลังส่ง..." : (
                <>
                  <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  ส่งคำขอ
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-ink-subtle">
              ฟรีไม่มีค่าใช้จ่าย · ข้อมูลของคุณปลอดภัย
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-line bg-white/95 p-6 shadow-card backdrop-blur-xl md:p-8"
    >
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">ลืมรหัสผ่าน</h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          กรอกอีเมล ระบบจะส่งลิงก์รีเซ็ตรหัสผ่านให้
        </p>
      </div>

      {sent ? (
        <div className="mt-6 rounded-xl border border-brand-100 bg-brand-50 p-4 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-brand-600" />
          <div className="mt-2 font-semibold text-brand-900">ส่งอีเมลแล้ว</div>
          <p className="mt-1 text-xs text-ink-muted">
            เช็คกล่องอีเมลของคุณที่ {email}
          </p>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
          className="mt-6 space-y-3"
        >
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-muted">อีเมล</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-11 w-full rounded-xl border border-line bg-white pl-10 pr-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>
          <button
            type="submit"
            className="group inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-brand text-sm font-semibold text-white shadow-soft hover:shadow-lift"
          >
            ส่งลิงก์รีเซ็ต
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-ink-muted">
        จำได้แล้ว?{" "}
        <Link href="/login" className="font-semibold text-brand-700 hover:text-brand-800">
          เข้าสู่ระบบ
        </Link>
      </p>
    </motion.div>
  );
}

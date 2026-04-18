"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Check, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reqs = [
    { label: "อย่างน้อย 8 ตัว", valid: password.length >= 8 },
    { label: "มีตัวพิมพ์ใหญ่", valid: /[A-Z]/.test(password) },
    { label: "มีตัวเลข", valid: /\d/.test(password) },
  ];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, firstName }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.details?.fieldErrors
          ? Object.values(data.details.fieldErrors).flat().join(", ")
          : data.error;
        throw new Error(msg ?? "สมัครไม่สำเร็จ");
      }
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-line bg-white/95 p-6 shadow-card backdrop-blur-xl md:p-8"
    >
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">เริ่มต้นใช้งาน</h1>
        <p className="mt-1.5 text-sm text-ink-muted">สมัครฟรี · ใช้เวลาไม่เกิน 30 วินาที</p>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink-muted">ชื่อ-นามสกุล</label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="ชื่อของคุณ"
              className="h-11 w-full rounded-xl border border-line bg-white pl-10 pr-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </div>

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

        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink-muted">รหัสผ่าน</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
            <input
              type={showPw ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-11 w-full rounded-xl border border-line bg-white pl-10 pr-10 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-ink-subtle hover:bg-surface-sunken hover:text-ink"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {reqs.map((r) => (
              <span
                key={r.label}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors",
                  r.valid
                    ? "border-brand-200 bg-brand-50 text-brand-800"
                    : "border-line bg-white text-ink-muted"
                )}
              >
                {r.valid && <Check className="h-3 w-3" />}
                {r.label}
              </span>
            ))}
          </div>
        </div>

        <label className="flex items-start gap-2 pt-1">
          <input type="checkbox" required className="mt-0.5 h-4 w-4 rounded border-line text-brand-600 focus:ring-brand-400" />
          <span className="text-xs text-ink-muted">
            ยอมรับ{" "}
            <Link href="/terms" className="text-brand-700 hover:text-brand-800">
              เงื่อนไขการใช้งาน
            </Link>{" "}
            และ{" "}
            <Link href="/privacy" className="text-brand-700 hover:text-brand-800">
              นโยบายความเป็นส่วนตัว
            </Link>
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="group mt-1 inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-brand text-sm font-semibold text-white shadow-soft transition-all hover:shadow-lift disabled:opacity-50"
        >
          {loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}
          {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        มีบัญชีอยู่แล้ว?{" "}
        <Link href="/login" className="font-semibold text-brand-700 hover:text-brand-800">
          เข้าสู่ระบบ
        </Link>
      </p>
    </motion.div>
  );
}

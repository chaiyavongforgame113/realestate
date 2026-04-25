"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Check, AlertCircle, Building2, Home as HomeIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPw, setShowPw] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [asAgent, setAsAgent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("intent") === "agent") {
      setAsAgent(true);
    }
  }, [searchParams]);

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
      router.push(asAgent ? "/become-agent" : "/");
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

      <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl border border-line bg-surface-sunken p-1">
        <button
          type="button"
          onClick={() => setAsAgent(false)}
          className={cn(
            "flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all",
            !asAgent
              ? "bg-white text-brand-700 shadow-soft"
              : "text-ink-muted hover:text-ink"
          )}
        >
          <HomeIcon className="h-4 w-4" />
          ผู้ซื้อ / ผู้เช่า
        </button>
        <button
          type="button"
          onClick={() => setAsAgent(true)}
          className={cn(
            "flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all",
            asAgent
              ? "bg-white text-accent-700 shadow-soft"
              : "text-ink-muted hover:text-ink"
          )}
        >
          <Building2 className="h-4 w-4" />
          Agent / เจ้าของทรัพย์
        </button>
      </div>

      {asAgent && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 rounded-xl border border-accent-200 bg-accent-50 p-3 text-xs text-accent-800"
        >
          <span className="font-semibold">ขั้นตอนถัดไป:</span> หลังสมัครสมาชิก
          เราจะพาคุณไปกรอกข้อมูล Agent พร้อมอัปโหลดใบอนุญาต (ใช้เวลาประมาณ 2 นาที)
        </motion.div>
      )}

      <div className="mt-5 space-y-2">
        <a
          href={`/api/auth/google?redirect=${encodeURIComponent(asAgent ? "/become-agent" : "/")}`}
          className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-line bg-white text-sm font-semibold text-ink shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
        >
          <svg className="h-4 w-4" viewBox="0 0 48 48" fill="none">
            <path fill="#4285F4" d="M46 24.5c0-1.6-.1-3.2-.4-4.7H24v9h12.4c-.5 2.9-2.2 5.4-4.7 7.1v5.9h7.6c4.4-4.1 7-10.1 7-17.3z" />
            <path fill="#34A853" d="M24 47c6.3 0 11.6-2.1 15.5-5.7l-7.6-5.9c-2.1 1.4-4.8 2.3-7.9 2.3-6.1 0-11.2-4.1-13.1-9.6H3v6.1C6.9 42 14.8 47 24 47z" />
            <path fill="#FBBC05" d="M10.9 28.1c-.5-1.4-.8-2.9-.8-4.6s.3-3.2.8-4.6V12.8H3c-1.6 3.2-2.5 6.8-2.5 10.7s.9 7.5 2.5 10.7l7.9-6.1z" />
            <path fill="#EA4335" d="M24 9.5c3.4 0 6.5 1.2 8.9 3.5l6.7-6.7C35.6 2.5 30.3 0 24 0 14.8 0 6.9 5 3 12.8l7.9 6.1C12.8 13.6 17.9 9.5 24 9.5z" />
          </svg>
          สมัครด้วย Google
        </a>
      </div>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-line" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs uppercase tracking-widest text-ink-subtle">หรือ</span>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
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
          {loading
            ? "กำลังสมัคร..."
            : asAgent
            ? "สมัคร & กรอกข้อมูล Agent"
            : "สมัครสมาชิก"}
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

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="h-[400px] animate-pulse rounded-2xl bg-white/60" />}>
      <RegisterForm />
    </Suspense>
  );
}

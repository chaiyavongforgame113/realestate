"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const router = useRouter();
  const search = useSearchParams();
  const redirect = search.get("redirect") ?? "/";
  const reason = search.get("reason");
  const oauthError = search.get("error");

  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "เข้าสู่ระบบไม่สำเร็จ");

      // Redirect based on role
      const role = data.user.role;
      const target =
        redirect !== "/"
          ? redirect
          : role === "admin"
          ? "/admin"
          : role === "agent"
          ? "/agent"
          : "/";
      router.push(target);
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
        <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">ยินดีต้อนรับกลับ</h1>
        <p className="mt-1.5 text-sm text-ink-muted">เข้าสู่ระบบเพื่อดู Favorites และประวัติ</p>
      </div>

      {reason && (
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-accent-200 bg-accent-50 p-3 text-sm text-accent-900">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {reason === "agent" && "กรุณาเข้าสู่ระบบเพื่อเข้าใช้ Agent Portal"}
            {reason === "admin" && "กรุณาเข้าสู่ระบบด้วยบัญชี Admin"}
            {reason === "account" && "กรุณาเข้าสู่ระบบเพื่อเข้าใช้งานฟีเจอร์นี้"}
          </span>
        </div>
      )}

      {oauthError && (
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {oauthError === "google_not_configured" && "Google sign-in ยังไม่ได้ตั้งค่า — ติดต่อผู้ดูแลระบบ"}
            {oauthError === "google_denied" && "คุณยกเลิกการเข้าสู่ระบบด้วย Google"}
            {oauthError === "google_invalid" && "พารามิเตอร์ไม่ครบ ลองใหม่อีกครั้ง"}
            {oauthError === "google_state_mismatch" && "การเข้าสู่ระบบหมดอายุ — กรุณาลองใหม่"}
            {oauthError === "google_exchange_failed" && "เชื่อมต่อ Google ล้มเหลว ลองใหม่อีกครั้ง"}
            {oauthError === "google_email_unverified" && "อีเมล Google ของคุณยังไม่ได้ verify"}
            {oauthError === "account_suspended" && "บัญชีนี้ถูกระงับการใช้งาน"}
          </span>
        </div>
      )}

      <div className="mt-6 space-y-2">
        <a
          href={`/api/auth/google?redirect=${encodeURIComponent(redirect)}`}
          className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-line bg-white text-sm font-semibold text-ink shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
        >
          <svg className="h-4 w-4" viewBox="0 0 48 48" fill="none">
            <path fill="#4285F4" d="M46 24.5c0-1.6-.1-3.2-.4-4.7H24v9h12.4c-.5 2.9-2.2 5.4-4.7 7.1v5.9h7.6c4.4-4.1 7-10.1 7-17.3z" />
            <path fill="#34A853" d="M24 47c6.3 0 11.6-2.1 15.5-5.7l-7.6-5.9c-2.1 1.4-4.8 2.3-7.9 2.3-6.1 0-11.2-4.1-13.1-9.6H3v6.1C6.9 42 14.8 47 24 47z" />
            <path fill="#FBBC05" d="M10.9 28.1c-.5-1.4-.8-2.9-.8-4.6s.3-3.2.8-4.6V12.8H3c-1.6 3.2-2.5 6.8-2.5 10.7s.9 7.5 2.5 10.7l7.9-6.1z" />
            <path fill="#EA4335" d="M24 9.5c3.4 0 6.5 1.2 8.9 3.5l6.7-6.7C35.6 2.5 30.3 0 24 0 14.8 0 6.9 5 3 12.8l7.9 6.1C12.8 13.6 17.9 9.5 24 9.5z" />
          </svg>
          เข้าสู่ระบบด้วย Google
        </a>
      </div>

      <div className="relative my-6">
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
          <div className="flex items-center justify-between">
            <label className="mb-1.5 block text-xs font-medium text-ink-muted">รหัสผ่าน</label>
            <Link href="/forgot-password" className="text-xs font-medium text-brand-700 hover:text-brand-800">
              ลืมรหัสผ่าน?
            </Link>
          </div>
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
        </div>

        <label className="flex items-center gap-2 pt-2">
          <input type="checkbox" className="h-4 w-4 rounded border-line text-brand-600 focus:ring-brand-400" />
          <span className="text-sm text-ink-muted">จดจำฉันไว้</span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="group mt-2 inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-brand text-sm font-semibold text-white shadow-soft transition-all hover:shadow-lift disabled:opacity-50"
        >
          {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
        </button>
      </form>

      <div className="mt-4 rounded-lg bg-surface-sunken p-3 text-[11px] text-ink-muted">
        <div className="font-semibold text-ink-soft">Test accounts:</div>
        <div>admin@estate.app / agent@estate.app / user@estate.app</div>
        <div>รหัสผ่าน: password123</div>
      </div>

      <p className="mt-6 text-center text-sm text-ink-muted">
        ยังไม่มีบัญชี?{" "}
        <Link href="/register" className="font-semibold text-brand-700 hover:text-brand-800">
          สมัครสมาชิก
        </Link>
      </p>
    </motion.div>
  );
}

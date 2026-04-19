"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, Video, MapPin, Check, Loader2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  listingId: string;
  agentId?: string | null;
  title?: string;
};

function nextDays(count: number) {
  const arr: Date[] = [];
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  for (let i = 0; i < count; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    arr.push(d);
  }
  return arr;
}

const SLOTS = ["10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
const WEEKDAY_TH = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];

export function BookViewing({ listingId, agentId, title = "จองดูทรัพย์" }: Props) {
  const days = useMemo(() => nextDays(14), []);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [mode, setMode] = useState<"in_person" | "video">("in_person");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ at: string; url?: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!date || !time) {
      setError("กรุณาเลือกวันและเวลา");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const [h, m] = time.split(":").map(Number);
      const at = new Date(date);
      at.setHours(h, m, 0, 0);
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          agentId,
          scheduledAt: at.toISOString(),
          type: mode,
          note,
          durationMins: 30,
        }),
      });
      if (res.status === 401) {
        window.location.href = "/login?redirect=" + encodeURIComponent(window.location.pathname);
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "จองไม่สำเร็จ");
        return;
      }
      setSuccess({
        at: at.toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" }),
        url: data.appointment?.meetingUrl,
      });
    } catch {
      setError("ระบบขัดข้อง ลองใหม่");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-soft md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
          <Calendar className="h-4 w-4 text-brand-700" />
          {title}
        </h3>
        <span className="text-xs text-ink-muted">ฟรี · ยืนยันใน 24 ชม.</span>
      </div>

      {/* Mode */}
      <div className="mb-4 grid grid-cols-2 gap-2">
        {(
          [
            { key: "in_person", label: "นัดดูที่ทรัพย์", Icon: MapPin },
            { key: "video", label: "วิดีโอคอล", Icon: Video },
          ] as const
        ).map((m) => {
          const active = mode === m.key;
          return (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "border-brand-600 bg-brand-50 text-brand-800 shadow-soft dark:bg-brand-900/40 dark:text-brand-100 dark:border-brand-700"
                  : "border-line bg-surface text-ink-muted hover:border-brand-300"
              )}
            >
              <m.Icon className="h-4 w-4" />
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Date picker — horizontal scroll */}
      <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-ink-muted">เลือกวัน</div>
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
        {days.map((d) => {
          const iso = d.toDateString();
          const active = date && date.toDateString() === iso;
          return (
            <button
              key={iso}
              onClick={() => setDate(d)}
              className={cn(
                "flex shrink-0 flex-col items-center rounded-xl border px-3 py-2 text-xs transition-all",
                active
                  ? "border-brand-600 bg-gradient-brand text-white shadow-soft"
                  : "border-line bg-surface text-ink-muted hover:border-brand-300"
              )}
            >
              <span>{WEEKDAY_TH[d.getDay()]}</span>
              <span className={cn("mt-0.5 font-display text-lg font-bold", active ? "text-white" : "text-ink")}>
                {d.getDate()}
              </span>
              <span className="text-[10px] uppercase">
                {d.toLocaleDateString("th-TH", { month: "short" })}
              </span>
            </button>
          );
        })}
      </div>

      {/* Time slots */}
      <div className="mb-1 mt-3 text-xs font-semibold uppercase tracking-widest text-ink-muted">เลือกเวลา</div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {SLOTS.map((t) => {
          const active = time === t;
          return (
            <button
              key={t}
              onClick={() => setTime(t)}
              className={cn(
                "inline-flex items-center justify-center gap-1 rounded-lg border px-2 py-2 text-sm font-medium transition-all",
                active
                  ? "border-brand-600 bg-brand-50 text-brand-800 dark:bg-brand-900/40 dark:text-brand-100 dark:border-brand-700"
                  : "border-line bg-surface text-ink-muted hover:border-brand-300"
              )}
            >
              <Clock className="h-3.5 w-3.5" />
              {t}
            </button>
          );
        })}
      </div>

      <textarea
        placeholder="โน้ตถึง agent (ไม่บังคับ)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        maxLength={500}
        className="mt-4 w-full resize-none rounded-xl border border-line bg-surface-soft px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
      />

      {error && <div className="mt-2 text-xs text-red-600">{error}</div>}

      <button
        onClick={submit}
        disabled={submitting}
        className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-700 text-sm font-semibold text-white shadow-soft transition-all hover:bg-brand-800 hover:shadow-lift disabled:opacity-60"
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        ยืนยันการจอง
      </button>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-ink/60 p-4 backdrop-blur"
          >
            <div className="glass-card relative w-full max-w-sm p-6 text-center">
              <button
                onClick={() => setSuccess(null)}
                className="absolute right-3 top-3 rounded-full p-1 text-ink-muted hover:text-ink"
                aria-label="ปิด"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                <Check className="h-7 w-7" />
              </div>
              <div className="mt-3 font-display text-lg font-bold text-ink">จองสำเร็จ!</div>
              <div className="mt-1 text-sm text-ink-muted">{success.at}</div>
              {success.url && (
                <a
                  href={success.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-brand px-4 text-sm font-semibold text-white shadow-soft hover:shadow-lift"
                >
                  <Video className="h-4 w-4" />
                  ลิงก์วิดีโอคอล
                </a>
              )}
              <div className="mt-2 text-xs text-ink-subtle">
                เราจะแจ้ง agent และส่งอีเมลยืนยันให้คุณ
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

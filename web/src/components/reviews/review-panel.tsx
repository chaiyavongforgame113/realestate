"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ReviewTargetKind = "listing" | "area" | "project" | "agent";

type Review = {
  id: string;
  rating: number;
  title?: string | null;
  body: string;
  createdAt: string;
};

type Summary = {
  count: number;
  avg: number;
  distribution: { star: number; count: number }[];
};

export function ReviewPanel({
  targetKind,
  targetId,
  heading = "รีวิวจากผู้ใช้งาน",
}: {
  targetKind: ReviewTargetKind;
  targetId: string;
  heading?: string;
}) {
  const [items, setItems] = useState<Review[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/reviews?targetKind=${targetKind}&targetId=${encodeURIComponent(targetId)}`
      );
      const data = await res.json();
      setItems(data.items ?? []);
      setSummary(data.summary ?? null);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetKind, targetId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (rating < 1 || body.trim().length < 3) {
      setError("กรุณาให้คะแนนและเขียนรีวิวอย่างน้อย 3 ตัวอักษร");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetKind,
          targetId,
          rating,
          title: title || undefined,
          body: body.trim(),
        }),
      });
      if (res.status === 401) {
        window.location.href = "/login?redirect=" + encodeURIComponent(window.location.pathname);
        return;
      }
      if (!res.ok) {
        setError("ส่งรีวิวไม่สำเร็จ ลองใหม่อีกครั้ง");
        return;
      }
      setRating(0);
      setTitle("");
      setBody("");
      await load();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-line bg-surface p-4 shadow-soft md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold text-ink">{heading}</h3>
          {summary && summary.count > 0 && (
            <div className="mt-1 flex items-center gap-2 text-sm text-ink-muted">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={cn(
                      "h-4 w-4",
                      n <= Math.round(summary.avg)
                        ? "fill-accent-400 text-accent-400"
                        : "fill-transparent text-ink-subtle"
                    )}
                  />
                ))}
              </div>
              <span className="font-semibold text-ink">{summary.avg.toFixed(1)}</span>
              <span>· {summary.count} รีวิว</span>
            </div>
          )}
        </div>

        {summary && summary.count > 0 && (
          <div className="w-full space-y-1 md:w-60">
            {summary.distribution
              .slice()
              .reverse()
              .map((d) => (
                <div key={d.star} className="flex items-center gap-2 text-xs text-ink-muted">
                  <span className="w-6 shrink-0 text-right">{d.star}★</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-sunken">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{
                        width: `${(d.count / Math.max(1, summary.count)) * 100}%`,
                      }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
                      className="h-full bg-accent-400"
                    />
                  </div>
                  <span className="w-6 shrink-0 tabular-nums">{d.count}</span>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Composer */}
      <form onSubmit={submit} className="mt-5 rounded-xl border border-line bg-surface-soft p-4">
        <div className="mb-2 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(n)}
              className="p-1"
              aria-label={`${n} ดาว`}
            >
              <Star
                className={cn(
                  "h-6 w-6 transition-all",
                  (hover || rating) >= n
                    ? "fill-accent-400 text-accent-400"
                    : "text-ink-subtle"
                )}
              />
            </button>
          ))}
          <span className="ml-2 text-xs text-ink-muted">
            {rating > 0 ? `ให้ ${rating} ดาว` : "คลิกให้คะแนน"}
          </span>
        </div>

        <input
          placeholder="หัวข้อ (ไม่บังคับ)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
        <textarea
          placeholder="แบ่งปันประสบการณ์ของคุณ..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          maxLength={2000}
          className="mt-2 w-full resize-none rounded-lg border border-line bg-surface px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />

        {error && <div className="mt-2 text-xs text-red-600">{error}</div>}

        <div className="mt-3 flex items-center justify-end gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-brand-700 px-4 text-sm font-semibold text-white shadow-soft hover:bg-brand-800 disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            ส่งรีวิว
          </button>
        </div>
      </form>

      {/* List */}
      <div className="mt-5 divide-y divide-line/60">
        {loading ? (
          <div className="flex items-center gap-2 py-4 text-sm text-ink-muted">
            <Loader2 className="h-4 w-4 animate-spin" /> กำลังโหลดรีวิว...
          </div>
        ) : items.length === 0 ? (
          <div className="py-6 text-center text-sm text-ink-muted">
            ยังไม่มีรีวิว — เป็นคนแรกที่แบ่งปันประสบการณ์
          </div>
        ) : (
          items.map((r) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="py-4"
            >
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={cn(
                      "h-3.5 w-3.5",
                      n <= r.rating
                        ? "fill-accent-400 text-accent-400"
                        : "text-ink-subtle"
                    )}
                  />
                ))}
                <span className="ml-2 text-xs text-ink-subtle">
                  {new Date(r.createdAt).toLocaleDateString("th-TH")}
                </span>
              </div>
              {r.title && (
                <div className="mt-1 text-sm font-semibold text-ink">{r.title}</div>
              )}
              <div className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
                {r.body}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </section>
  );
}

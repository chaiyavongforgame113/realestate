"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Calendar, Clock, MapPin, Phone, Mail, Video, Check, X, MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { cn } from "@/lib/utils";

type Status = "requested" | "confirmed" | "cancelled" | "completed" | "no_show";

interface Appointment {
  id: string;
  listing: { id: string; title: string; coverImageUrl: string; price: number; priceUnit: string } | null;
  userName: string;
  userPhone: string;
  userEmail: string;
  scheduledAt: string;
  durationMins: number;
  type: "in_person" | "video";
  status: Status;
  note: string | null;
  cancellationReason: string | null;
  meetingUrl: string | null;
  createdAt: string;
}

const statusTabs: { key: Status | "all"; label: string }[] = [
  { key: "all", label: "ทั้งหมด" },
  { key: "requested", label: "รอยืนยัน" },
  { key: "confirmed", label: "ยืนยันแล้ว" },
  { key: "completed", label: "เสร็จสิ้น" },
  { key: "cancelled", label: "ยกเลิก" },
  { key: "no_show", label: "ไม่มาตามนัด" },
];

const statusStyle: Record<Status, { label: string; cls: string; dot: string }> = {
  requested: { label: "รอยืนยัน", cls: "bg-amber-50 text-amber-900", dot: "bg-amber-500" },
  confirmed: { label: "ยืนยันแล้ว", cls: "bg-emerald-50 text-emerald-800", dot: "bg-emerald-500" },
  cancelled: { label: "ยกเลิก", cls: "bg-surface-sunken text-ink-muted", dot: "bg-ink-subtle" },
  completed: { label: "เสร็จสิ้น", cls: "bg-ink text-white", dot: "bg-white" },
  no_show: { label: "ไม่มาตามนัด", cls: "bg-red-50 text-red-700", dot: "bg-red-500" },
};

function StatusBadge({ status }: { status: Status }) {
  const c = statusStyle[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        c.cls
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", c.dot)} />
      {c.label}
    </span>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("th-TH", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AgentAppointmentsPage() {
  const [tab, setTab] = useState<Status | "all">("all");
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/agent/appointments");
    const data = await res.json();
    setItems(data.appointments ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = items.filter((a) => tab === "all" || a.status === tab);

  const countByStatus = useMemo(
    () =>
      statusTabs.reduce<Record<string, number>>(
        (acc, t) => ({
          ...acc,
          [t.key]: t.key === "all" ? items.length : items.filter((a) => a.status === t.key).length,
        }),
        {}
      ),
    [items]
  );

  const [reasonModal, setReasonModal] = useState<{ id: string; status: "cancelled" | "no_show" } | null>(null);
  const [reasonText, setReasonText] = useState("");
  const [reasonSubmitting, setReasonSubmitting] = useState(false);

  async function updateStatus(id: string, status: Status, reason?: string) {
    const res = await fetch(`/api/agent/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, reason }),
    });
    if (res.ok) await load();
  }

  function openReason(id: string, status: "cancelled" | "no_show") {
    setReasonText("");
    setReasonModal({ id, status });
  }

  async function submitReason() {
    if (!reasonModal || !reasonText.trim()) return;
    setReasonSubmitting(true);
    try {
      await updateStatus(reasonModal.id, reasonModal.status, reasonText.trim());
      setReasonModal(null);
    } finally {
      setReasonSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader title="นัดดูทรัพย์" description="จัดการการนัดดูจากลูกค้า" />

      <div className="mb-5 flex flex-wrap items-center gap-1.5 overflow-x-auto rounded-2xl border border-line bg-white p-1.5 shadow-soft">
        {statusTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "relative shrink-0 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors",
              tab === t.key ? "bg-ink text-white" : "text-ink-muted hover:text-ink"
            )}
          >
            {t.label}
            {countByStatus[t.key] > 0 && (
              <span
                className={cn(
                  "ml-2 rounded-full px-1.5 text-[10px] font-semibold",
                  tab === t.key ? "bg-white/20 text-white" : "bg-brand-100 text-brand-800"
                )}
              >
                {countByStatus[t.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-line bg-white py-16 text-center text-sm text-ink-muted shadow-soft">
          กำลังโหลด...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white/60 py-16 text-center">
          <Calendar className="mx-auto h-10 w-10 text-ink-subtle" />
          <p className="mt-3 font-display text-base font-semibold text-ink">ยังไม่มีนัดดูในหมวดนี้</p>
          <p className="mt-1 text-sm text-ink-muted">เมื่อลูกค้าจองดูทรัพย์ จะแสดงที่นี่</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => (
            <article
              key={a.id}
              className="rounded-2xl border border-line bg-white p-4 shadow-soft transition-shadow hover:shadow-lift md:p-5"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start">
                {/* Listing thumb */}
                <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-xl bg-surface-sunken">
                  {a.listing?.coverImageUrl && (
                    <Image
                      src={a.listing.coverImageUrl}
                      alt={a.listing?.title ?? ""}
                      fill
                      sizes="128px"
                      className="object-cover"
                    />
                  )}
                </div>

                {/* Body */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-display text-base font-bold text-ink line-clamp-1">
                        {a.listing?.title ?? "ทรัพย์ถูกลบ"}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-ink-muted">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(a.scheduledAt)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {a.durationMins} นาที
                        </span>
                        <span className="inline-flex items-center gap-1">
                          {a.type === "video" ? <Video className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
                          {a.type === "video" ? "วิดีโอคอล" : "เข้าดูสถานที่"}
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>

                  {/* Customer */}
                  <div className="mt-3 rounded-xl bg-surface-soft/60 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-brand text-xs font-semibold text-white">
                          {a.userName[0]}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-ink">{a.userName}</div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ink-muted">
                            {a.userPhone && (
                              <a href={`tel:${a.userPhone}`} className="inline-flex items-center gap-1 hover:text-brand-700">
                                <Phone className="h-3 w-3" />
                                {a.userPhone}
                              </a>
                            )}
                            {a.userEmail && (
                              <a href={`mailto:${a.userEmail}`} className="inline-flex items-center gap-1 hover:text-brand-700">
                                <Mail className="h-3 w-3" />
                                {a.userEmail}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    {a.note && (
                      <div className="mt-2 flex gap-2 rounded-lg bg-white px-3 py-2 text-sm text-ink-soft">
                        <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-subtle" />
                        <span className="italic">"{a.note}"</span>
                      </div>
                    )}
                  </div>

                  {/* Cancellation/no-show reason */}
                  {a.cancellationReason && (a.status === "cancelled" || a.status === "no_show") && (
                    <div className="mt-3 rounded-xl border border-red-100 bg-red-50/50 px-3 py-2 text-sm">
                      <div className="text-[11px] font-semibold uppercase tracking-widest text-red-700">
                        เหตุผล
                      </div>
                      <div className="mt-0.5 text-ink-soft">{a.cancellationReason}</div>
                    </div>
                  )}

                  {/* Actions */}
                  {(a.status === "requested" || a.status === "confirmed") && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {a.status === "requested" && (
                        <button
                          onClick={() => updateStatus(a.id, "confirmed")}
                          className="inline-flex h-8 items-center gap-1 rounded-lg bg-brand-700 px-3 text-xs font-semibold text-white hover:bg-brand-800"
                        >
                          <Check className="h-3.5 w-3.5" />
                          ยืนยัน
                        </button>
                      )}
                      {a.status === "confirmed" && (
                        <button
                          onClick={() => updateStatus(a.id, "completed")}
                          className="inline-flex h-8 items-center gap-1 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white hover:bg-emerald-700"
                        >
                          <Check className="h-3.5 w-3.5" />
                          เสร็จสิ้น
                        </button>
                      )}
                      <button
                        onClick={() => openReason(a.id, "cancelled")}
                        className="inline-flex h-8 items-center gap-1 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-ink-muted hover:border-red-300 hover:text-red-700"
                      >
                        <X className="h-3.5 w-3.5" />
                        ยกเลิก
                      </button>
                      {a.status === "confirmed" && (
                        <button
                          onClick={() => openReason(a.id, "no_show")}
                          className="inline-flex h-8 items-center gap-1 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-ink-muted hover:border-red-300 hover:text-red-700"
                        >
                          ไม่มาตามนัด
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {reasonModal && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm"
          onClick={() => !reasonSubmitting && setReasonModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-line bg-white p-5 shadow-lift"
          >
            <h3 className="font-display text-base font-bold text-ink">
              {reasonModal.status === "cancelled" ? "ยกเลิกนัดดู" : "บันทึก: ลูกค้าไม่มาตามนัด"}
            </h3>
            <p className="mt-1 text-sm text-ink-muted">
              ระบุเหตุผลเพื่อให้ลูกค้าเข้าใจสถานการณ์ — ระบบจะแจ้งเตือนลูกค้าโดยอัตโนมัติ
            </p>
            <textarea
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              autoFocus
              rows={4}
              maxLength={500}
              placeholder={
                reasonModal.status === "cancelled"
                  ? "เช่น เจ้าของขายให้คนอื่นแล้ว / ติดธุระด่วน / ขอเลื่อนเป็นวันอื่น..."
                  : "เช่น ลูกค้าไม่ยืนยัน / โทรไม่รับ / มาไม่ตรงเวลา..."
              }
              className="mt-3 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            <div className="mt-1 text-right text-[11px] text-ink-subtle">
              {reasonText.length}/500
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={() => setReasonModal(null)}
                disabled={reasonSubmitting}
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink-muted hover:bg-surface-sunken disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={submitReason}
                disabled={!reasonText.trim() || reasonSubmitting}
                className="inline-flex h-9 items-center gap-1 rounded-lg bg-brand-700 px-3 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50"
              >
                {reasonSubmitting ? "กำลังบันทึก..." : "ยืนยัน"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

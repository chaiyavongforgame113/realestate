"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, MapPin, Video, Phone, ArrowRight, X, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { cn, formatPrice } from "@/lib/utils";

type Status = "requested" | "confirmed" | "cancelled" | "completed" | "no_show";

interface Appointment {
  id: string;
  listing: { id: string; title: string; coverImageUrl: string; price: number; priceUnit: string } | null;
  agent: { name: string; avatar: string | null; phone: string | null } | null;
  scheduledAt: string;
  durationMins: number;
  type: "in_person" | "video";
  status: Status;
  note: string | null;
  cancellationReason: string | null;
  meetingUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

const statusTabs: { key: Status | "all"; label: string }[] = [
  { key: "all", label: "ทั้งหมด" },
  { key: "requested", label: "รอ Agent ยืนยัน" },
  { key: "confirmed", label: "ยืนยันแล้ว" },
  { key: "completed", label: "เสร็จสิ้น" },
  { key: "cancelled", label: "ยกเลิก" },
  { key: "no_show", label: "ไม่มาตามนัด" },
];

const statusStyle: Record<Status, { label: string; cls: string; dot: string }> = {
  requested: { label: "รอ Agent ยืนยัน", cls: "bg-amber-50 text-amber-900", dot: "bg-amber-500" },
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
  return new Date(iso).toLocaleString("th-TH", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MyAppointmentsPage() {
  const [tab, setTab] = useState<Status | "all">("all");
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/appointments")
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((data) => setItems(data.items ?? []))
      .finally(() => setLoading(false));
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

  return (
    <div>
      <PageHeader
        title="ประวัติการนัดดู"
        description={`${items.length} รายการ · ติดตามสถานะการนัดดูทรัพย์ของคุณ`}
      />

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
        <div className="py-10 text-center text-sm text-ink-muted">กำลังโหลด...</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="ยังไม่มีการนัดดูในหมวดนี้"
          description="จองดูทรัพย์ผ่านหน้ารายละเอียดประกาศ — Agent จะยืนยันให้คุณ"
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((a) => (
            <article
              key={a.id}
              className="rounded-2xl border border-line bg-white p-5 shadow-soft transition-shadow hover:shadow-lift"
            >
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl md:h-20 md:w-32">
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

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      {a.listing ? (
                        <Link
                          href={`/listing/${a.listing.id}`}
                          className="line-clamp-1 font-display text-base font-bold text-ink hover:text-brand-700"
                        >
                          {a.listing.title}
                        </Link>
                      ) : (
                        <span className="font-display text-base font-bold text-ink-muted">
                          ทรัพย์ถูกลบ
                        </span>
                      )}
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm">
                        {a.listing && (
                          <span className="font-display font-semibold text-ink">
                            {formatPrice(a.listing.price, a.listing.priceUnit as "total" | "per_month")}
                          </span>
                        )}
                        {a.agent && (
                          <>
                            <span className="text-ink-subtle">·</span>
                            <span className="text-ink-muted">Agent: {a.agent.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-ink-muted sm:grid-cols-3">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(a.scheduledAt)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {a.durationMins} นาที
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      {a.type === "video" ? <Video className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
                      {a.type === "video" ? "วิดีโอคอล" : "เข้าดูสถานที่"}
                    </span>
                  </div>

                  {/* Cancellation reason from agent */}
                  {a.cancellationReason && (a.status === "cancelled" || a.status === "no_show") && (
                    <div className="mt-3 flex gap-2 rounded-xl border border-red-100 bg-red-50/50 px-3 py-2 text-sm">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-700" />
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-widest text-red-700">
                          เหตุผลจาก Agent
                        </div>
                        <div className="mt-0.5 text-ink-soft">{a.cancellationReason}</div>
                      </div>
                    </div>
                  )}

                  {/* Confirmed: meeting URL or contact */}
                  {a.status === "confirmed" && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {a.type === "video" && a.meetingUrl && (
                        <a
                          href={a.meetingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-8 items-center gap-1 rounded-lg bg-brand-700 px-3 text-xs font-semibold text-white hover:bg-brand-800"
                        >
                          <Video className="h-3.5 w-3.5" />
                          เข้าห้องประชุม
                        </a>
                      )}
                      {a.agent?.phone && (
                        <a
                          href={`tel:${a.agent.phone}`}
                          className="inline-flex h-8 items-center gap-1 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-ink-muted hover:border-brand-300 hover:text-brand-800"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          โทร Agent
                        </a>
                      )}
                    </div>
                  )}

                  {a.note && (
                    <p className="mt-3 line-clamp-2 rounded-lg bg-surface-soft/70 p-2.5 text-sm italic text-ink-soft">
                      "{a.note}"
                    </p>
                  )}

                  {a.listing && (
                    <div className="mt-3 flex items-center justify-end">
                      <Link
                        href={`/listing/${a.listing.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800"
                      >
                        ดูประกาศ <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Check, X, MessageSquareWarning, AlertTriangle, Sparkles, Eye } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { formatPrice, cn } from "@/lib/utils";
import type { ListingDTO } from "@/lib/listings/transform";

const checklist = [
  "รูปภาพชัดเจน ไม่มีลายน้ำซ้ำซ้อน",
  "ราคาสมเหตุสมผลกับทำเล",
  "ข้อมูลสำคัญครบ (ขนาด, ห้องนอน, ที่ตั้ง)",
  "พิกัด Map ถูกต้อง",
  "ไม่พบประกาศซ้ำในระบบ",
  "ไม่มีข้อมูลติดต่อซ่อนอยู่ในรูปภาพ",
];

export default function AdminListingsPage() {
  const [queue, setQueue] = useState<ListingDTO[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checks, setChecks] = useState<Record<string, boolean[]>>({});
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/listings/queue");
    const data = await res.json();
    setQueue(data.listings ?? []);
    setChecks(
      Object.fromEntries((data.listings ?? []).map((l: ListingDTO) => [l.id, Array(checklist.length).fill(false)]))
    );
    if (data.listings?.length && !selectedId) setSelectedId(data.listings[0].id);
    else if (!data.listings?.length) setSelectedId(null);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = queue.find((m) => m.id === selectedId);

  const toggleCheck = (i: number) => {
    if (!selected) return;
    setChecks((c) => ({
      ...c,
      [selected.id]: c[selected.id].map((v, idx) => (idx === i ? !v : v)),
    }));
  };

  async function review(action: "approve" | "reject" | "request_revision" | "unpublish") {
    if (!selected) return;
    const res = await fetch(`/api/admin/listings/${selected.id}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reason }),
    });
    if (res.ok) {
      setReason("");
      await load();
    }
  }

  return (
    <div>
      <PageHeader
        title="Listing Moderation Queue"
        description={`${queue.length} ประกาศรอพิจารณา`}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[360px_1fr]">
        <div className="rounded-2xl border border-line bg-white shadow-soft">
          <div className="max-h-[72vh] overflow-y-auto">
            {loading ? (
              <div className="py-10 text-center text-sm text-ink-muted">กำลังโหลด...</div>
            ) : queue.length === 0 ? (
              <div className="py-10 text-center text-sm text-ink-muted">ไม่มีประกาศที่รอตรวจ ✨</div>
            ) : queue.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedId(m.id)}
                className={cn(
                  "flex w-full items-start gap-3 border-b border-line p-3 text-left transition-colors last:border-0 hover:bg-surface-soft/60",
                  selectedId === m.id && "bg-brand-50/40"
                )}
              >
                <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg">
                  <Image src={m.coverImageUrl} alt={m.title} fill sizes="80px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-2 text-sm font-semibold text-ink">{m.title}</div>
                  <div className="mt-0.5 text-xs text-ink-muted">
                    by {m.agent?.name ?? "—"} · {new Date(m.createdAt).toLocaleDateString("th-TH")}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white shadow-soft">
          {selected ? (
            <ModerationDetail
              listing={selected}
              checks={checks[selected.id] ?? []}
              toggleCheck={toggleCheck}
              reason={reason}
              setReason={setReason}
              review={review}
            />
          ) : (
            <div className="flex h-full min-h-[400px] items-center justify-center text-sm text-ink-muted">
              เลือกประกาศ
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ModerationDetail({
  listing,
  checks,
  toggleCheck,
  reason,
  setReason,
  review,
}: {
  listing: ListingDTO;
  checks: boolean[];
  toggleCheck: (i: number) => void;
  reason: string;
  setReason: (v: string) => void;
  review: (action: "approve" | "reject" | "request_revision" | "unpublish") => void;
}) {
  const allChecked = checks.every(Boolean);

  return (
    <div className="flex flex-col">
      <div className="relative aspect-[2.5/1] overflow-hidden">
        <Image src={listing.coverImageUrl} alt={listing.title} fill sizes="800px" className="object-cover" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-5 text-white">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h3 className="font-display text-xl font-bold">{listing.title}</h3>
              <div className="mt-1 text-sm">by {listing.agent?.name ?? "—"}</div>
            </div>
            <div className="font-display text-2xl font-bold">{formatPrice(listing.price, listing.priceUnit as "total" | "per_month")}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
        <div className="rounded-xl border border-brand-100 bg-brand-50/50 p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="font-display font-bold text-brand-900">AI Auto-check</div>
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-center gap-2 text-brand-800">
              <Check className="h-4 w-4 text-brand-600" /> ข้อมูลครบถ้วน
            </li>
            <li className="flex items-center gap-2 text-brand-800">
              <Check className="h-4 w-4 text-brand-600" /> ไม่พบประกาศซ้ำในระบบ
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-line bg-surface-soft/50 p-4">
          <div className="font-display font-bold text-ink">Checklist ตรวจสอบด้วยตนเอง</div>
          <ul className="mt-3 space-y-2">
            {checklist.map((c, i) => (
              <li key={i}>
                <label className="flex cursor-pointer items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={checks[i] ?? false}
                    onChange={() => toggleCheck(i)}
                    className="mt-0.5 h-4 w-4 rounded border-line text-brand-600 focus:ring-brand-400"
                  />
                  <span className={cn("text-ink-soft", checks[i] && "text-ink line-through")}>{c}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-line p-6">
        <div className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
          เหตุผล / Note
        </div>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={2}
          placeholder="ระบุเหตุผลสำหรับการปฏิเสธหรือขอแก้ไข..."
          className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-ink-muted">
            {allChecked ? (
              <span className="font-semibold text-brand-700">✓ ตรวจครบแล้ว</span>
            ) : (
              `ตรวจแล้ว ${checks.filter(Boolean).length}/${checklist.length}`
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="md" onClick={() => review("request_revision")}>
              <MessageSquareWarning className="h-4 w-4" />
              ขอแก้ไข
            </Button>
            <Button
              variant="ghost"
              size="md"
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => review("reject")}
            >
              <X className="h-4 w-4" />
              ปฏิเสธ
            </Button>
            <Button variant="primary" size="md" disabled={!allChecked} onClick={() => review("approve")}>
              <Check className="h-4 w-4" />
              อนุมัติ
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

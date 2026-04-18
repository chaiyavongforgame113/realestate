"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, MoreVertical, Eye, MessageSquare, Edit3, Trash2, Search, Send } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusChip } from "@/components/dashboard/status-chip";
import { Button } from "@/components/ui/button";
import { formatPrice, cn } from "@/lib/utils";
import type { ListingDTO } from "@/lib/listings/transform";

const tabs = [
  { key: "all", label: "ทั้งหมด" },
  { key: "published", label: "เผยแพร่" },
  { key: "pending_review", label: "รอพิจารณา" },
  { key: "revision_requested", label: "ขอแก้ไข" },
  { key: "draft", label: "ฉบับร่าง" },
] as const;

type AgentListing = ListingDTO & { enquiries?: number; views?: number };

export default function AgentListingsPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]["key"]>("all");
  const [q, setQ] = useState("");
  const [listings, setListings] = useState<AgentListing[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/agent/listings");
    const data = await res.json();
    setListings(data.listings ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = listings.filter((l) => {
    if (tab !== "all" && l.status !== tab) return false;
    if (q && !l.title.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  async function submitForReview(id: string) {
    const res = await fetch(`/api/agent/listings/${id}/submit`, { method: "POST" });
    if (res.ok) load();
  }

  async function deleteListing(id: string) {
    if (!confirm("ยืนยันการลบประกาศ?")) return;
    const res = await fetch(`/api/agent/listings/${id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  return (
    <div>
      <PageHeader
        title="ประกาศของฉัน"
        description="จัดการประกาศทั้งหมด · ดูสถานะและปรับปรุง"
        action={
          <Link href="/agent/listings/new">
            <Button variant="primary" size="md">
              <Plus className="h-4 w-4" />
              ลงประกาศใหม่
            </Button>
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap items-center gap-1 rounded-full border border-line bg-white p-1 shadow-soft">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                tab === t.key ? "bg-ink text-white" : "text-ink-muted hover:text-ink"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 shadow-soft">
          <Search className="h-4 w-4 text-ink-subtle" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ค้นหาประกาศ"
            className="w-48 bg-transparent text-sm focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-line bg-surface-soft/70">
              {["ประกาศ", "ราคา", "สถานะ", "Enquiries", "อัปเดต", ""].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-ink-muted"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-10 text-center text-sm text-ink-muted">กำลังโหลด...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="p-10 text-center text-sm text-ink-muted">ไม่พบประกาศที่ตรงกับเงื่อนไข</td></tr>
            ) : filtered.map((l) => (
              <tr key={l.id} className="group border-b border-line transition-colors hover:bg-surface-soft/50 last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/agent/listings/${l.id}/edit`} className="flex items-center gap-3">
                    <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg">
                      <Image src={l.coverImageUrl} alt={l.title} fill sizes="80px" className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="line-clamp-2 text-sm font-semibold text-ink">{l.title}</div>
                      <div className="mt-0.5 text-xs text-ink-muted">{l.district}</div>
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <div className="font-display text-sm font-bold text-ink">
                    {formatPrice(l.price, l.priceUnit as "total" | "per_month")}
                  </div>
                  <div className="mt-0.5 text-[11px] text-ink-muted">
                    {l.listingType === "sale" ? "ขาย" : "เช่า"}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <StatusChip status={l.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-sm text-ink">
                    <MessageSquare className="h-3.5 w-3.5 text-ink-muted" />
                    {l.enquiries ?? 0}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-ink-muted">
                  {l.publishedAt ? new Date(l.publishedAt).toLocaleDateString("th-TH") : new Date(l.createdAt).toLocaleDateString("th-TH")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {(l.status === "draft" || l.status === "revision_requested") && (
                      <button
                        onClick={() => submitForReview(l.id)}
                        title="ส่งรออนุมัติ"
                        className="flex h-8 items-center gap-1 rounded-lg border border-brand-600 bg-brand-50 px-2 text-[11px] font-semibold text-brand-800 hover:bg-brand-100"
                      >
                        <Send className="h-3 w-3" />
                        ส่ง
                      </button>
                    )}
                    <Link
                      href={`/agent/listings/${l.id}/edit`}
                      title="แก้ไข"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-sunken hover:text-ink"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Link>
                    {l.status === "draft" && (
                      <button
                        onClick={() => deleteListing(l.id)}
                        title="ลบ"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-sunken hover:text-ink">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

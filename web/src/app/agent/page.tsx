"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, MessageSquare, TrendingUp, Wallet, Plus, ArrowRight, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusChip } from "@/components/dashboard/status-chip";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import type { ListingDTO } from "@/lib/listings/transform";

interface Lead {
  id: string;
  userName: string;
  message: string;
  status: "new" | "contacted" | "viewing_scheduled" | "negotiating" | "won" | "lost" | "spam";
  createdAt: string;
}

interface Stats {
  published: number;
  pending: number;
  totalEnquiries: number;
  newEnquiries: number;
}

export default function AgentDashboardPage() {
  const [listings, setListings] = useState<(ListingDTO & { enquiries?: number; views?: number })[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/agent/listings").then((r) => r.ok ? r.json() : { listings: [] }),
      fetch("/api/agent/leads").then((r) => r.ok ? r.json() : { leads: [] }),
      fetch("/api/agent/stats").then((r) => r.ok ? r.json() : null),
    ]).then(([l, ld, s]) => {
      setListings(l.listings ?? []);
      setLeads(ld.leads ?? []);
      setStats(s);
    });
  }, []);

  const totalEnquiries = listings.reduce((s, l) => s + (l.enquiries ?? 0), 0);

  return (
    <div>
      <PageHeader
        title="ภาพรวม"
        description="สรุปประกาศและ lead ใน 30 วันที่ผ่านมา"
        action={
          <Link href="/agent/listings/new">
            <Button variant="primary" size="md">
              <Plus className="h-4 w-4" />
              ลงประกาศใหม่
            </Button>
          </Link>
        }
      />

      {/* AI Insight Card */}
      <div className="mb-6 relative overflow-hidden rounded-2xl bg-gradient-brand p-5 text-white shadow-lift md:p-6">
        <div
          aria-hidden
          className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-accent-400/30 blur-3xl"
        />
        <div className="relative flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold uppercase tracking-widest text-white/80">
              AI Insight สำหรับคุณ
            </div>
            <p className="mt-1 text-base font-medium md:text-lg">
              คุณมี <span className="font-bold">{stats?.newEnquiries ?? 0}</span> lead ใหม่ที่ยังไม่ได้ติดต่อ — โทรภายใน 24 ชม. เพิ่มโอกาสปิดการขาย 3 เท่า
            </p>
            <Link href="/agent/leads" className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm hover:bg-white/25">
              ดู Leads <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:gap-5 lg:grid-cols-4">
        <StatCard
          label="เผยแพร่"
          value={stats?.published ?? "—"}
          change={`${stats?.published ?? 0} listings active`}
          icon={Wallet}
          accent="brand"
        />
        <StatCard
          label="รอพิจารณา"
          value={stats?.pending ?? "—"}
          change={stats?.pending ? "กำลังรอ admin" : "ไม่มี"}
          icon={TrendingUp}
          accent="accent"
        />
        <StatCard
          label="Enquiries รวม"
          value={stats?.totalEnquiries ?? totalEnquiries}
          change="จากทุกประกาศ"
          icon={Eye}
          accent="ink"
        />
        <StatCard
          label="Lead ใหม่"
          value={stats?.newEnquiries ?? 0}
          change={stats?.newEnquiries ? "ต้องติดต่อด่วน" : "ไม่มี"}
          trend={stats?.newEnquiries ? "up" : "flat"}
          icon={MessageSquare}
          accent="brand"
        />
      </div>

      {/* Recent listings & leads */}
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold">ประกาศล่าสุด</h3>
            <Link href="/agent/listings" className="text-xs font-semibold text-brand-700 hover:text-brand-800">
              ดูทั้งหมด →
            </Link>
          </div>
          <div className="mt-3 space-y-2.5">
            {listings.slice(0, 4).map((l) => (
              <Link
                key={l.id}
                href={`/agent/listings/${l.id}/edit`}
                className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-surface-sunken"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                  <Image src={l.coverImageUrl} alt={l.title} fill sizes="56px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-ink">{l.title}</div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-ink-muted">
                    <span>{formatPrice(l.price, l.priceUnit as "total" | "per_month")}</span>
                    <span>·</span>
                    <span>{l.enquiries ?? 0} enquiries</span>
                  </div>
                </div>
                <StatusChip status={l.status} />
              </Link>
            ))}
            {listings.length === 0 && (
              <div className="py-8 text-center text-sm text-ink-muted">
                ยังไม่มีประกาศ —{" "}
                <Link href="/agent/listings/new" className="font-semibold text-brand-700">
                  เริ่มลงประกาศ
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold">Leads ล่าสุด</h3>
            <Link href="/agent/leads" className="text-xs font-semibold text-brand-700 hover:text-brand-800">
              ดูทั้งหมด →
            </Link>
          </div>
          <div className="mt-3 space-y-2.5">
            {leads.slice(0, 4).map((lead) => (
              <Link
                key={lead.id}
                href="/agent/leads"
                className="group flex items-start gap-3 rounded-xl p-2 transition-colors hover:bg-surface-sunken"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-sm font-semibold text-white">
                  {lead.userName[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-ink">{lead.userName}</div>
                  <div className="mt-0.5 line-clamp-1 text-xs text-ink-muted">{lead.message}</div>
                </div>
                <StatusChip status={lead.status} />
              </Link>
            ))}
            {leads.length === 0 && (
              <div className="py-8 text-center text-sm text-ink-muted">ยังไม่มี lead เข้ามา</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

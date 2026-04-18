"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users2, Building2, ClipboardCheck, MessageSquare, ArrowRight, AlertTriangle, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusChip } from "@/components/dashboard/status-chip";

interface Stats {
  totalUsers: number;
  activeAgents: number;
  publishedListings: number;
  pendingListings: number;
  pendingApplications: number;
  enquiriesToday: number;
}

interface AppRow {
  id: string;
  fullName: string;
  companyName: string | null;
  experienceYears: number;
  status: "pending_review" | "approved" | "rejected" | "info_requested";
}

interface ListingRow {
  id: string;
  title: string;
  coverImageUrl: string;
  agent: { name: string } | null;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [apps, setApps] = useState<AppRow[]>([]);
  const [queue, setQueue] = useState<ListingRow[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/stats").then((r) => r.json()),
      fetch("/api/admin/agents/applications?status=pending_review").then((r) => r.json()),
      fetch("/api/admin/listings/queue").then((r) => r.json()),
    ]).then(([s, a, l]) => {
      setStats(s);
      setApps(a.applications ?? []);
      setQueue(l.listings ?? []);
    });
  }, []);

  return (
    <div>
      <PageHeader title="Admin Dashboard" description="ภาพรวมระบบและงานค้าง" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Users" value={stats?.totalUsers.toLocaleString() ?? "—"} change="ผู้ใช้ทั้งหมด" trend="flat" icon={Users2} accent="brand" />
        <StatCard label="Active Agents" value={stats?.activeAgents.toLocaleString() ?? "—"} change="ที่ active" icon={Building2} accent="accent" />
        <StatCard label="Listings Live" value={stats?.publishedListings.toLocaleString() ?? "—"} change="เผยแพร่" icon={ClipboardCheck} accent="ink" />
        <StatCard label="Enquiries Today" value={stats?.enquiriesToday ?? "—"} change="วันนี้" trend="up" icon={MessageSquare} accent="brand" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Link
          href="/admin/agents"
          className="group flex items-start gap-3 rounded-2xl border border-accent-200 bg-accent-50/60 p-4 transition-all hover:bg-accent-50"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-500 text-white">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="font-display text-sm font-bold text-accent-900">
              Agent Applications รอพิจารณา
            </div>
            <p className="mt-0.5 text-sm text-ink-soft">
              {stats?.pendingApplications ?? 0} ใบสมัครใหม่
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-accent-700 transition-transform group-hover:translate-x-0.5" />
        </Link>

        <Link
          href="/admin/listings"
          className="group flex items-start gap-3 rounded-2xl border border-brand-200 bg-brand-50/50 p-4 transition-all hover:bg-brand-50"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-700 text-white">
            <ClipboardCheck className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="font-display text-sm font-bold text-brand-900">
              Listing Moderation Queue
            </div>
            <p className="mt-0.5 text-sm text-ink-soft">
              {stats?.pendingListings ?? 0} ประกาศรอตรวจ
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-brand-700 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold">Agent Applications ล่าสุด</h3>
            <Link href="/admin/agents" className="text-xs font-semibold text-brand-700 hover:text-brand-800">
              ดูทั้งหมด →
            </Link>
          </div>
          <div className="mt-3 space-y-2.5">
            {apps.slice(0, 3).map((a) => (
              <div key={a.id} className="flex items-center gap-3 rounded-xl p-2 hover:bg-surface-sunken">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-sm font-semibold text-white">
                  {a.fullName[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-ink">{a.fullName}</div>
                  <div className="mt-0.5 text-xs text-ink-muted">
                    {a.companyName ?? "—"} · {a.experienceYears} ปี
                  </div>
                </div>
                <StatusChip status={a.status} />
              </div>
            ))}
            {apps.length === 0 && <div className="py-6 text-center text-sm text-ink-muted">ไม่มีใบสมัครที่รอพิจารณา</div>}
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold">Listing Review Queue</h3>
            <Link href="/admin/listings" className="text-xs font-semibold text-brand-700 hover:text-brand-800">
              ดูทั้งหมด →
            </Link>
          </div>
          <div className="mt-3 space-y-2.5">
            {queue.slice(0, 3).map((m) => (
              <div key={m.id} className="flex items-center gap-3 rounded-xl p-2 hover:bg-surface-sunken">
                <div className="h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-surface-sunken">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.coverImageUrl} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-ink">{m.title}</div>
                  <div className="mt-0.5 text-xs text-ink-muted">by {m.agent?.name ?? "—"}</div>
                </div>
              </div>
            ))}
            {queue.length === 0 && <div className="py-6 text-center text-sm text-ink-muted">ไม่มีประกาศที่รอตรวจ</div>}
          </div>
        </section>
      </div>

      <section className="mt-6 relative overflow-hidden rounded-2xl bg-ink p-6 text-white">
        <div aria-hidden className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-brand-600/40 blur-3xl" />
        <div className="relative flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-brand">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold uppercase tracking-widest text-white/80">AI Search Analytics</div>
            <p className="mt-1 text-lg font-medium">
              คำค้นยอดนิยมวันนี้ — รอเชื่อมต่อ Gemini (Phase 4)
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

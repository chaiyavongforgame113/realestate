"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Users2, Building2, MessageSquare, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";

interface Stats {
  totalUsers: number;
  activeAgents: number;
  publishedListings: number;
  pendingListings: number;
  pendingApplications: number;
  enquiriesToday: number;
}

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then(setStats);
  }, []);

  return (
    <div>
      <PageHeader title="Platform Analytics" description="ภาพรวมการเติบโตและสุขภาพของระบบ" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="ผู้ใช้" value={stats?.totalUsers.toLocaleString() ?? "—"} icon={Users2} accent="brand" />
        <StatCard label="Agent Active" value={stats?.activeAgents.toLocaleString() ?? "—"} icon={Building2} accent="accent" />
        <StatCard label="Listings Live" value={stats?.publishedListings.toLocaleString() ?? "—"} icon={TrendingUp} accent="ink" />
        <StatCard label="Enquiries (today)" value={stats?.enquiriesToday ?? "—"} icon={MessageSquare} accent="brand" />
      </div>

      <section className="mt-6 rounded-2xl border border-line bg-white p-6 shadow-soft">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-brand-600" />
          <h3 className="font-display text-base font-bold">Growth Chart</h3>
        </div>
        <p className="mt-1 text-xs text-ink-muted">การเติบโตรายเดือน</p>

        {/* Placeholder bar chart */}
        <div className="mt-6 flex h-56 items-end gap-2">
          {[42, 56, 68, 82, 90, 112, 134, 148, 172, 188, 210, 245].map((v, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-gradient-to-t from-brand-600 to-brand-400 transition-all hover:from-brand-700 hover:to-brand-500"
                style={{ height: `${(v / 245) * 100}%` }}
              />
              <span className="text-[10px] text-ink-muted">{i + 1}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-line bg-white p-6 shadow-soft">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-brand-600" />
          <h3 className="font-display text-base font-bold">AI Usage</h3>
        </div>
        <p className="mt-2 text-sm text-ink-muted">
          ไปที่{" "}
          <a href="/admin/ai" className="font-semibold text-brand-700 hover:text-brand-800">
            AI Search Analytics
          </a>{" "}
          เพื่อดูรายงานละเอียด — intent breakdown, คำค้นยอดนิยม, confidence score
        </p>
      </section>
    </div>
  );
}

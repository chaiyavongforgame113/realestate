"use client";

import { useEffect, useState } from "react";
import { Sparkles, Search, TrendingUp, MessageSquare, MapPin, Train } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";

interface Analytics {
  totals: {
    sessions: number;
    messages: number;
    avgConfidence: number;
    clarificationRate: number;
  };
  goal: { buy: number; rent: number; unknown: number };
  property_types: Record<string, number>;
  top_districts: { name: string; count: number }[];
  top_stations: { name: string; count: number }[];
  popular_queries: { query: string; at: string }[];
}

const PROPERTY_LABELS: Record<string, string> = {
  condo: "คอนโด",
  house: "บ้านเดี่ยว",
  townhouse: "ทาวน์เฮาส์",
  land: "ที่ดิน",
  commercial: "พาณิชย์",
};

export default function AdminAIAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    fetch("/api/admin/ai-analytics")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) return <div className="py-10 text-center text-sm text-ink-muted">กำลังโหลด...</div>;

  const totalGoal = data.goal.buy + data.goal.rent + data.goal.unknown;
  const propertyEntries = Object.entries(data.property_types).sort((a, b) => b[1] - a[1]);
  const totalProps = propertyEntries.reduce((s, [, c]) => s + c, 0);

  return (
    <div>
      <PageHeader
        title="AI Search Analytics"
        description="ข้อมูลการใช้ AI search 30 วันล่าสุด"
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Sessions" value={data.totals.sessions.toLocaleString()} icon={Search} accent="brand" />
        <StatCard label="User Queries" value={data.totals.messages.toLocaleString()} icon={MessageSquare} accent="accent" />
        <StatCard
          label="AI Confidence"
          value={`${Math.round(data.totals.avgConfidence * 100)}%`}
          change="ข้อมูลครบถ้วนเฉลี่ย"
          trend="flat"
          icon={Sparkles}
          accent="ink"
        />
        <StatCard
          label="Clarification Rate"
          value={`${Math.round(data.totals.clarificationRate * 100)}%`}
          change="ต้องถามกลับ"
          trend="flat"
          icon={TrendingUp}
          accent="brand"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1fr]">
        {/* Goal breakdown */}
        <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
          <h3 className="font-display text-base font-bold">Search Intent</h3>
          <div className="mt-4 space-y-3">
            {[
              { key: "buy", label: "ซื้อ", value: data.goal.buy, color: "bg-brand-600" },
              { key: "rent", label: "เช่า", value: data.goal.rent, color: "bg-accent-500" },
              { key: "unknown", label: "ยังไม่ระบุ", value: data.goal.unknown, color: "bg-stone-400" },
            ].map((g) => (
              <div key={g.key}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-ink">{g.label}</span>
                  <span className="text-ink-muted">
                    {g.value} ({totalGoal > 0 ? Math.round((g.value / totalGoal) * 100) : 0}%)
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-sunken">
                  <div
                    className={`h-full rounded-full ${g.color}`}
                    style={{ width: `${totalGoal > 0 ? (g.value / totalGoal) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Property types */}
        <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
          <h3 className="font-display text-base font-bold">ประเภททรัพย์ยอดนิยม</h3>
          {propertyEntries.length === 0 ? (
            <div className="py-6 text-center text-sm text-ink-muted">ยังไม่มีข้อมูล</div>
          ) : (
            <div className="mt-4 space-y-3">
              {propertyEntries.map(([key, count]) => (
                <div key={key}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-ink">{PROPERTY_LABELS[key] ?? key}</span>
                    <span className="text-ink-muted">
                      {count} ({totalProps > 0 ? Math.round((count / totalProps) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-sunken">
                    <div
                      className="h-full rounded-full bg-gradient-brand"
                      style={{ width: `${totalProps > 0 ? (count / totalProps) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Districts */}
        <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
          <h3 className="flex items-center gap-2 font-display text-base font-bold">
            <MapPin className="h-4 w-4 text-brand-600" /> ย่านยอดนิยม
          </h3>
          {data.top_districts.length === 0 ? (
            <div className="py-6 text-center text-sm text-ink-muted">ยังไม่มีข้อมูล</div>
          ) : (
            <ol className="mt-4 space-y-2.5">
              {data.top_districts.map((d, i) => (
                <li key={d.name} className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 font-display text-xs font-bold text-brand-700">
                      {i + 1}
                    </span>
                    <span className="truncate text-sm font-medium text-ink">{d.name}</span>
                  </div>
                  <span className="shrink-0 text-xs text-ink-muted">{d.count} ครั้ง</span>
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* Stations */}
        <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
          <h3 className="flex items-center gap-2 font-display text-base font-bold">
            <Train className="h-4 w-4 text-brand-600" /> สถานีรถไฟฟ้ายอดนิยม
          </h3>
          {data.top_stations.length === 0 ? (
            <div className="py-6 text-center text-sm text-ink-muted">ยังไม่มีข้อมูล</div>
          ) : (
            <ol className="mt-4 space-y-2.5">
              {data.top_stations.map((s, i) => (
                <li key={s.name} className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent-50 font-display text-xs font-bold text-accent-700">
                      {i + 1}
                    </span>
                    <span className="truncate text-sm font-medium text-ink">{s.name}</span>
                  </div>
                  <span className="shrink-0 text-xs text-ink-muted">{s.count} ครั้ง</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      {/* Recent queries */}
      <section className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-soft">
        <h3 className="font-display text-base font-bold">คำค้นล่าสุด</h3>
        {data.popular_queries.length === 0 ? (
          <div className="py-10 text-center text-sm text-ink-muted">ยังไม่มีคำค้น</div>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {data.popular_queries.map((q, i) => (
              <li key={i} className="flex items-center gap-3 py-2.5">
                <Search className="h-3.5 w-3.5 shrink-0 text-ink-subtle" />
                <span className="flex-1 truncate text-sm text-ink">{q.query}</span>
                <span className="shrink-0 text-xs text-ink-muted">
                  {new Date(q.at).toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

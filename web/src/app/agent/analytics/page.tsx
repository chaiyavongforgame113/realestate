"use client";

import { Eye, MessageSquare, TrendingUp, DollarSign, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";

const chartData = [
  { day: "1", views: 42, leads: 3 },
  { day: "5", views: 68, leads: 5 },
  { day: "10", views: 91, leads: 8 },
  { day: "15", views: 112, leads: 12 },
  { day: "20", views: 88, leads: 9 },
  { day: "25", views: 134, leads: 15 },
  { day: "30", views: 156, leads: 18 },
];

const maxViews = Math.max(...chartData.map((d) => d.views));

export default function AgentAnalyticsPage() {
  return (
    <div>
      <PageHeader
        title="สถิติและ Analytics"
        description="ประสิทธิภาพประกาศและ lead ใน 30 วันที่ผ่านมา"
        action={
          <select className="rounded-lg border border-line bg-white px-3 py-2 text-sm font-medium text-ink">
            <option>30 วันล่าสุด</option>
            <option>90 วันล่าสุด</option>
            <option>ปีนี้</option>
          </select>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Views" value="2,166" change="+24%" trend="up" icon={Eye} accent="brand" />
        <StatCard label="Total Leads" value="42" change="+12%" trend="up" icon={MessageSquare} accent="accent" />
        <StatCard label="Conversion Rate" value="1.94%" change="+0.3%" trend="up" icon={TrendingUp} accent="ink" />
        <StatCard label="ปิดดีลรวม" value="฿28.5M" change="+฿8M" trend="up" icon={DollarSign} accent="brand" />
      </div>

      {/* Chart */}
      <section className="mt-6 rounded-2xl border border-line bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-base font-bold text-ink">Views & Leads Timeline</h3>
            <p className="text-xs text-ink-muted">รายวัน · 30 วันล่าสุด</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-brand-600" />
              Views
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-accent-500" />
              Leads
            </div>
          </div>
        </div>

        <div className="mt-6 flex h-56 items-end gap-2">
          {chartData.map((d, i) => (
            <div key={i} className="group relative flex flex-1 flex-col items-center gap-1">
              <div className="relative flex h-full w-full items-end">
                <div
                  className="w-full rounded-t bg-gradient-to-t from-brand-600 to-brand-400 transition-all"
                  style={{ height: `${(d.views / maxViews) * 100}%` }}
                />
                <div
                  className="absolute bottom-0 w-full rounded-t bg-gradient-to-t from-accent-500 to-accent-300 opacity-80"
                  style={{ height: `${(d.leads / maxViews) * 100 * 3}%` }}
                />
              </div>
              <span className="text-[10px] text-ink-muted">{d.day}</span>
              <div className="pointer-events-none absolute -top-12 rounded-lg bg-ink px-2 py-1 text-[10px] text-white opacity-0 shadow-lift transition-opacity group-hover:opacity-100">
                <div>{d.views} views</div>
                <div>{d.leads} leads</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Top listings + AI suggestions */}
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
          <h3 className="font-display text-base font-bold text-ink">Top Performing Listings</h3>
          <div className="mt-4 space-y-3">
            {[
              { title: "Ashton Asoke ห้องสตูดิโอ", views: 1284, leads: 24 },
              { title: "บ้านเดี่ยว The Grand", views: 882, leads: 18 },
              { title: "คอนโด Noble Ploenchit", views: 534, leads: 12 },
            ].map((l, i) => (
              <div key={l.title} className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 font-display text-sm font-bold text-brand-700">
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-ink">{l.title}</div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-sunken">
                    <div
                      className="h-full rounded-full bg-gradient-brand"
                      style={{ width: `${(l.views / 1284) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-right text-xs">
                  <div className="font-semibold text-ink">{l.views.toLocaleString()} views</div>
                  <div className="text-ink-muted">{l.leads} leads</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-50 via-white to-accent-50 p-5 shadow-soft">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-brand text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <h3 className="font-display text-base font-bold text-ink">AI คำแนะนำปรับปรุง</h3>
          </div>
          <ul className="mt-4 space-y-3">
            {[
              { tip: "เพิ่มรูปห้องน้ำใน Noble Ploenchit", detail: "ผู้ชม 63% มักดูก่อนส่ง enquiry" },
              { tip: "ลดราคา The Grand ลง 5-8%", detail: "ใกล้เคียงคู่แข่งในย่านเดียวกัน" },
              { tip: "เพิ่ม lifestyle tags: pet-friendly", detail: "เทรนด์ search เพิ่มขึ้น +42%" },
            ].map((s, i) => (
              <li key={i} className="flex gap-3 rounded-xl border border-line bg-white/70 p-3 backdrop-blur-sm">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-100 text-[10px] font-bold text-accent-800">
                  {i + 1}
                </span>
                <div>
                  <div className="text-sm font-semibold text-ink">{s.tip}</div>
                  <div className="mt-0.5 text-xs text-ink-muted">{s.detail}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

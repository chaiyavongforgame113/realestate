"use client";

import { useState } from "react";
import { Bell, Mail, Globe, Shield } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { cn } from "@/lib/utils";

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "relative h-6 w-11 rounded-full transition-colors",
        on ? "bg-brand-600" : "bg-surface-sunken"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-transform",
          on ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

export default function SettingsPage() {
  const [prefs, setPrefs] = useState({
    emailNewListings: true,
    emailDigest: true,
    emailMarketing: false,
    pushNewListings: true,
    pushEnquiries: true,
  });

  return (
    <div>
      <PageHeader title="Settings" description="การแจ้งเตือน ภาษา และความเป็นส่วนตัว" />

      <div className="space-y-5">
        <section className="rounded-2xl border border-line bg-white p-6 shadow-soft">
          <div className="mb-4 flex items-center gap-2">
            <Mail className="h-4 w-4 text-brand-600" />
            <h3 className="font-display text-base font-bold">การแจ้งเตือนทางอีเมล</h3>
          </div>
          <div className="space-y-3">
            {[
              { k: "emailNewListings" as const, label: "ทรัพย์ใหม่ที่ตรงใจ", desc: "AI จะส่งทรัพย์ใหม่ที่ match intent ให้" },
              { k: "emailDigest" as const, label: "สรุปรายสัปดาห์", desc: "ทรัพย์ยอดนิยมและทำเลฮอตทุกวันศุกร์" },
              { k: "emailMarketing" as const, label: "โปรโมชั่น & ข่าวสาร", desc: "ข่าวตลาดและโปรโมชั่นพิเศษ" },
            ].map((o) => (
              <div key={o.k} className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-ink">{o.label}</div>
                  <div className="text-xs text-ink-muted">{o.desc}</div>
                </div>
                <Toggle on={prefs[o.k]} onToggle={() => setPrefs((p) => ({ ...p, [o.k]: !p[o.k] }))} />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-white p-6 shadow-soft">
          <div className="mb-4 flex items-center gap-2">
            <Bell className="h-4 w-4 text-brand-600" />
            <h3 className="font-display text-base font-bold">การแจ้งเตือนบนเว็บ</h3>
          </div>
          <div className="space-y-3">
            {[
              { k: "pushNewListings" as const, label: "ทรัพย์ใหม่ตามความสนใจ" },
              { k: "pushEnquiries" as const, label: "อัปเดตสถานะ Enquiry" },
            ].map((o) => (
              <div key={o.k} className="flex items-center justify-between gap-4">
                <div className="text-sm font-semibold text-ink">{o.label}</div>
                <Toggle on={prefs[o.k]} onToggle={() => setPrefs((p) => ({ ...p, [o.k]: !p[o.k] }))} />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-white p-6 shadow-soft">
          <div className="mb-4 flex items-center gap-2">
            <Globe className="h-4 w-4 text-brand-600" />
            <h3 className="font-display text-base font-bold">ภาษา และสกุลเงิน</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-muted">ภาษา</label>
              <select className="h-11 w-full rounded-xl border border-line bg-white px-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100">
                <option>ไทย</option>
                <option>English</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-muted">สกุลเงิน</label>
              <select className="h-11 w-full rounded-xl border border-line bg-white px-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100">
                <option>THB (฿)</option>
                <option>USD ($)</option>
              </select>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-white p-6 shadow-soft">
          <div className="mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4 text-brand-600" />
            <h3 className="font-display text-base font-bold">ความเป็นส่วนตัว</h3>
          </div>
          <div className="space-y-2">
            <button className="w-full rounded-xl border border-line px-4 py-3 text-left text-sm font-medium text-ink hover:border-brand-300">
              ดาวน์โหลดข้อมูลของฉัน
            </button>
            <button className="w-full rounded-xl border border-line px-4 py-3 text-left text-sm font-medium text-ink hover:border-brand-300">
              จัดการ Session ที่ใช้งาน
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

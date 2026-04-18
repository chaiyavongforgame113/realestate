"use client";

import { useEffect, useState } from "react";
import { Save, BadgeCheck } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";

interface AgentMe {
  email: string;
  firstName: string | null;
  lastName: string | null;
  agent: { displayName: string; verifiedAt: string | null; rating: number | null } | null;
}

export default function AgentSettingsPage() {
  const [me, setMe] = useState<AgentMe | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setMe(d.user));
  }, []);

  return (
    <div>
      <PageHeader title="ตั้งค่า Agent" description="จัดการโปรไฟล์สาธารณะและข้อมูลติดต่อ" />

      <div className="mx-auto max-w-2xl space-y-5">
        <section className="rounded-2xl border border-line bg-white p-6 shadow-soft">
          <h3 className="font-display text-base font-bold">Profile สาธารณะ</h3>
          <p className="mt-1 text-xs text-ink-muted">ชื่อและข้อมูลที่ผู้ใช้เห็นบนประกาศ</p>

          <div className="mt-5 space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-muted">ชื่อที่แสดง</label>
              <input
                defaultValue={me?.agent?.displayName ?? ""}
                placeholder="ชื่อ-นามสกุล หรือชื่อบริษัท"
                className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-muted">แนะนำตัว (Bio)</label>
              <textarea
                rows={4}
                placeholder="เล่าประสบการณ์และความเชี่ยวชาญของคุณ"
                className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-brand-100 bg-brand-50/50 p-4">
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-brand-600" />
                <div>
                  <div className="font-semibold text-brand-900">Agent Verified</div>
                  <div className="text-xs text-ink-muted">
                    {me?.agent?.verifiedAt ? `ยืนยันเมื่อ ${new Date(me.agent.verifiedAt).toLocaleDateString("th-TH")}` : "ยังไม่ยืนยัน"}
                  </div>
                </div>
              </div>
              {me?.agent?.rating != null && (
                <div className="text-right">
                  <div className="font-display text-lg font-bold text-ink">⭐ {me.agent.rating}</div>
                  <div className="text-xs text-ink-muted">คะแนนรวม</div>
                </div>
              )}
            </div>
          </div>

          <Button variant="primary" size="md" className="mt-5">
            <Save className="h-4 w-4" />
            บันทึก
          </Button>
        </section>

        <section className="rounded-2xl border border-line bg-white p-6 shadow-soft">
          <h3 className="font-display text-base font-bold">การแจ้งเตือน</h3>
          <p className="mt-1 text-xs text-ink-muted">เลือกวิธีที่ต้องการรับแจ้งเมื่อมี lead ใหม่</p>
          <div className="mt-4 space-y-3">
            <label className="flex items-center gap-3 rounded-xl border border-line p-3">
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-line text-brand-600" />
              <div>
                <div className="text-sm font-semibold">แจ้งเตือนบนเว็บ</div>
                <div className="text-xs text-ink-muted">Bell icon ที่มุมขวาบน</div>
              </div>
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-line p-3">
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-line text-brand-600" />
              <div>
                <div className="text-sm font-semibold">อีเมล</div>
                <div className="text-xs text-ink-muted">ส่งไปที่ {me?.email ?? "อีเมลของคุณ"}</div>
              </div>
            </label>
          </div>
        </section>
      </div>
    </div>
  );
}

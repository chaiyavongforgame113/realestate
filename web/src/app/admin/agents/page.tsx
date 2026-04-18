"use client";

import { useEffect, useState } from "react";
import { Check, X, FileText, MessageSquareWarning, Clock, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusChip } from "@/components/dashboard/status-chip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AgentApp {
  id: string;
  fullName: string;
  companyName: string | null;
  phone: string;
  email: string;
  avatar: string | null;
  experienceYears: number;
  expertiseAreas: string[];
  status: "pending_review" | "approved" | "rejected" | "info_requested";
  submittedAt: string;
}

const tabs = [
  { key: "pending_review" as const, label: "รอพิจารณา" },
  { key: "info_requested" as const, label: "ขอข้อมูลเพิ่ม" },
  { key: "approved" as const, label: "อนุมัติแล้ว" },
  { key: "rejected" as const, label: "ปฏิเสธ" },
];

export default function AdminAgentsPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]["key"]>("pending_review");
  const [apps, setApps] = useState<AgentApp[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/admin/agents/applications?status=${tab}`);
    const data = await res.json();
    setApps(data.applications ?? []);
    if (data.applications?.length && !data.applications.find((a: AgentApp) => a.id === selectedId)) {
      setSelectedId(data.applications[0].id);
    } else if (!data.applications?.length) {
      setSelectedId(null);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const selected = apps.find((a) => a.id === selectedId);

  async function review(action: "approve" | "reject" | "request_info", note?: string) {
    if (!selected) return;
    const res = await fetch(`/api/admin/agents/applications/${selected.id}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, note }),
    });
    if (res.ok) await load();
  }

  return (
    <div>
      <PageHeader
        title="Agent Applications"
        description="พิจารณาใบสมัคร Agent · อนุมัติ / ปฏิเสธ / ขอข้อมูลเพิ่ม"
      />

      <div className="mb-5 flex flex-wrap items-center gap-1 rounded-xl border border-line bg-white p-1 shadow-soft">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors",
              tab === t.key ? "bg-ink text-white" : "text-ink-muted hover:text-ink"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[360px_1fr]">
        <div className="rounded-2xl border border-line bg-white shadow-soft">
          <div className="max-h-[72vh] overflow-y-auto">
            {loading ? (
              <div className="py-10 text-center text-sm text-ink-muted">กำลังโหลด...</div>
            ) : apps.length === 0 ? (
              <div className="py-10 text-center text-sm text-ink-muted">ไม่มีใบสมัครในหมวดนี้</div>
            ) : apps.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelectedId(a.id)}
                className={cn(
                  "flex w-full items-start gap-3 border-b border-line px-4 py-3 text-left transition-colors last:border-0 hover:bg-surface-soft/60",
                  selectedId === a.id && "bg-brand-50/40"
                )}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-sm font-semibold text-white">
                  {a.fullName[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate text-sm font-semibold text-ink">{a.fullName}</div>
                    <span className="shrink-0 text-[11px] text-ink-muted">
                      {new Date(a.submittedAt).toLocaleDateString("th-TH", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                  <div className="mt-0.5 truncate text-xs text-ink-muted">
                    {a.companyName ?? a.email} · {a.experienceYears} ปี
                  </div>
                  <div className="mt-2">
                    <StatusChip status={a.status} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white shadow-soft">
          {selected ? (
            <ApplicationDetail key={selected.id} app={selected} review={review} />
          ) : (
            <div className="flex h-full min-h-[400px] items-center justify-center text-sm text-ink-muted">
              เลือกใบสมัคร
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ApplicationDetail({
  app,
  review,
}: {
  app: AgentApp;
  review: (action: "approve" | "reject" | "request_info", note?: string) => void;
}) {
  const [decisionNote, setDecisionNote] = useState("");
  const canAct = app.status === "pending_review" || app.status === "info_requested";

  return (
    <div>
      <header className="border-b border-line p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-brand text-xl font-bold text-white">
            {app.fullName[0]}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-xl font-bold text-ink">{app.fullName}</h3>
            {app.companyName && <div className="text-sm text-ink-muted">{app.companyName}</div>}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
              <span>📞 {app.phone}</span>
              <span>✉️ {app.email}</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(app.submittedAt).toLocaleString("th-TH")}
              </span>
            </div>
          </div>
          <StatusChip status={app.status} />
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-xl border border-brand-100 bg-brand-50/50 p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-brand text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="text-sm">
            <div className="font-semibold text-brand-900">AI Pre-check: ผ่าน</div>
            <p className="mt-0.5 text-ink-soft">ข้อมูลครบ · เบอร์ติดต่อและอีเมลถูกต้อง</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-ink-muted">ประสบการณ์</div>
          <div className="mt-1.5 font-display text-xl font-bold">{app.experienceYears} ปี</div>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-ink-muted">ย่านที่เชี่ยวชาญ</div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {app.expertiseAreas.length === 0 ? (
              <span className="text-sm text-ink-subtle">—</span>
            ) : app.expertiseAreas.map((a) => (
              <span key={a} className="rounded-full border border-line bg-white px-2.5 py-0.5 text-xs font-medium text-ink-soft">
                {a}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6">
        <div className="text-xs font-semibold uppercase tracking-widest text-ink-muted">เอกสารแนบ</div>
        <div className="mt-2 grid grid-cols-2 gap-3">
          {[
            { label: "ใบอนุญาตนายหน้า", name: "license.pdf" },
            { label: "สำเนาบัตรประชาชน", name: "id-card.jpg" },
          ].map((d) => (
            <div key={d.name} className="flex items-center gap-3 rounded-xl border border-line p-3 hover:border-brand-300">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <FileText className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-ink">{d.label}</div>
                <div className="text-xs text-ink-muted">{d.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {canAct && (
        <div className="border-t border-line p-6 mt-6">
          <div className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
            Note สำหรับการตัดสินใจ
          </div>
          <textarea
            value={decisionNote}
            onChange={(e) => setDecisionNote(e.target.value)}
            rows={2}
            placeholder="ระบุเหตุผลหรือข้อมูลที่ขอเพิ่มเติม..."
            className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button variant="primary" size="md" onClick={() => review("approve", decisionNote)}>
              <Check className="h-4 w-4" />
              อนุมัติ
            </Button>
            <Button variant="outline" size="md" onClick={() => review("request_info", decisionNote)}>
              <MessageSquareWarning className="h-4 w-4" />
              ขอข้อมูลเพิ่ม
            </Button>
            <Button
              variant="ghost"
              size="md"
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => review("reject", decisionNote)}
            >
              <X className="h-4 w-4" />
              ปฏิเสธ
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

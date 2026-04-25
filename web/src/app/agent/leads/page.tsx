"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Phone, Mail, Sparkles, Clock, Search, Filter, Save } from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusChip } from "@/components/dashboard/status-chip";
import { ConversationThread } from "@/components/enquiry/conversation-thread";
import { cn } from "@/lib/utils";

interface Lead {
  id: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  message: string;
  status: "new" | "contacted" | "viewing_scheduled" | "negotiating" | "won" | "lost" | "spam";
  agentNotes: string | null;
  createdAt: string;
  listing: { id: string; title: string; coverImageUrl: string; price: number; priceUnit: string };
}

const statusTabs: { key: Lead["status"] | "all"; label: string }[] = [
  { key: "all", label: "ทั้งหมด" },
  { key: "new", label: "ใหม่" },
  { key: "contacted", label: "ติดต่อแล้ว" },
  { key: "viewing_scheduled", label: "นัดดู" },
  { key: "negotiating", label: "ต่อรอง" },
  { key: "won", label: "ปิดดีล" },
  { key: "lost", label: "ไม่สำเร็จ" },
];

const statusOrder: Lead["status"][] = ["new", "contacted", "viewing_scheduled", "negotiating", "won", "lost"];

export default function AgentLeadsPage() {
  const [tab, setTab] = useState<Lead["status"] | "all">("all");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/agent/leads");
    const data = await res.json();
    setLeads(data.leads ?? []);
    setLoading(false);
    if (data.leads?.length && !selectedId) setSelectedId(data.leads[0].id);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = leads.filter((l) => tab === "all" || l.status === tab);
  const selected = leads.find((l) => l.id === selectedId);

  const countByStatus = useMemo(
    () =>
      statusTabs.reduce<Record<string, number>>(
        (acc, t) => ({
          ...acc,
          [t.key]: t.key === "all" ? leads.length : leads.filter((l) => l.status === t.key).length,
        }),
        {}
      ),
    [leads]
  );

  async function updateLead(id: string, body: Record<string, unknown>) {
    const res = await fetch(`/api/agent/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) await load();
  }

  return (
    <div>
      <PageHeader title="Lead Inbox" description="จัดการการติดต่อจากผู้สนใจทรัพย์" />

      <div className="mb-5 flex flex-wrap items-center gap-1.5 overflow-x-auto rounded-2xl border border-line bg-white p-1.5 shadow-soft">
        {statusTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "relative shrink-0 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors",
              tab === t.key ? "bg-ink text-white" : "text-ink-muted hover:text-ink"
            )}
          >
            {t.label}
            {countByStatus[t.key] > 0 && (
              <span
                className={cn(
                  "ml-2 rounded-full px-1.5 text-[10px] font-semibold",
                  tab === t.key ? "bg-white/20 text-white" : "bg-brand-100 text-brand-800"
                )}
              >
                {countByStatus[t.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[380px_1fr]">
        <div className="rounded-2xl border border-line bg-white shadow-soft">
          <div className="flex items-center gap-2 border-b border-line p-3">
            <div className="flex flex-1 items-center gap-2 rounded-lg bg-surface-sunken px-3 py-1.5">
              <Search className="h-4 w-4 text-ink-subtle" />
              <input placeholder="ค้นหา..." className="flex-1 bg-transparent text-sm focus:outline-none" />
            </div>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-sunken">
              <Filter className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[70vh] overflow-y-auto">
            {loading ? (
              <div className="py-10 text-center text-sm text-ink-muted">กำลังโหลด...</div>
            ) : filtered.length === 0 ? (
              <div className="py-10 text-center text-sm text-ink-muted">ยังไม่มี lead ในหมวดนี้</div>
            ) : filtered.map((l) => (
              <button
                key={l.id}
                onClick={() => setSelectedId(l.id)}
                className={cn(
                  "flex w-full items-start gap-3 border-b border-line px-4 py-3 text-left transition-colors hover:bg-surface-soft/60 last:border-0",
                  selectedId === l.id && "bg-brand-50/40"
                )}
              >
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-sm font-semibold text-white">
                  {l.userName[0]}
                  {l.status === "new" && (
                    <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-accent-500 ring-2 ring-white" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate text-sm font-semibold text-ink">{l.userName}</div>
                    <span className="shrink-0 text-[11px] text-ink-muted">
                      {new Date(l.createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                  <div className="mt-0.5 line-clamp-1 text-xs text-ink-muted">{l.message}</div>
                  <div className="mt-2"><StatusChip status={l.status} /></div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white shadow-soft">
          {selected ? (
            <LeadDetail key={selected.id} lead={selected} onUpdate={updateLead} />
          ) : (
            <div className="flex h-full min-h-[400px] items-center justify-center p-10 text-center text-sm text-ink-muted">
              เลือก lead เพื่อดูรายละเอียด
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LeadDetail({
  lead,
  onUpdate,
}: {
  lead: Lead;
  onUpdate: (id: string, body: Record<string, unknown>) => void;
}) {
  const [note, setNote] = useState(lead.agentNotes ?? "");
  const [saving, setSaving] = useState(false);

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-line p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-base font-semibold text-white">
              {lead.userName[0]}
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-ink">{lead.userName}</h3>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
                <a href={`tel:${lead.userPhone}`} className="inline-flex items-center gap-1 hover:text-brand-700">
                  <Phone className="h-3.5 w-3.5" />
                  {lead.userPhone}
                </a>
                {lead.userEmail && (
                  <a href={`mailto:${lead.userEmail}`} className="inline-flex items-center gap-1 hover:text-brand-700">
                    <Mail className="h-3.5 w-3.5" />
                    {lead.userEmail}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <a
            href={`tel:${lead.userPhone}`}
            className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-700 text-sm font-semibold text-white shadow-soft hover:bg-brand-800"
          >
            <Phone className="h-4 w-4" />
            โทรหา
          </a>
        </div>
      </header>

      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        <div className="rounded-xl border border-line bg-surface-soft/50 p-3">
          <div className="flex items-center gap-3">
            <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg">
              <Image src={lead.listing.coverImageUrl} alt={lead.listing.title} fill sizes="80px" className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] uppercase tracking-widest text-ink-muted">ทรัพย์ที่สนใจ</div>
              <div className="mt-0.5 line-clamp-1 text-sm font-semibold text-ink">{lead.listing.title}</div>
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-ink-muted">ข้อความจาก User</div>
          <p className="mt-2 rounded-xl bg-brand-50/40 p-4 text-[15px] italic text-ink-soft">
            "{lead.message}"
          </p>
          <div className="mt-1 flex items-center gap-1 text-xs text-ink-subtle">
            <Clock className="h-3 w-3" />
            {new Date(lead.createdAt).toLocaleString("th-TH")}
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-ink-muted">บทสนทนา</div>
          <div className="mt-2">
            <ConversationThread enquiryId={lead.id} viewerRole="agent" />
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-ink-muted">อัปเดตสถานะ</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {statusOrder.map((s) => (
              <button
                key={s}
                onClick={() => onUpdate(lead.id, { status: s })}
                className={cn(
                  "rounded-full border border-transparent transition-all",
                  lead.status === s ? "" : "opacity-60 hover:opacity-100"
                )}
              >
                <StatusChip status={s} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
            Note ภายใน <span className="font-normal lowercase text-ink-subtle">(เฉพาะ Agent เห็น)</span>
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="บันทึกรายละเอียดการติดต่อ..."
            className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          <button
            onClick={async () => {
              setSaving(true);
              await onUpdate(lead.id, { agentNotes: note });
              setSaving(false);
            }}
            disabled={saving}
            className="mt-2 inline-flex h-8 items-center gap-1 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-ink-muted hover:border-brand-300 hover:text-brand-800 disabled:opacity-50"
          >
            <Save className="h-3 w-3" />
            {saving ? "บันทึก..." : "บันทึก Note"}
          </button>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-ink-muted">Timeline</div>
          <ol className="mt-3 space-y-3">
            <motion.li initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3 text-sm">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
              <div>
                <div className="font-medium text-ink">Lead เข้ามาใหม่</div>
                <div className="text-xs text-ink-muted">{new Date(lead.createdAt).toLocaleString("th-TH")}</div>
              </div>
            </motion.li>
          </ol>
        </div>
      </div>
    </div>
  );
}

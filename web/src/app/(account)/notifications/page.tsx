"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, Megaphone, Building2, UserCheck, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import type { NotificationItem } from "@/components/notification-bell";
import { cn } from "@/lib/utils";

const TYPE_ICON: Record<NotificationItem["type"], React.ComponentType<{ className?: string }>> = {
  lead_new: Megaphone,
  lead_status_changed: UserCheck,
  listing_approved: Building2,
  listing_rejected: Building2,
  listing_revision_requested: Building2,
  application_approved: UserCheck,
  application_rejected: UserCheck,
  application_info_requested: UserCheck,
  saved_search_match: Sparkles,
};

const TYPE_ACCENT: Record<NotificationItem["type"], string> = {
  lead_new: "bg-brand-50 text-brand-700",
  lead_status_changed: "bg-sky-50 text-sky-700",
  listing_approved: "bg-emerald-50 text-emerald-700",
  listing_rejected: "bg-red-50 text-red-700",
  listing_revision_requested: "bg-accent-50 text-accent-700",
  application_approved: "bg-emerald-50 text-emerald-700",
  application_rejected: "bg-red-50 text-red-700",
  application_info_requested: "bg-accent-50 text-accent-700",
  saved_search_match: "bg-brand-50 text-brand-700",
};

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/notifications");
    const data = await res.json();
    setItems(data.items ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function markAll() {
    await fetch("/api/notifications", { method: "POST" });
    await load();
  }

  return (
    <div>
      <PageHeader
        title="การแจ้งเตือน"
        description={`${items.filter((n) => !n.readAt).length} ยังไม่ได้อ่าน · ${items.length} ทั้งหมด`}
        action={
          items.some((n) => !n.readAt) ? (
            <button
              onClick={markAll}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-line bg-white px-4 text-sm font-semibold text-ink shadow-soft hover:border-brand-300"
            >
              <CheckCheck className="h-4 w-4" />
              อ่านทั้งหมด
            </button>
          ) : null
        }
      />

      {loading ? (
        <div className="py-10 text-center text-sm text-ink-muted">กำลังโหลด...</div>
      ) : items.length === 0 ? (
        <EmptyState icon={Bell} title="ยังไม่มีการแจ้งเตือน" description="การแจ้งเตือนจะปรากฏที่นี่เมื่อมีกิจกรรมในบัญชีของคุณ" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
          {items.map((n) => {
            const Icon = TYPE_ICON[n.type] ?? Bell;
            const content = (
              <div
                className={cn(
                  "flex items-start gap-3 border-b border-line px-4 py-4 transition-colors last:border-0 hover:bg-surface-soft/60",
                  !n.readAt && "bg-brand-50/30"
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    TYPE_ACCENT[n.type] ?? "bg-surface-sunken text-ink-muted"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className={cn("font-semibold", !n.readAt ? "text-ink" : "text-ink-soft")}>
                      {n.title}
                    </div>
                    {!n.readAt && <span className="h-2 w-2 shrink-0 rounded-full bg-brand-600" />}
                  </div>
                  <p className="mt-1 text-sm text-ink-muted">{n.message}</p>
                  <div className="mt-1.5 text-[11px] text-ink-subtle">
                    {new Date(n.createdAt).toLocaleString("th-TH")}
                  </div>
                </div>
              </div>
            );
            return n.link ? (
              <Link key={n.id} href={n.link}>
                {content}
              </Link>
            ) : (
              <div key={n.id}>{content}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}

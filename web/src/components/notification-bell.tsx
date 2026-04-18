"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Check, CheckCheck, Home, Building2, Megaphone, Sparkles, UserCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface NotificationItem {
  id: string;
  type:
    | "lead_new"
    | "lead_status_changed"
    | "listing_approved"
    | "listing_rejected"
    | "listing_revision_requested"
    | "application_approved"
    | "application_rejected"
    | "application_info_requested"
    | "saved_search_match";
  title: string;
  message: string;
  link: string | null;
  readAt: string | null;
  createdAt: string;
}

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

export function NotificationBell({ theme = "light" }: { theme?: "light" | "dark" }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.items ?? []);
      setUnread(data.unread ?? 0);
    } catch {
      // ignore
    }
  };

  // Initial + poll every 30s
  useEffect(() => {
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const markOne = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: "POST" });
    setItems((arr) =>
      arr.map((n) => (n.id === id && !n.readAt ? { ...n, readAt: new Date().toISOString() } : n))
    );
    setUnread((u) => Math.max(0, u - 1));
  };

  const markAll = async () => {
    setLoading(true);
    await fetch("/api/notifications", { method: "POST" });
    await load();
    setLoading(false);
  };

  const dark = theme === "dark";

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
          dark ? "text-white/80 hover:bg-white/10" : "text-ink-muted hover:bg-surface-sunken"
        )}
        aria-label="notifications"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 z-50 w-[360px] max-w-[92vw] overflow-hidden rounded-2xl border border-line bg-white shadow-lift"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <div>
                <div className="font-display text-sm font-bold text-ink">การแจ้งเตือน</div>
                <div className="text-xs text-ink-muted">
                  {unread === 0 ? "อ่านครบแล้ว" : `${unread} รายการใหม่`}
                </div>
              </div>
              {unread > 0 && (
                <button
                  onClick={markAll}
                  disabled={loading}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50 disabled:opacity-50"
                >
                  <CheckCheck className="h-3 w-3" />
                  อ่านทั้งหมด
                </button>
              )}
            </div>

            <div className="max-h-[420px] overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-6 py-10 text-center text-sm text-ink-muted">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-sunken">
                    <Home className="h-5 w-5 text-ink-subtle" />
                  </div>
                  <p>ยังไม่มีการแจ้งเตือน</p>
                </div>
              ) : (
                items.map((n) => {
                  const Icon = TYPE_ICON[n.type] ?? Bell;
                  return (
                    <NotifRow
                      key={n.id}
                      n={n}
                      Icon={Icon}
                      accent={TYPE_ACCENT[n.type] ?? "bg-surface-sunken text-ink"}
                      onRead={() => markOne(n.id)}
                    />
                  );
                })
              )}
            </div>

            <div className="border-t border-line p-2">
              <Link
                href="/notifications"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-center text-xs font-semibold text-brand-700 hover:bg-brand-50"
              >
                ดูทั้งหมด →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NotifRow({
  n,
  Icon,
  accent,
  onRead,
}: {
  n: NotificationItem;
  Icon: React.ComponentType<{ className?: string }>;
  accent: string;
  onRead: () => void;
}) {
  const content = (
    <div
      className={cn(
        "group flex items-start gap-3 border-b border-line px-4 py-3 transition-colors last:border-0 hover:bg-surface-soft/60",
        !n.readAt && "bg-brand-50/30"
      )}
    >
      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", accent)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className={cn("truncate text-sm font-semibold", !n.readAt ? "text-ink" : "text-ink-soft")}>
            {n.title}
          </div>
          {!n.readAt && <span className="h-2 w-2 shrink-0 rounded-full bg-brand-600" />}
        </div>
        <div className="mt-0.5 line-clamp-2 text-xs text-ink-muted">{n.message}</div>
        <div className="mt-1 text-[11px] text-ink-subtle">{formatAgo(n.createdAt)}</div>
      </div>
      {!n.readAt && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRead();
          }}
          className="hidden h-7 w-7 items-center justify-center rounded-full text-ink-subtle hover:bg-white hover:text-brand-700 group-hover:flex"
          title="อ่านแล้ว"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );

  return n.link ? (
    <Link href={n.link} onClick={onRead} className="block">
      {content}
    </Link>
  ) : (
    content
  );
}

function formatAgo(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "เมื่อสักครู่";
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ชม.ที่แล้ว`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} วันที่แล้ว`;
  return d.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
}

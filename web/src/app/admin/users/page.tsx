"use client";

import { useEffect, useState } from "react";
import { MoreVertical, Search, UserX, UserCheck, Shield, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusChip } from "@/components/dashboard/status-chip";
import { cn } from "@/lib/utils";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "user" | "agent" | "admin";
  status: "active" | "suspended";
  joined: string;
  listings: number;
  enquiries: number;
}

const roleTabs = [
  { key: "all", label: "ทั้งหมด" },
  { key: "user", label: "Users" },
  { key: "agent", label: "Agents" },
  { key: "admin", label: "Admins" },
] as const;

export default function AdminUsersPage() {
  const [tab, setTab] = useState<(typeof roleTabs)[number]["key"]>("all");
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (tab !== "all") params.set("role", tab);
    if (q) params.set("q", q);
    const res = await fetch(`/api/admin/users?${params}`);
    const data = await res.json();
    setUsers(data.users ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  async function toggleStatus(u: AdminUser) {
    const newStatus = u.status === "active" ? "suspended" : "active";
    const res = await fetch(`/api/admin/users/${u.id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) load();
  }

  return (
    <div>
      <PageHeader title="User Management" description={`ทั้งหมด ${users.length.toLocaleString()} บัญชี`} />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-xl border border-line bg-white p-1 shadow-soft">
          {roleTabs.map((t) => (
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
        <div className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-1.5 shadow-soft">
          <Search className="h-4 w-4 text-ink-subtle" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ค้นหาชื่อ / email"
            className="w-56 bg-transparent text-sm focus:outline-none"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-line bg-surface-soft/70">
              {["User", "Role", "สถานะ", "สมัคร", "กิจกรรม", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-ink-muted">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-10 text-center text-sm text-ink-muted">กำลังโหลด...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="p-10 text-center text-sm text-ink-muted">ไม่พบผู้ใช้</td></tr>
            ) : users.map((u) => (
              <tr key={u.id} className="border-b border-line transition-colors hover:bg-surface-soft/50 last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-sm font-semibold text-white">
                      {u.name[0]?.toUpperCase() ?? u.email[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-ink">{u.name}</div>
                      <div className="text-xs text-ink-muted">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                <td className="px-4 py-3"><StatusChip status={u.status} /></td>
                <td className="px-4 py-3 text-xs text-ink-muted">
                  {new Date(u.joined).toLocaleDateString("th-TH")}
                </td>
                <td className="px-4 py-3 text-xs text-ink">
                  {u.role === "agent" && `${u.listings} listings`}
                  {u.role === "user" && `${u.enquiries} enquiries`}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => toggleStatus(u)}
                      title={u.status === "active" ? "ระงับ" : "เปิดใช้งาน"}
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted",
                        u.status === "active"
                          ? "hover:bg-red-50 hover:text-red-600"
                          : "hover:bg-brand-50 hover:text-brand-600"
                      )}
                    >
                      {u.status === "active" ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                    </button>
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-sunken hover:text-ink">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: "user" | "agent" | "admin" }) {
  const config = {
    user: { label: "User", cls: "bg-surface-sunken text-ink-soft", Icon: UserCheck },
    agent: { label: "Agent", cls: "bg-brand-50 text-brand-800", Icon: Shield },
    admin: { label: "Admin", cls: "bg-ink text-white", Icon: ShieldAlert },
  }[role];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", config.cls)}>
      <config.Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Shield, Database, Zap, Sparkles, CheckCircle2, XCircle } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";

interface HealthCheck {
  ok: boolean;
  label: string;
  detail?: string;
}

export default function AdminSystemPage() {
  const [health, setHealth] = useState<HealthCheck[]>([]);

  useEffect(() => {
    // Mock health checks — wire to real /api/health later
    const checks: HealthCheck[] = [
      { ok: true, label: "Database (SQLite)", detail: "Response < 5ms · 2 migrations applied" },
      { ok: true, label: "Auth (JWT)", detail: "Access TTL 15m · Refresh TTL 7d" },
      { ok: true, label: "Gemini AI", detail: "gemini-2.5-flash reachable" },
      { ok: true, label: "File Upload", detail: "public/uploads writable" },
      { ok: true, label: "Map tiles (OSM)", detail: "Leaflet ready" },
    ];
    setHealth(checks);
  }, []);

  return (
    <div>
      <PageHeader title="System" description="สถานะและการตั้งค่าระบบ" />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-brand-600" />
            <h3 className="font-display text-base font-bold">Health Checks</h3>
          </div>
          <ul className="mt-4 space-y-2.5">
            {health.map((h) => (
              <li key={h.label} className="flex items-start gap-3 rounded-xl border border-line p-3">
                {h.ok ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                ) : (
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                )}
                <div>
                  <div className="text-sm font-semibold text-ink">{h.label}</div>
                  {h.detail && <div className="mt-0.5 text-xs text-ink-muted">{h.detail}</div>}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-brand-600" />
            <h3 className="font-display text-base font-bold">Configuration</h3>
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            {[
              { k: "Environment", v: "development" },
              { k: "Database", v: "SQLite (file:./dev.db)" },
              { k: "Storage", v: "Local — public/uploads" },
              { k: "AI Model", v: "gemini-2.5-flash" },
              { k: "Maps", v: "OpenStreetMap (Leaflet)" },
            ].map((x) => (
              <div key={x.k} className="flex items-start justify-between gap-2 border-b border-line/60 py-1.5 last:border-0">
                <dt className="text-ink-muted">{x.k}</dt>
                <dd className="text-right font-mono text-xs font-medium text-ink">{x.v}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-soft">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-brand-600" />
          <h3 className="font-display text-base font-bold">Quick Actions</h3>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <button className="flex items-center gap-3 rounded-xl border border-line p-4 text-left hover:border-brand-300">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-ink">Reindex AI Search</div>
              <div className="text-xs text-ink-muted">อัปเดต synonym mappings</div>
            </div>
          </button>
          <button className="flex items-center gap-3 rounded-xl border border-line p-4 text-left hover:border-brand-300">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-ink">Export Data</div>
              <div className="text-xs text-ink-muted">ดาวน์โหลด backup ของระบบ</div>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
}

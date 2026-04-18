"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, Trash2, Bell, Sparkles, Search } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import type { ParsedIntent } from "@/lib/ai/types";

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  intent: ParsedIntent;
  notifyOnNew: boolean;
  createdAt: string;
}

export default function SavedSearchesPage() {
  const [items, setItems] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/saved-searches");
    const data = await res.json();
    setItems(data.items ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id: string) {
    if (!confirm("ลบการค้นหาที่บันทึกนี้?")) return;
    await fetch(`/api/saved-searches/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <PageHeader
        title="การค้นหาที่บันทึก"
        description={`${items.length} การค้นหา · AI จะแจ้งเตือนเมื่อพบทรัพย์ใหม่ที่ตรง`}
        action={
          <Link href="/search">
            <Button variant="outline" size="md">
              <Search className="h-4 w-4" />
              ค้นหาเพิ่ม
            </Button>
          </Link>
        }
      />

      {loading ? (
        <div className="py-10 text-center text-sm text-ink-muted">กำลังโหลด...</div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="ยังไม่มีการค้นหาที่บันทึก"
          description="ทำการค้นหา AI บนหน้า /search แล้วกด 'บันทึกการค้นหานี้' เพื่อรับแจ้งเตือนเมื่อมีทรัพย์ใหม่"
          action={
            <Link href="/search">
              <Button variant="primary" size="md">
                เริ่มค้นหา
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {items.map((s) => (
            <article key={s.id} className="rounded-2xl border border-line bg-white p-5 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-brand text-white">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <h3 className="truncate font-display font-bold text-ink">{s.name}</h3>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-ink-muted">"{s.query}"</p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {s.intent.search_goal && (
                      <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-800">
                        {s.intent.search_goal === "buy" ? "ซื้อ" : "เช่า"}
                      </span>
                    )}
                    {s.intent.budget_max && (
                      <span className="rounded-full bg-accent-50 px-2 py-0.5 text-[11px] font-medium text-accent-900">
                        ไม่เกิน {(s.intent.budget_max / 1_000_000).toFixed(s.intent.budget_max % 1_000_000 === 0 ? 0 : 2)} ล้าน
                      </span>
                    )}
                    {s.intent.bedrooms && (
                      <span className="rounded-full bg-surface-sunken px-2 py-0.5 text-[11px] font-medium text-ink-soft">
                        {s.intent.bedrooms} ห้องนอน
                      </span>
                    )}
                    {s.intent.preferred_stations?.slice(0, 2).map((st) => (
                      <span key={st} className="rounded-full bg-surface-sunken px-2 py-0.5 text-[11px] font-medium text-ink-soft">
                        {st}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => remove(s.id)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-muted hover:bg-red-50 hover:text-red-600"
                  title="ลบ"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs">
                <span className="flex items-center gap-1 text-ink-muted">
                  <Bell className="h-3 w-3" />
                  {s.notifyOnNew ? "แจ้งเตือนเมื่อมีใหม่" : "ปิดแจ้งเตือน"}
                </span>
                <Link
                  href={`/search?q=${encodeURIComponent(s.query)}`}
                  className="font-semibold text-brand-700 hover:text-brand-800"
                >
                  เรียกใช้อีกครั้ง →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

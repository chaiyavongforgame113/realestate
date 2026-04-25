"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, ArrowRight, MessageSquare } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusChip, type StatusKind } from "@/components/dashboard/status-chip";
import { EmptyState } from "@/components/dashboard/empty-state";
import { formatPrice } from "@/lib/utils";

interface UserEnquiry {
  id: string;
  status: Extract<StatusKind, "new" | "contacted" | "viewing_scheduled" | "negotiating" | "won" | "lost" | "spam">;
  message: string;
  createdAt: string;
  updatedAt: string;
  listing: {
    id: string;
    title: string;
    price: number;
    priceUnit: string;
    coverImageUrl: string;
  };
  agent: { name: string };
}

const statusSteps = ["new", "contacted", "viewing_scheduled", "negotiating", "won"] as const;

export default function EnquiriesPage() {
  const [items, setItems] = useState<UserEnquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/enquiries")
      .then((r) => (r.ok ? r.json() : { enquiries: [] }))
      .then((data) => setItems(data.enquiries ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="การติดต่อของฉัน" description={`${items.length} การติดต่อ · ติดตามสถานะแบบ real-time`} />

      {loading ? (
        <div className="py-10 text-center text-sm text-ink-muted">กำลังโหลด...</div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="ยังไม่มี Enquiry"
          description="ติดต่อ Agent ผ่านหน้ารายละเอียดทรัพย์เพื่อเริ่มบทสนทนา"
        />
      ) : (
        <div className="space-y-4">
          {items.map((e) => {
            const activeIdx = statusSteps.indexOf(e.status as (typeof statusSteps)[number]);
            return (
              <article key={e.id} className="rounded-2xl border border-line bg-white p-5 shadow-soft">
                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl md:h-20 md:w-32">
                    <Image src={e.listing.coverImageUrl} alt={e.listing.title} fill sizes="128px" className="object-cover" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          href={`/listing/${e.listing.id}`}
                          className="line-clamp-1 font-display text-base font-bold text-ink hover:text-brand-700"
                        >
                          {e.listing.title}
                        </Link>
                        <div className="mt-1 flex items-center gap-2 text-sm">
                          <span className="font-display font-semibold text-ink">
                            {formatPrice(e.listing.price, e.listing.priceUnit as "total" | "per_month")}
                          </span>
                          <span className="text-ink-subtle">·</span>
                          <span className="text-ink-muted">Agent: {e.agent.name}</span>
                        </div>
                      </div>
                      <StatusChip status={e.status} />
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center gap-1">
                        {statusSteps.map((s, i) => {
                          const done = i <= activeIdx;
                          const isLast = i === statusSteps.length - 1;
                          return (
                            <div key={s} className="flex flex-1 items-center">
                              <div
                                className={`h-1.5 flex-1 rounded-full ${done ? "bg-gradient-brand" : "bg-surface-sunken"}`}
                              />
                              {!isLast && <div className="w-1 shrink-0" />}
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px]">
                        <span className="text-ink-muted">ส่งเมื่อ {new Date(e.createdAt).toLocaleDateString("th-TH")}</span>
                        <span className="inline-flex items-center gap-1 text-ink-muted">
                          <Clock className="h-3 w-3" />
                          อัปเดต {new Date(e.updatedAt).toLocaleDateString("th-TH")}
                        </span>
                      </div>
                    </div>

                    <p className="mt-3 line-clamp-2 rounded-lg bg-surface-soft/70 p-2.5 text-sm italic text-ink-soft">
                      "{e.message}"
                    </p>

                    <div className="mt-3 flex items-center justify-end gap-3">
                      <Link
                        href={`/listing/${e.listing.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-ink-muted hover:text-brand-700"
                      >
                        ดูประกาศ
                      </Link>
                      <Link
                        href={`/enquiries/${e.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800"
                      >
                        เปิดบทสนทนา <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

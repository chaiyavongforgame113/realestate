"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Sparkles, Trophy, Wallet, Train, Maximize2, X } from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import type { ListingDTO } from "@/lib/listings/transform";
import type { CompareResult } from "@/lib/ai/types";
import { cn, formatPrice } from "@/lib/utils";

// Default demo ids when no query params — these exist in seed
const FALLBACK_IDS = ["1", "3", "4", "6"];

const rows: {
  label: string;
  Icon?: React.ComponentType<{ className?: string }>;
  get: (l: ListingDTO) => React.ReactNode;
}[] = [
  {
    label: "ราคา",
    Icon: Wallet,
    get: (l) => <span className="font-display text-lg font-bold text-ink">{formatPrice(l.price, l.priceUnit as "total" | "per_month")}</span>,
  },
  {
    label: "ประเภท",
    get: (l) =>
      ({ condo: "คอนโด", house: "บ้านเดี่ยว", townhouse: "ทาวน์เฮาส์", land: "ที่ดิน", commercial: "พาณิชย์" })[l.propertyType as string],
  },
  { label: "ห้องนอน", get: (l) => l.bedrooms || "—" },
  { label: "ห้องน้ำ", get: (l) => l.bathrooms || "—" },
  {
    label: "พื้นที่ใช้สอย",
    Icon: Maximize2,
    get: (l) => `${l.usableArea.toLocaleString()} ${l.propertyType === "land" ? "ตร.ว." : "ตร.ม."}`,
  },
  {
    label: "ราคา/ตร.ม.",
    get: (l) => (l.priceUnit === "total" ? `฿${Math.round(l.price / l.usableArea).toLocaleString()}` : "—"),
  },
  { label: "ที่ตั้ง", get: (l) => <span className="text-sm">{l.district}, {l.province}</span> },
  {
    label: "รถไฟฟ้าใกล้สุด",
    Icon: Train,
    get: (l) =>
      l.nearestBts
        ? `BTS ${l.nearestBts} (${l.nearestBtsDistance}ม.)`
        : l.nearestMrt
        ? `MRT ${l.nearestMrt} (${l.nearestMrtDistance}ม.)`
        : "—",
  },
];

export default function ComparePage() {
  const [listings, setListings] = useState<ListingDTO[]>([]);
  const [summary, setSummary] = useState<CompareResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ids = params.get("ids")?.split(",").filter(Boolean) ?? FALLBACK_IDS;
    if (ids.length < 2) {
      setLoading(false);
      return;
    }

    const sessionId = typeof window !== "undefined" ? sessionStorage.getItem("ai_session_id") : null;

    // Resolve listing IDs (fallback uses seeded real IDs — fetch list first)
    const resolveIds = async () => {
      if (ids === FALLBACK_IDS) {
        const res = await fetch("/api/listings?limit=6");
        const data = await res.json();
        return (data.listings as ListingDTO[]).slice(0, 4).map((l) => l.id);
      }
      return ids;
    };

    resolveIds()
      .then((realIds) =>
        fetch("/api/compare/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listing_ids: realIds, session_id: sessionId ?? undefined }),
        })
      )
      .then((r) => r.json())
      .then((data) => {
        if (data.listings) setListings(data.listings);
        if (data.summary) setSummary(data.summary);
      })
      .catch((e) => console.error("[compare]", e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      <Navbar />

      <div className="pt-20 md:pt-24">
        <Container>
          <div className="mb-6">
            <Link
              href="/search"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-brand-700"
            >
              <ArrowLeft className="h-4 w-4" />
              กลับสู่ผลการค้นหา
            </Link>
            <h1 className="mt-3 font-display text-3xl font-bold text-ink md:text-4xl">
              เปรียบเทียบทรัพย์
            </h1>
            <p className="mt-1 text-ink-muted">
              {loading ? "กำลังวิเคราะห์..." : `เลือก ${listings.length} รายการ · วิเคราะห์โดย AI`}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className="h-48 animate-pulse rounded-2xl bg-surface-sunken" />
              <div className="h-48 animate-pulse rounded-2xl bg-surface-sunken" />
            </div>
          ) : !summary || listings.length < 2 ? (
            <div className="rounded-2xl border border-dashed border-line bg-white/60 p-10 text-center">
              <p className="text-sm text-ink-muted">เลือก ≥2 รายการเพื่อเปรียบเทียบ</p>
            </div>
          ) : (
            <>
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-accent-50 p-6 md:p-8"
              >
                <div
                  aria-hidden
                  className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent-200/40 blur-2xl"
                />
                <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto]">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-soft">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-widest text-brand-800">
                          AI สรุปการเปรียบเทียบ
                        </div>
                        <div className="font-display text-lg font-bold text-ink">คำแนะนำสำหรับคุณ</div>
                      </div>
                    </div>
                    <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">{summary.summary}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
                    {[
                      { label: "ดีที่สุดโดยรวม", id: summary.best_overall_id, Icon: Trophy },
                      { label: "คุ้มค่า", id: summary.best_for_budget_id, Icon: Wallet },
                      { label: "เดินทางสะดวก", id: summary.best_for_commute_id, Icon: Train },
                      { label: "พื้นที่ใหญ่", id: summary.best_for_space_id, Icon: Maximize2 },
                    ].map((b) => {
                      if (!b.id) return null;
                      const l = listings.find((x) => x.id === b.id);
                      if (!l) return null;
                      return (
                        <div
                          key={b.label}
                          className="flex min-w-0 items-center gap-3 rounded-xl border border-line bg-white/80 p-2.5 backdrop-blur-sm"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-100 text-accent-700">
                            <b.Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[10px] font-semibold uppercase tracking-widest text-ink-muted">
                              {b.label}
                            </div>
                            <div className="truncate text-sm font-semibold text-ink">{l.title}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.section>

              <section className="mt-8 overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[860px]">
                    <thead>
                      <tr>
                        <th className="sticky left-0 z-10 w-44 bg-white p-4 text-left text-xs font-semibold uppercase tracking-widest text-ink-muted">
                          รายละเอียด
                        </th>
                        {listings.map((l) => {
                          const isBest = l.id === summary.best_overall_id;
                          const analysis = summary.listings_analysis.find((a) => a.id === l.id);
                          return (
                            <th key={l.id} className="min-w-[220px] p-4 align-top">
                              <div
                                className={cn(
                                  "relative rounded-xl border p-3 text-left",
                                  isBest ? "border-brand-600 bg-brand-50/60" : "border-line bg-white"
                                )}
                              >
                                {isBest && (
                                  <span className="absolute -top-2.5 left-3 inline-flex items-center gap-1 rounded-full bg-gradient-brand px-2 py-0.5 text-[10px] font-semibold text-white shadow-soft">
                                    <Trophy className="h-3 w-3" /> แนะนำสุด
                                  </span>
                                )}
                                <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                                  <Image src={l.coverImageUrl} alt={l.title} fill sizes="240px" className="object-cover" />
                                </div>
                                <Badge tone={l.listingType === "sale" ? "sale" : "rent"} className="mt-2">
                                  {l.listingType === "sale" ? "ขาย" : "เช่า"}
                                </Badge>
                                <div className="mt-2 line-clamp-2 text-sm font-semibold text-ink">{l.title}</div>
                                {analysis && (
                                  <div className="mt-2 flex items-center gap-2">
                                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-sunken">
                                      <div
                                        className="h-full rounded-full bg-gradient-brand"
                                        style={{ width: `${analysis.fit_score}%` }}
                                      />
                                    </div>
                                    <span className="font-display text-sm font-bold text-ink">
                                      {analysis.fit_score}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, i) => (
                        <tr key={r.label} className={cn(i % 2 === 0 && "bg-surface-soft/60")}>
                          <td className="sticky left-0 z-10 bg-inherit p-4 text-sm font-medium text-ink-muted">
                            <div className="flex items-center gap-2">
                              {r.Icon && <r.Icon className="h-4 w-4 text-brand-600" />}
                              {r.label}
                            </div>
                          </td>
                          {listings.map((l) => (
                            <td key={l.id} className="p-4 align-top text-sm text-ink">
                              {r.get(l)}
                            </td>
                          ))}
                        </tr>
                      ))}

                      <tr className="bg-brand-50/40">
                        <td className="sticky left-0 z-10 bg-inherit p-4 text-sm font-semibold text-brand-800">
                          ✓ จุดเด่น
                        </td>
                        {listings.map((l) => {
                          const a = summary.listings_analysis.find((x) => x.id === l.id);
                          return (
                            <td key={l.id} className="p-4 align-top">
                              <ul className="space-y-1.5 text-sm text-ink-soft">
                                {a?.pros.map((p, idx) => (
                                  <li key={idx} className="flex items-start gap-1.5">
                                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-500" />
                                    {p}
                                  </li>
                                ))}
                              </ul>
                            </td>
                          );
                        })}
                      </tr>
                      <tr className="bg-accent-50/40">
                        <td className="sticky left-0 z-10 bg-inherit p-4 text-sm font-semibold text-accent-900">
                          ✗ จุดที่ควรพิจารณา
                        </td>
                        {listings.map((l) => {
                          const a = summary.listings_analysis.find((x) => x.id === l.id);
                          return (
                            <td key={l.id} className="p-4 align-top">
                              <ul className="space-y-1.5 text-sm text-ink-soft">
                                {a?.cons.map((c, idx) => (
                                  <li key={idx} className="flex items-start gap-1.5">
                                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent-500" />
                                    {c}
                                  </li>
                                ))}
                              </ul>
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        <td className="sticky left-0 z-10 bg-white p-4 text-sm font-medium text-ink-muted">
                          เหมาะกับ
                        </td>
                        {listings.map((l) => {
                          const a = summary.listings_analysis.find((x) => x.id === l.id);
                          return (
                            <td key={l.id} className="p-4 align-top text-sm italic text-ink-soft">
                              {a?.best_for}
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        <td className="sticky left-0 z-10 bg-white p-4" />
                        {listings.map((l) => (
                          <td key={l.id} className="p-4">
                            <Link
                              href={`/listing/${l.id}`}
                              className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-brand-700 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-brand-800"
                            >
                              ดูรายละเอียด
                            </Link>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </Container>
      </div>

      <Footer />
    </main>
  );
}

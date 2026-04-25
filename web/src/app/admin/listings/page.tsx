"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Check,
  X,
  MessageSquareWarning,
  Sparkles,
  ExternalLink,
  BedDouble,
  Bath,
  Car,
  Maximize2,
  MapPin,
  Video,
  Eye,
  Train,
  Sofa,
  Star,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building,
  Tag,
  Layers,
  Calendar,
  User as UserIcon,
  FileText,
  Expand,
  Images as ImagesIcon,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Lightbox } from "@/components/ui/lightbox";
import { formatPrice, cn } from "@/lib/utils";
import type { ListingDTO } from "@/lib/listings/transform";

const MapView = dynamic(() => import("@/components/map/map-view").then((m) => m.MapView), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[240px] items-center justify-center rounded-xl bg-surface-sunken text-xs text-ink-muted">
      กำลังโหลดแผนที่...
    </div>
  ),
});

const checklist = [
  "รูปภาพชัดเจน ไม่มีลายน้ำซ้ำซ้อน",
  "ราคาสมเหตุสมผลกับทำเล",
  "ข้อมูลสำคัญครบ (ขนาด, ห้องนอน, ที่ตั้ง)",
  "พิกัด Map ถูกต้อง",
  "ไม่พบประกาศซ้ำในระบบ",
  "ไม่มีข้อมูลติดต่อซ่อนอยู่ในรูปภาพ",
];

const propertyTypeLabel: Record<string, string> = {
  condo: "คอนโด",
  house: "บ้านเดี่ยว",
  townhouse: "ทาวน์เฮาส์",
  land: "ที่ดิน",
  commercial: "พาณิชย์",
};

const furnishingLabel: Record<string, string> = {
  fully: "ตกแต่งครบ",
  fully_furnished: "ตกแต่งครบ",
  partial: "ตกแต่งบางส่วน",
  none: "ไม่ตกแต่ง",
};

export default function AdminListingsPage() {
  const [queue, setQueue] = useState<ListingDTO[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checks, setChecks] = useState<Record<string, boolean[]>>({});
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [reasonError, setReasonError] = useState(false);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [flash, setFlash] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/listings/queue");
    const data = await res.json();
    setQueue(data.listings ?? []);
    setChecks(
      Object.fromEntries((data.listings ?? []).map((l: ListingDTO) => [l.id, Array(checklist.length).fill(false)]))
    );
    if (data.listings?.length && !selectedId) setSelectedId(data.listings[0].id);
    else if (!data.listings?.length) setSelectedId(null);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = queue.find((m) => m.id === selectedId);

  const toggleCheck = (i: number) => {
    if (!selected) return;
    setChecks((c) => ({
      ...c,
      [selected.id]: c[selected.id].map((v, idx) => (idx === i ? !v : v)),
    }));
  };

  async function review(action: "approve" | "reject" | "request_revision" | "unpublish") {
    if (!selected) return;
    if ((action === "reject" || action === "request_revision") && !reason.trim()) {
      setReasonError(true);
      setFlash({ type: "error", text: "กรุณาระบุเหตุผลก่อน" });
      // Scroll + focus reason textarea
      const ta = document.getElementById("mod-reason-textarea") as HTMLTextAreaElement | null;
      if (ta) {
        ta.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => ta.focus(), 300);
      }
      setTimeout(() => setReasonError(false), 2000);
      setTimeout(() => setFlash(null), 3000);
      return;
    }
    try {
      setSubmitting(action);
      const res = await fetch(`/api/admin/listings/${selected.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });
      if (res.ok) {
        setReason("");
        setReasonError(false);
        const labels: Record<string, string> = {
          approve: "✓ อนุมัติประกาศเรียบร้อย",
          reject: "✗ ปฏิเสธประกาศเรียบร้อย",
          request_revision: "↻ ส่งกลับให้แก้ไขเรียบร้อย",
          unpublish: "✗ ถอดประกาศเรียบร้อย",
        };
        setFlash({ type: "success", text: labels[action] ?? "สำเร็จ" });
        setTimeout(() => setFlash(null), 3000);
        await load();
      } else {
        const data = await res.json().catch(() => ({}));
        setFlash({ type: "error", text: data.error ?? "ดำเนินการไม่สำเร็จ" });
        setTimeout(() => setFlash(null), 3500);
      }
    } catch {
      setFlash({ type: "error", text: "เกิดข้อผิดพลาดในการเชื่อมต่อ" });
      setTimeout(() => setFlash(null), 3500);
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Listing Moderation Queue"
        description={`${queue.length} ประกาศรอพิจารณา · ตรวจสอบคุณภาพและอนุมัติก่อนเผยแพร่`}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-2xl border border-line bg-white shadow-soft lg:sticky lg:top-4 lg:self-start">
          <div className="flex items-center justify-between border-b border-line bg-gradient-to-br from-surface-soft to-white px-4 py-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-brand-700" />
              <span className="font-display text-sm font-bold text-ink">คิวตรวจสอบ</span>
            </div>
            <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-bold text-brand-800">
              {queue.length}
            </span>
          </div>
          <div className="max-h-[78vh] overflow-y-auto">
            {loading ? (
              <div className="py-10 text-center text-sm text-ink-muted">กำลังโหลด...</div>
            ) : queue.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                <div className="font-display font-semibold text-ink">ไม่มีงานรอตรวจ</div>
                <p className="text-xs text-ink-muted">คิวว่างแล้ว ✨</p>
              </div>
            ) : (
              queue.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedId(m.id)}
                  className={cn(
                    "flex w-full items-start gap-3 border-b border-line p-3 text-left transition-colors last:border-0 hover:bg-surface-soft/60",
                    selectedId === m.id && "bg-brand-50/40"
                  )}
                >
                  <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg">
                    <Image src={m.coverImageUrl} alt={m.title} fill sizes="80px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-2 text-sm font-semibold text-ink">{m.title}</div>
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-ink-muted">
                      <Clock className="h-3 w-3" />
                      <span>
                        by {m.agent?.name ?? "—"} · {new Date(m.createdAt).toLocaleDateString("th-TH")}
                      </span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        <div className="rounded-2xl border border-line bg-white shadow-soft">
          {selected ? (
            <ModerationDetail
              listing={selected}
              checks={checks[selected.id] ?? []}
              toggleCheck={toggleCheck}
              reason={reason}
              setReason={setReason}
              review={review}
              reasonError={reasonError}
              submitting={submitting}
            />
          ) : (
            <div className="flex h-full min-h-[400px] items-center justify-center text-sm text-ink-muted">
              เลือกประกาศ
            </div>
          )}
        </div>
      </div>

      {/* Toast / Flash */}
      {flash && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-[300] -translate-x-1/2">
          <div
            className={cn(
              "pointer-events-auto flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-lift backdrop-blur",
              flash.type === "success"
                ? "border border-emerald-200 bg-emerald-50/95 text-emerald-800"
                : "border border-red-200 bg-red-50/95 text-red-800"
            )}
          >
            {flash.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            )}
            {flash.text}
          </div>
        </div>
      )}
    </div>
  );
}

function ModerationDetail({
  listing,
  checks,
  toggleCheck,
  reason,
  setReason,
  review,
  reasonError,
  submitting,
}: {
  listing: ListingDTO;
  checks: boolean[];
  toggleCheck: (i: number) => void;
  reason: string;
  setReason: (v: string) => void;
  review: (action: "approve" | "reject" | "request_revision" | "unpublish") => void;
  reasonError: boolean;
  submitting: string | null;
}) {
  const allChecked = checks.every(Boolean);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const allImages = useMemo(() => {
    const imgs = listing.images?.length
      ? [...listing.images].sort((a, b) => Number(b.isCover) - Number(a.isCover) || a.order - b.order)
      : [];
    if (!imgs.length && listing.coverImageUrl) {
      return [{ id: "cover", url: listing.coverImageUrl, isCover: true, order: 0 }];
    }
    return imgs;
  }, [listing]);

  const imageUrls = useMemo(() => allImages.map((i) => i.url), [allImages]);

  // Reset active image when listing changes
  useEffect(() => {
    setActiveImage(0);
  }, [listing.id]);

  function openLightboxAt(idx: number) {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  }

  const currentImage = allImages[activeImage]?.url ?? listing.coverImageUrl;
  const price = formatPrice(listing.price, listing.priceUnit as "total" | "per_month");
  const pricePerSqm =
    listing.usableArea && listing.price
      ? Math.round(listing.price / listing.usableArea).toLocaleString("th-TH")
      : null;

  const hasLocation = listing.latitude != null && listing.longitude != null;

  return (
    <div className="flex flex-col">
      {/* === HERO === */}
      <div className="relative">
        <button
          type="button"
          onClick={() => openLightboxAt(activeImage)}
          className="group relative block aspect-[2/1] w-full overflow-hidden bg-surface-sunken"
          aria-label="ดูรูปใหญ่"
        >
          {currentImage && (
            <Image
              src={currentImage}
              alt={listing.title}
              fill
              sizes="1200px"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              priority
            />
          )}

          {/* Dim + expand hint on hover */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 scale-90 items-center gap-2 rounded-full bg-white/95 px-4 py-2.5 text-sm font-semibold text-ink opacity-0 shadow-lift backdrop-blur-sm transition-all duration-300 group-hover:scale-100 group-hover:opacity-100"
          >
            <Expand className="h-4 w-4" />
            คลิกเพื่อดูรูปใหญ่
          </div>
        </button>

        {/* Badges top-left */}
        <div className="pointer-events-none absolute left-4 top-4 flex flex-wrap gap-1.5">
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-soft",
              listing.listingType === "sale" ? "bg-brand-700" : "bg-sky-600"
            )}
          >
            {listing.listingType === "sale" ? "ขาย" : "เช่า"}
          </span>
          <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-ink shadow-soft backdrop-blur-sm">
            {propertyTypeLabel[listing.propertyType] ?? listing.propertyType}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white shadow-soft">
            <AlertTriangle className="h-3 w-3" />
            รอตรวจสอบ
          </span>
        </div>

        {/* "ดูทั้งหมด X รูป" button — top right */}
        {allImages.length > 1 && (
          <button
            onClick={() => openLightboxAt(activeImage)}
            className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs font-semibold text-white shadow-lift backdrop-blur-md transition-all hover:bg-black/70"
          >
            <ImagesIcon className="h-3.5 w-3.5" />
            ดูทั้งหมด {allImages.length} รูป
          </button>
        )}

        {/* Image counter — bottom right above title bar */}
        {allImages.length > 1 && (
          <div className="pointer-events-none absolute bottom-[5.5rem] right-4 rounded-md bg-black/55 px-2 py-0.5 font-mono text-[11px] font-semibold text-white backdrop-blur-sm md:bottom-[6rem]">
            {activeImage + 1} / {allImages.length}
          </div>
        )}

        {/* Title bar */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 via-ink/60 to-transparent p-5 text-white">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-xl font-bold leading-tight md:text-2xl">{listing.title}</h3>
              {listing.projectName && (
                <div className="mt-1 text-sm opacity-90">โครงการ: {listing.projectName}</div>
              )}
            </div>
            <div className="text-right">
              <div className="font-display text-2xl font-bold md:text-3xl">{price}</div>
              {pricePerSqm && <div className="mt-0.5 text-xs opacity-85">≈ {pricePerSqm} บาท/ตร.ม.</div>}
            </div>
          </div>
        </div>
      </div>

      {/* === IMAGE GALLERY STRIP === */}
      {allImages.length > 1 && (
        <div className="border-b border-line bg-surface-soft/40 p-3">
          <div className="mb-1.5 flex items-center justify-between px-1">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-ink-muted">
              รูปภาพทั้งหมด ({allImages.length})
            </div>
            <button
              onClick={() => openLightboxAt(activeImage)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700 hover:text-brand-800"
            >
              <Expand className="h-3 w-3" />
              ดูรูปขยาย
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {allImages.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setActiveImage(i)}
                onDoubleClick={() => openLightboxAt(i)}
                className={cn(
                  "group relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                  activeImage === i
                    ? "border-brand-500 ring-2 ring-brand-200"
                    : "border-transparent opacity-75 hover:opacity-100"
                )}
                title="คลิกเพื่อเปลี่ยนรูปหลัก · ดับเบิลคลิกเพื่อขยาย"
              >
                <Image src={img.url} alt="" fill sizes="96px" className="object-cover" />
                {img.isCover && (
                  <span className="absolute left-1 top-1 rounded bg-accent-500 px-1 py-0.5 text-[9px] font-bold uppercase text-white">
                    Cover
                  </span>
                )}
                {/* Active checkmark */}
                {activeImage === i && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-white shadow-soft">
                    <Check className="h-2.5 w-2.5" strokeWidth={3} />
                  </span>
                )}
                {/* Expand icon on hover */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink/40 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Expand className="h-4 w-4 text-white" />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ============ LIGHTBOX ============ */}
      <Lightbox
        images={imageUrls}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />


      {/* === SPECS GRID === */}
      <div className="grid grid-cols-2 divide-x divide-y divide-line border-b border-line md:grid-cols-4">
        <SpecCell icon={BedDouble} label="ห้องนอน" value={listing.bedrooms != null ? String(listing.bedrooms) : "—"} />
        <SpecCell icon={Bath} label="ห้องน้ำ" value={listing.bathrooms != null ? String(listing.bathrooms) : "—"} />
        <SpecCell
          icon={Maximize2}
          label="พื้นที่ใช้สอย"
          value={listing.usableArea ? `${listing.usableArea} ตร.ม.` : "—"}
        />
        <SpecCell
          icon={Car}
          label="ที่จอดรถ"
          value={listing.parkingSpaces != null ? `${listing.parkingSpaces} คัน` : "—"}
        />
        <SpecCell
          icon={Building}
          label="ชั้น / ทั้งหมด"
          value={
            listing.floor != null || listing.totalFloors != null
              ? `${listing.floor ?? "—"} / ${listing.totalFloors ?? "—"}`
              : "—"
          }
        />
        <SpecCell
          icon={Layers}
          label="พื้นที่ดิน"
          value={listing.landArea ? `${listing.landArea} ตร.ว.` : "—"}
        />
        <SpecCell
          icon={Sofa}
          label="เฟอร์นิเจอร์"
          value={listing.furnishing ? furnishingLabel[listing.furnishing] ?? listing.furnishing : "—"}
        />
        <SpecCell
          icon={Calendar}
          label="ส่งเมื่อ"
          value={new Date(listing.createdAt).toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" })}
        />
      </div>

      {/* === CONTENT SECTIONS === */}
      <div className="space-y-6 p-6">
        {/* Description */}
        <Section icon={FileText} title="คำอธิบาย">
          {listing.description ? (
            <p className="whitespace-pre-line text-sm leading-relaxed text-ink-soft">{listing.description}</p>
          ) : (
            <Empty>ไม่มีคำอธิบาย</Empty>
          )}
        </Section>

        {/* Location */}
        <Section icon={MapPin} title="ทำเลและพิกัด">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1.2fr]">
            <div className="space-y-3">
              <KV label="ที่อยู่">
                {listing.district}, {listing.province}
              </KV>
              {hasLocation ? (
                <KV label="พิกัด (Lat, Lng)">
                  <code className="rounded bg-surface-sunken px-1.5 py-0.5 text-xs">
                    {listing.latitude!.toFixed(6)}, {listing.longitude!.toFixed(6)}
                  </code>
                  <a
                    href={`https://www.google.com/maps?q=${listing.latitude},${listing.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800"
                  >
                    เปิด Google Maps <ExternalLink className="h-3 w-3" />
                  </a>
                </KV>
              ) : (
                <KV label="พิกัด">
                  <span className="text-red-600">⚠ ยังไม่ได้ระบุพิกัด</span>
                </KV>
              )}

              <div>
                <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-ink-muted">
                  ระบบขนส่งใกล้เคียง
                </div>
                <div className="space-y-1.5">
                  {listing.nearestBts && (
                    <TransitRow type="BTS" name={listing.nearestBts} distance={listing.nearestBtsDistance} />
                  )}
                  {listing.nearestMrt && (
                    <TransitRow type="MRT" name={listing.nearestMrt} distance={listing.nearestMrtDistance} />
                  )}
                  {listing.nearestArl && (
                    <TransitRow type="ARL" name={listing.nearestArl} distance={listing.nearestArlDistance} />
                  )}
                  {!listing.nearestBts && !listing.nearestMrt && !listing.nearestArl && (
                    <Empty>ไม่มีข้อมูลขนส่งสาธารณะ</Empty>
                  )}
                </div>
              </div>
            </div>

            {hasLocation ? (
              <div className="overflow-hidden rounded-xl border border-line">
                <MapView latitude={listing.latitude!} longitude={listing.longitude!} height={240} zoom={15} />
              </div>
            ) : (
              <div className="flex h-[240px] items-center justify-center rounded-xl border border-dashed border-line bg-surface-sunken text-xs text-ink-muted">
                ไม่มีพิกัดสำหรับแสดงแผนที่
              </div>
            )}
          </div>
        </Section>

        {/* Amenities & Lifestyle */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Section icon={Tag} title={`สิ่งอำนวยความสะดวก (${listing.amenities.length})`}>
            {listing.amenities.length ? (
              <div className="flex flex-wrap gap-1.5">
                {listing.amenities.map((a) => (
                  <span
                    key={a}
                    className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-800"
                  >
                    <Check className="h-3 w-3" />
                    {a}
                  </span>
                ))}
              </div>
            ) : (
              <Empty>ไม่มี</Empty>
            )}
          </Section>

          <Section icon={Star} title={`LIFESTYLE TAGS (${listing.lifestyleTags.length})`}>
            {listing.lifestyleTags.length ? (
              <div className="flex flex-wrap gap-1.5">
                {listing.lifestyleTags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center rounded-full border border-accent-200 bg-accent-50 px-2.5 py-1 text-xs font-medium text-accent-800"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            ) : (
              <Empty>ไม่มี</Empty>
            )}
          </Section>
        </div>

        {/* Media */}
        {(listing.virtualTourUrl || listing.videoUrl) && (
          <Section icon={Video} title="สื่อเพิ่มเติม">
            <div className="flex flex-wrap gap-2">
              {listing.virtualTourUrl && (
                <a
                  href={listing.virtualTourUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm font-medium text-ink-soft shadow-soft hover:border-brand-300 hover:text-brand-800"
                >
                  <Eye className="h-4 w-4" /> ดู Virtual Tour <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              {listing.videoUrl && (
                <a
                  href={listing.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm font-medium text-ink-soft shadow-soft hover:border-brand-300 hover:text-brand-800"
                >
                  <Video className="h-4 w-4" /> ดูวิดีโอ <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </Section>
        )}

        {/* Agent Info */}
        <Section icon={UserIcon} title="ข้อมูล Agent ผู้ลง">
          <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-soft/50 p-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gradient-brand text-white">
              {listing.agent?.avatar ? (
                <Image src={listing.agent.avatar} alt="" fill sizes="48px" className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-bold">
                  {(listing.agent?.name ?? "?")[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="font-semibold text-ink">{listing.agent?.name ?? "—"}</div>
                {listing.agent?.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-700">
                    <Check className="h-3 w-3" /> Verified
                  </span>
                )}
              </div>
              <div className="mt-0.5 flex items-center gap-3 text-xs text-ink-muted">
                {listing.agent?.rating != null && (
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {listing.agent.rating.toFixed(1)}
                  </span>
                )}
                <span>Agent ID: {listing.agent?.id?.slice(0, 8) ?? "—"}</span>
              </div>
            </div>
            <Link
              href={`/listing/${listing.id}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink-soft shadow-soft hover:border-brand-300 hover:text-brand-800"
            >
              <Eye className="h-3.5 w-3.5" /> ดูหน้าประกาศ
            </Link>
          </div>
        </Section>

        {/* Prior notes (if revision was requested before) */}
        {(listing.adminNote || listing.rejectionReason) && (
          <Section icon={MessageSquareWarning} title="หมายเหตุก่อนหน้า">
            {listing.adminNote && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-amber-700">Admin Note</div>
                <div className="mt-1">{listing.adminNote}</div>
              </div>
            )}
            {listing.rejectionReason && (
              <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-red-700">
                  เหตุผลที่เคยปฏิเสธ
                </div>
                <div className="mt-1">{listing.rejectionReason}</div>
              </div>
            )}
          </Section>
        )}

        {/* AI Check + Manual Checklist */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-brand-100 bg-brand-50/50 p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="font-display font-bold text-brand-900">AI Auto-check</div>
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-center gap-2 text-brand-800">
                <Check className="h-4 w-4 text-brand-600" /> ข้อมูลครบถ้วน
              </li>
              <li className="flex items-center gap-2 text-brand-800">
                <Check className="h-4 w-4 text-brand-600" /> ไม่พบประกาศซ้ำในระบบ
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-line bg-surface-soft/50 p-4">
            <div className="font-display font-bold text-ink">Checklist ตรวจสอบด้วยตนเอง</div>
            <ul className="mt-3 space-y-2">
              {checklist.map((c, i) => (
                <li key={i}>
                  <label className="flex cursor-pointer items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={checks[i] ?? false}
                      onChange={() => toggleCheck(i)}
                      className="mt-0.5 h-4 w-4 rounded border-line text-brand-600 focus:ring-brand-400"
                    />
                    <span className={cn("text-ink-soft", checks[i] && "text-ink line-through")}>{c}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* === ACTION FOOTER === */}
      <div className="sticky bottom-0 border-t border-line bg-white/95 p-6 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
            เหตุผล / NOTE
            <span className="ml-1.5 font-normal normal-case text-ink-subtle">
              จำเป็นสำหรับ &quot;ปฏิเสธ&quot; และ &quot;ขอแก้ไข&quot;
            </span>
          </div>
          {reason.trim() && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
              <Check className="h-3 w-3" /> ระบุเหตุผลแล้ว
            </span>
          )}
        </div>
        <div className="relative mt-2">
          <textarea
            id="mod-reason-textarea"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="ระบุเหตุผล เช่น รูปไม่ชัด, ราคาสูงกว่าตลาด 30%, ข้อมูลไม่ครบ..."
            className={cn(
              "w-full rounded-xl border bg-white px-3 py-2.5 text-sm transition-all focus:outline-none focus:ring-2",
              reasonError
                ? "animate-[shake_0.4s_ease-in-out] border-red-400 ring-2 ring-red-100 focus:border-red-500 focus:ring-red-100"
                : "border-line focus:border-brand-400 focus:ring-brand-100"
            )}
            aria-invalid={reasonError}
          />
          {reasonError && (
            <div className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
              <AlertTriangle className="h-3 w-3" />
              กรุณาระบุเหตุผลก่อนดำเนินการ &quot;ปฏิเสธ&quot; หรือ &quot;ขอแก้ไข&quot;
            </div>
          )}
        </div>

        {/* Checklist progress — inline */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-ink-muted">
              Checklist ความพร้อม
            </span>
            <span
              className={cn(
                "font-mono font-bold",
                allChecked ? "text-emerald-700" : "text-ink-soft"
              )}
            >
              {checks.filter(Boolean).length} / {checklist.length}
              {allChecked && " · พร้อมอนุมัติ"}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                allChecked
                  ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
                  : "bg-gradient-to-r from-brand-500 to-accent-500"
              )}
              style={{ width: `${(checks.filter(Boolean).length / checklist.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={() => review("request_revision")}
            disabled={submitting !== null}
          >
            <MessageSquareWarning className="h-4 w-4" />
            {submitting === "request_revision" ? "กำลังส่ง..." : "ขอแก้ไข"}
          </Button>
          <Button
            variant="ghost"
            size="md"
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => review("reject")}
            disabled={submitting !== null}
          >
            <X className="h-4 w-4" />
            {submitting === "reject" ? "กำลังส่ง..." : "ปฏิเสธ"}
          </Button>
          <div className="relative group">
            <Button
              variant="primary"
              size="md"
              disabled={!allChecked || submitting !== null}
              onClick={() => review("approve")}
            >
              <Check className="h-4 w-4" />
              {submitting === "approve"
                ? "กำลังอนุมัติ..."
                : allChecked
                ? "อนุมัติ"
                : `อนุมัติ (${checks.filter(Boolean).length}/${checklist.length})`}
            </Button>
            {!allChecked && (
              <div className="pointer-events-none absolute bottom-full right-0 mb-2 hidden w-max max-w-xs rounded-lg bg-ink px-3 py-2 text-[11px] font-medium text-white shadow-lift group-hover:block">
                ติ๊ก checklist ข้างบนให้ครบ {checklist.length} ข้อ
                <br />
                เพื่อเปิดใช้งานปุ่มนี้
                <div className="absolute -bottom-1 right-6 h-2 w-2 rotate-45 bg-ink" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-4 w-4 text-brand-700" />
        <h4 className="font-display text-sm font-bold uppercase tracking-wider text-ink">{title}</h4>
      </div>
      {children}
    </section>
  );
}

function SpecCell({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-ink-muted">{label}</div>
        <div className="truncate text-sm font-semibold text-ink">{value}</div>
      </div>
    </div>
  );
}

function KV({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-widest text-ink-muted">{label}</div>
      <div className="mt-0.5 text-sm text-ink-soft">{children}</div>
    </div>
  );
}

function TransitRow({
  type,
  name,
  distance,
}: {
  type: string;
  name: string;
  distance?: number | null;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="inline-flex h-6 min-w-[40px] items-center justify-center rounded bg-ink px-1.5 text-[10px] font-bold text-white">
        {type}
      </span>
      <Train className="h-3.5 w-3.5 text-ink-muted" />
      <span className="font-medium text-ink">{name}</span>
      {distance != null && <span className="text-xs text-ink-muted">· {distance} ม.</span>}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-surface-sunken px-3 py-2 text-xs italic text-ink-muted">
      {children}
    </div>
  );
}

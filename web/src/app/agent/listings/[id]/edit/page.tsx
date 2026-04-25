"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Send, Trash2, AlertCircle, CheckCircle2, Lock, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/dashboard/status-chip";
import { DynamicMapPicker } from "@/components/map/dynamic";
import { cn } from "@/lib/utils";
import type { ListingDTO } from "@/lib/listings/transform";

const amenityOptions = [
  "สระว่ายน้ำ", "ฟิตเนส", "รักษาความปลอดภัย 24 ชม.",
  "ที่จอดรถ", "สวน", "เครื่องปรับอากาศ",
  "ลิฟต์", "Co-working space", "Kids Zone",
  "Pet Friendly", "EV Charging", "ซาวน่า",
];

interface EditData {
  title: string;
  description: string;
  price: string;
  usableArea: string;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  furnishing: string;
  amenities: string[];
  projectName: string;
  district: string;
  province: string;
  latitude: number;
  longitude: number;
  virtualTourUrl: string;
  videoUrl: string;
}

export default function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [listing, setListing] = useState<ListingDTO | null>(null);
  const [data, setData] = useState<EditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [revisionStaged, setRevisionStaged] = useState(false);

  useEffect(() => {
    fetch(`/api/agent/listings/${id}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.listing) {
          setListing(res.listing);
          const l = res.listing as ListingDTO;
          setData({
            title: l.title,
            description: l.description,
            price: String(l.price),
            usableArea: String(l.usableArea),
            bedrooms: l.bedrooms,
            bathrooms: l.bathrooms,
            parkingSpaces: l.parkingSpaces,
            furnishing: l.furnishing as string,
            amenities: l.amenities,
            projectName: l.projectName ?? "",
            district: l.district,
            province: l.province,
            latitude: l.latitude,
            longitude: l.longitude,
            virtualTourUrl: l.virtualTourUrl ?? "",
            videoUrl: l.videoUrl ?? "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="py-10 text-center text-sm text-ink-muted">กำลังโหลด...</div>;
  }

  if (!listing || !data) {
    return (
      <div className="py-10 text-center text-sm text-ink-muted">
        ไม่พบประกาศ หรือไม่มีสิทธิ์เข้าถึง
      </div>
    );
  }

  // Block editing while pending_review — agent must wait for admin decision
  if (listing.status === "pending_review") {
    return (
      <div className="mx-auto max-w-2xl">
        <Link
          href="/agent/listings"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับสู่ประกาศของฉัน
        </Link>

        <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-8 text-center shadow-soft">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <Lock className="h-8 w-8 text-amber-700" />
          </div>
          <h2 className="font-display text-2xl font-bold text-ink">
            ประกาศนี้ล็อคระหว่างรอตรวจ
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-ink-soft">
            ประกาศ <span className="font-semibold text-ink">&ldquo;{listing.title}&rdquo;</span>{" "}
            ของคุณถูกส่งให้แอดมินตรวจสอบแล้ว
            ยังไม่สามารถแก้ไขได้จนกว่าจะได้ผลการตรวจ
            (อนุมัติ / ขอแก้ไข / ปฏิเสธ)
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-xs font-semibold text-amber-800">
            <Clock className="h-3.5 w-3.5" />
            กำลังรอแอดมินตรวจ · โดยทั่วไปใช้เวลา 2–4 ชม.
          </div>
          <div className="mt-7 flex items-center justify-center gap-3">
            <Link href="/agent/listings">
              <Button variant="primary" size="md">
                กลับสู่รายการประกาศ
              </Button>
            </Link>
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-ink-muted">
          หากต้องการแก้ไขด่วน กรุณาติดต่อฝ่ายสนับสนุนเพื่อถอนการส่งตรวจ
        </p>
      </div>
    );
  }

  const set = <K extends keyof EditData>(key: K, value: EditData[K]) =>
    setData((d) => (d ? { ...d, [key]: value } : d));

  const toggleAmenity = (a: string) =>
    setData((d) =>
      d
        ? { ...d, amenities: d.amenities.includes(a) ? d.amenities.filter((x) => x !== a) : [...d.amenities, a] }
        : d
    );

  async function save(andSubmit = false) {
    if (!data) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const priceNum = Number(data.price);
      const areaNum = Number(data.usableArea);
      if (!Number.isFinite(priceNum) || priceNum <= 0) throw new Error("กรุณากรอกราคา");
      if (!Number.isFinite(areaNum) || areaNum <= 0) throw new Error("กรุณากรอกขนาดพื้นที่");

      const body = {
        title: data.title,
        description: data.description,
        price: priceNum,
        usableArea: areaNum,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        parkingSpaces: data.parkingSpaces,
        furnishing: data.furnishing,
        amenities: data.amenities,
        projectName: data.projectName || undefined,
        district: data.district,
        province: data.province,
        latitude: data.latitude,
        longitude: data.longitude,
        virtualTourUrl: data.virtualTourUrl || undefined,
        videoUrl: data.videoUrl || undefined,
      };
      const res = await fetch(`/api/agent/listings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const resData = await res.json();
      if (!res.ok) {
        const msg = resData.details?.fieldErrors
          ? Object.values(resData.details.fieldErrors).flat().join(", ")
          : resData.error;
        throw new Error(msg ?? "บันทึกไม่สำเร็จ");
      }
      // Check if the backend staged a revision (published listing edit flow)
      if (resData.revision) {
        setRevisionStaged(true);
        setSuccess(false);
        return;
      }
      if (andSubmit) {
        const sr = await fetch(`/api/agent/listings/${id}/submit`, { method: "POST" });
        if (!sr.ok) {
          const e = await sr.json();
          throw new Error(e.error ?? "ส่งรออนุมัติไม่สำเร็จ");
        }
        router.push("/agent/listings");
        return;
      }
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm("ลบประกาศนี้ถาวร?")) return;
    const r = await fetch(`/api/agent/listings/${id}`, { method: "DELETE" });
    if (r.ok) router.push("/agent/listings");
  }

  const canSubmit = listing.status === "draft" || listing.status === "revision_requested";

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/agent/listings"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-brand-700"
      >
        <ArrowLeft className="h-4 w-4" />
        กลับสู่ประกาศของฉัน
      </Link>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">แก้ไขประกาศ</h1>
          <p className="mt-1 text-sm text-ink-muted">{listing.title}</p>
        </div>
        <StatusChip status={listing.status} />
      </div>

      {listing.adminNote && (listing.status === "revision_requested" || listing.status === "rejected") && (
        <div className="mb-5 rounded-xl border border-accent-200 bg-accent-50 p-4 text-sm text-accent-900">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <div className="font-semibold">{listing.status === "rejected" ? "เหตุผลการปฏิเสธ" : "หมายเหตุจาก Admin"}</div>
              <div className="mt-0.5 text-ink-soft">{listing.adminNote}</div>
            </div>
          </div>
        </div>
      )}

      {/* Published / sold / rented — edits require admin approval */}
      {(listing.status === "published" || listing.status === "sold" || listing.status === "rented") && (
        <div className="mb-5 rounded-xl border border-sky-200 bg-sky-50/70 p-4 text-sm text-sky-900">
          <div className="flex items-start gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700">
              <AlertCircle className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="font-semibold">การแก้ไขต้องผ่านแอดมินอนุมัติก่อน</div>
              <div className="mt-1 text-sky-800/90">
                ประกาศนี้เผยแพร่อยู่ การเปลี่ยนแปลงที่คุณบันทึกจะ{" "}
                <span className="font-semibold">ยังไม่แสดงผลต่อผู้ใช้ทันที</span>{" "}
                เราจะส่งให้แอดมินตรวจและอัปเดตข้อมูลใหม่เมื่อผ่านการอนุมัติเท่านั้น
                ในระหว่างนี้ผู้ใช้จะยังเห็นข้อมูลเดิม
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success screen for staged revision */}
      {revisionStaged && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="font-display text-base font-bold text-emerald-900">
                ส่งการแก้ไขให้แอดมินตรวจแล้ว
              </div>
              <p className="mt-1 text-emerald-800/90">
                เราได้บันทึกการแก้ไขของคุณเป็น &ldquo;revision รอตรวจ&rdquo;
                แอดมินจะรีวิวและอนุมัติการอัปเดต —
                เมื่อผ่านการอนุมัติแล้ว ข้อมูลใหม่จะถูกเผยแพร่ให้ผู้ใช้เห็นทันที
                (ข้อมูลเดิมยังคงอยู่ในระหว่างนี้)
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/agent/listings">
                  <Button variant="primary" size="sm">กลับสู่รายการประกาศ</Button>
                </Link>
                <Button variant="outline" size="sm" onClick={() => setRevisionStaged(false)}>
                  แก้ไขเพิ่มเติม
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="space-y-5">
        {/* Basic */}
        <section className="rounded-2xl border border-line bg-white p-6 shadow-soft">
          <h3 className="font-display text-base font-bold">ข้อมูลพื้นฐาน</h3>
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-muted">ชื่อประกาศ</label>
              <input
                value={data.title}
                onChange={(e) => set("title", e.target.value)}
                className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-muted">รายละเอียด</label>
              <textarea
                rows={5}
                value={data.description}
                onChange={(e) => set("description", e.target.value)}
                className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>
        </section>

        {/* Price & size */}
        <section className="rounded-2xl border border-line bg-white p-6 shadow-soft">
          <h3 className="font-display text-base font-bold">ราคาและขนาด</h3>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="ราคา" type="number" value={data.price} onChange={(v) => set("price", v)} />
            <Field label="พื้นที่ใช้สอย (ตร.ม.)" type="number" value={data.usableArea} onChange={(v) => set("usableArea", v)} />
            <Counter label="ห้องนอน" value={data.bedrooms} onChange={(v) => set("bedrooms", v)} />
            <Counter label="ห้องน้ำ" value={data.bathrooms} onChange={(v) => set("bathrooms", v)} />
            <Counter label="ที่จอดรถ" value={data.parkingSpaces} onChange={(v) => set("parkingSpaces", v)} />
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-muted">เฟอร์นิเจอร์</label>
              <select
                value={data.furnishing}
                onChange={(e) => set("furnishing", e.target.value)}
                className="h-11 w-full rounded-xl border border-line bg-white px-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              >
                <option value="fully_furnished">เฟอร์ครบ</option>
                <option value="partially_furnished">เฟอร์บางส่วน</option>
                <option value="unfurnished">ไม่มีเฟอร์</option>
              </select>
            </div>
          </div>
        </section>

        {/* Amenities */}
        <section className="rounded-2xl border border-line bg-white p-6 shadow-soft">
          <h3 className="font-display text-base font-bold">
            สิ่งอำนวยความสะดวก <span className="text-xs font-normal text-ink-muted">(เลือก {data.amenities.length})</span>
          </h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {amenityOptions.map((a) => {
              const on = data.amenities.includes(a);
              return (
                <button
                  key={a}
                  onClick={() => toggleAmenity(a)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
                    on
                      ? "border-brand-600 bg-brand-50 text-brand-800"
                      : "border-line bg-white text-ink-muted hover:border-brand-300"
                  )}
                >
                  {a}
                </button>
              );
            })}
          </div>
        </section>

        {/* Location */}
        <section className="rounded-2xl border border-line bg-white p-6 shadow-soft">
          <h3 className="font-display text-base font-bold">ที่ตั้ง</h3>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="ชื่อโครงการ" value={data.projectName} onChange={(v) => set("projectName", v)} />
            <Field label="เขต/อำเภอ" value={data.district} onChange={(v) => set("district", v)} />
            <Field label="จังหวัด" value={data.province} onChange={(v) => set("province", v)} />
          </div>
          <div className="mt-4">
            <label className="mb-1.5 block text-xs font-medium text-ink-muted">ปักหมุดบนแผนที่</label>
            <DynamicMapPicker
              lat={data.latitude}
              lng={data.longitude}
              onChange={(lat, lng) => {
                set("latitude", lat);
                set("longitude", lng);
              }}
              height={300}
            />
          </div>
        </section>

        {/* Virtual tour */}
        <section className="rounded-2xl border border-line bg-white p-6 shadow-soft">
          <h3 className="font-display text-base font-bold">Virtual Tour & Video (optional)</h3>
          <div className="mt-4 space-y-3">
            <Field
              label="Virtual Tour URL"
              placeholder="https://my.matterport.com/show/?m=... หรือ kuula.co"
              value={data.virtualTourUrl}
              onChange={(v) => set("virtualTourUrl", v)}
            />
            <Field
              label="Video URL"
              placeholder="https://youtube.com/watch?v=..."
              value={data.videoUrl}
              onChange={(v) => set("videoUrl", v)}
            />
          </div>
        </section>

        {/* Actions */}
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-2 rounded-xl border border-brand-200 bg-brand-50 p-3 text-sm text-brand-800"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            บันทึกเรียบร้อยแล้ว
          </motion.div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
          <Button
            variant="ghost"
            size="md"
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={remove}
            disabled={saving}
          >
            <Trash2 className="h-4 w-4" />
            ลบประกาศ
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="md" onClick={() => save(false)} disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
            {canSubmit && (
              <Button variant="primary" size="md" onClick={() => save(true)} disabled={saving}>
                <Send className="h-4 w-4" />
                บันทึก + ส่งรออนุมัติ
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-ink-muted">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
      />
    </div>
  );
}

function Counter({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-ink-muted">{label}</label>
      <div className="flex h-11 items-center gap-2 rounded-xl border border-line bg-white p-1">
        <button
          onClick={() => onChange(Math.max(0, value - 1))}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-sunken"
        >
          −
        </button>
        <div className="flex-1 text-center font-display font-bold">{value}</div>
        <button
          onClick={() => onChange(value + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-sunken"
        >
          +
        </button>
      </div>
    </div>
  );
}

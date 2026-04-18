"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Upload, Image as ImageIcon, X, Save, Eye, AlertCircle, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DynamicMapPicker } from "@/components/map/dynamic";

const steps = [
  { key: "basic", label: "ข้อมูลพื้นฐาน" },
  { key: "price", label: "ราคาและขนาด" },
  { key: "amenities", label: "สิ่งอำนวยฯ" },
  { key: "location", label: "ที่ตั้ง" },
  { key: "photos", label: "รูปภาพ" },
  { key: "review", label: "ตรวจสอบ" },
] as const;

type StepKey = (typeof steps)[number]["key"];

export default function NewListingPage() {
  const router = useRouter();
  const [stepIdx, setStepIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState({
    listingType: "sale",
    propertyType: "condo",
    title: "",
    description: "",
    price: "",
    usableArea: "",
    bedrooms: 1,
    bathrooms: 1,
    parking: 1,
    furnishing: "fully_furnished",
    amenities: [] as string[],
    district: "",
    province: "กรุงเทพฯ",
    projectName: "",
    latitude: 13.7563,
    longitude: 100.5018,
    photos: [] as string[],
    coverIdx: 0,
    virtualTourUrl: "",
    videoUrl: "",
  });

  const current = steps[stepIdx];
  const isLast = stepIdx === steps.length - 1;

  const set: Setter = (key, value) =>
    setData((d) => ({ ...d, [key]: value }));

  const toggleAmenity = (a: string) =>
    setData((d) => ({
      ...d,
      amenities: d.amenities.includes(a) ? d.amenities.filter((x) => x !== a) : [...d.amenities, a],
    }));

  async function saveAndSubmit(mode: "draft" | "submit") {
    setSubmitting(true);
    setError(null);
    try {
      const cover = data.photos[data.coverIdx] ?? data.photos[0] ??
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80";
      const body = {
        listingType: data.listingType,
        propertyType: data.propertyType,
        title: data.title,
        description: data.description,
        price: Number(data.price) || 0,
        priceUnit: data.listingType === "rent" ? "per_month" : "total",
        usableArea: Number(data.usableArea) || 0,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        parkingSpaces: data.parking,
        furnishing: data.furnishing,
        projectName: data.projectName || undefined,
        district: data.district,
        province: data.province,
        latitude: data.latitude,
        longitude: data.longitude,
        coverImageUrl: cover,
        images: data.photos,
        virtualTourUrl: data.virtualTourUrl || undefined,
        videoUrl: data.videoUrl || undefined,
        amenities: data.amenities,
        lifestyleTags: [] as string[],
      };

      const createRes = await fetch("/api/agent/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const created = await createRes.json();
      if (!createRes.ok) {
        const msg = created.details?.fieldErrors
          ? Object.values(created.details.fieldErrors).flat().join(", ")
          : created.error;
        throw new Error(msg ?? "สร้างประกาศไม่สำเร็จ");
      }

      if (mode === "submit") {
        const submitRes = await fetch(`/api/agent/listings/${created.id}/submit`, { method: "POST" });
        if (!submitRes.ok) {
          const e = await submitRes.json();
          throw new Error(e.error ?? "ส่งรออนุมัติไม่สำเร็จ");
        }
      }

      router.push("/agent/listings");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/agent/listings"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-brand-700"
      >
        <ArrowLeft className="h-4 w-4" />
        กลับสู่ประกาศของฉัน
      </Link>

      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">ลงประกาศใหม่</h1>
        <p className="mt-1 text-sm text-ink-muted">กรอกข้อมูลทรัพย์ให้ครบถ้วน เพื่อให้ Admin อนุมัติได้รวดเร็ว</p>
      </div>

      {/* Stepper */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex min-w-max items-center gap-2">
          {steps.map((s, i) => {
            const done = i < stepIdx;
            const active = i === stepIdx;
            return (
              <div key={s.key} className="flex items-center gap-2">
                <button
                  onClick={() => i <= stepIdx && setStepIdx(i)}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                    active && "bg-gradient-brand text-white shadow-soft",
                    done && "bg-brand-50 text-brand-800 hover:bg-brand-100",
                    !active && !done && "bg-surface-sunken text-ink-muted"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full text-[10px]",
                      active && "bg-white/20 text-white",
                      done && "bg-brand-600 text-white",
                      !active && !done && "bg-white text-ink-muted"
                    )}
                  >
                    {done ? <Check className="h-3 w-3" /> : i + 1}
                  </span>
                  <span className="whitespace-nowrap">{s.label}</span>
                </button>
                {i < steps.length - 1 && <span className="h-px w-4 bg-line" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-line bg-white p-6 shadow-soft md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.key}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
          >
            {current.key === "basic" && <StepBasic data={data} set={set} />}
            {current.key === "price" && <StepPrice data={data} set={set} />}
            {current.key === "amenities" && (
              <StepAmenities data={data} set={set} toggleAmenity={toggleAmenity} />
            )}
            {current.key === "location" && (
              <StepLocation
                data={data}
                set={set}
                onMove={(lat, lng) => setData((d) => ({ ...d, latitude: lat, longitude: lng }))}
              />
            )}
            {current.key === "photos" && (
              <StepPhotos
                data={data}
                addPhoto={(url) => setData((d) => ({ ...d, photos: [...d.photos, url] }))}
                removePhoto={(i) =>
                  setData((d) => ({
                    ...d,
                    photos: d.photos.filter((_, idx) => idx !== i),
                    coverIdx: d.coverIdx >= i ? Math.max(0, d.coverIdx - 1) : d.coverIdx,
                  }))
                }
                setCover={(i) => setData((d) => ({ ...d, coverIdx: i }))}
                setUrl={set}
              />
            )}
            {current.key === "review" && <StepReview data={data} />}
          </motion.div>
        </AnimatePresence>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between border-t border-line pt-6">
          <Button
            variant="ghost"
            size="md"
            onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
            disabled={stepIdx === 0 || submitting}
          >
            <ArrowLeft className="h-4 w-4" />
            ย้อนกลับ
          </Button>

          <div className="flex items-center gap-2">
            {!isLast && (
              <Button variant="outline" size="md" onClick={() => saveAndSubmit("draft")} disabled={submitting}>
                <Save className="h-4 w-4" />
                บันทึก Draft
              </Button>
            )}
            {isLast ? (
              <Button variant="primary" size="md" onClick={() => saveAndSubmit("submit")} disabled={submitting}>
                <Check className="h-4 w-4" />
                {submitting ? "กำลังส่ง..." : "ส่งรออนุมัติ"}
              </Button>
            ) : (
              <Button variant="primary" size="md" onClick={() => setStepIdx((i) => i + 1)}>
                ถัดไป
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface Data {
  listingType: string;
  propertyType: string;
  title: string;
  description: string;
  price: string;
  usableArea: string;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  furnishing: string;
  amenities: string[];
  district: string;
  province: string;
  projectName: string;
  latitude: number;
  longitude: number;
  photos: string[];
  coverIdx: number;
  virtualTourUrl: string;
  videoUrl: string;
}
type Setter = (key: string, value: unknown) => void;

function SectionTitle({ title, step }: { title: string; step: string }) {
  return (
    <>
      <div className="text-xs font-semibold uppercase tracking-widest text-brand-700">Step {step}</div>
      <h3 className="mt-1 font-display text-xl font-bold text-ink">{title}</h3>
    </>
  );
}

function StepBasic({ data, set }: { data: { listingType: string; propertyType: string; title: string; description: string }; set: Setter }) {
  return (
    <div>
      <SectionTitle step="A" title="ข้อมูลพื้นฐาน" />
      <div className="mt-6 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-ink">ประเภทธุรกรรม</label>
          <div className="flex gap-2">
            {[
              { k: "sale", l: "ขาย" },
              { k: "rent", l: "เช่า" },
            ].map((o) => (
              <button
                key={o.k}
                onClick={() => set("listingType", o.k as never)}
                className={cn(
                  "flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition-all",
                  data.listingType === o.k
                    ? "border-brand-600 bg-brand-50 text-brand-800"
                    : "border-line bg-white text-ink-muted hover:border-brand-300"
                )}
              >
                {o.l}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-ink">ประเภททรัพย์</label>
          <div className="grid grid-cols-3 gap-2 md:grid-cols-5">
            {[
              { k: "condo", l: "คอนโด" },
              { k: "house", l: "บ้านเดี่ยว" },
              { k: "townhouse", l: "ทาวน์เฮาส์" },
              { k: "land", l: "ที่ดิน" },
              { k: "commercial", l: "พาณิชย์" },
            ].map((o) => (
              <button
                key={o.k}
                onClick={() => set("propertyType", o.k as never)}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-sm font-medium transition-all",
                  data.propertyType === o.k
                    ? "border-brand-600 bg-brand-50 text-brand-800"
                    : "border-line bg-white text-ink-muted hover:border-brand-300"
                )}
              >
                {o.l}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-ink">ชื่อประกาศ</label>
          <input
            value={data.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="เช่น คอนโด Ashton Asoke ห้องสตูดิโอ วิวเมือง"
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-ink">รายละเอียด</label>
          <textarea
            rows={5}
            value={data.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="อธิบายจุดเด่นของทรัพย์ เช่น ทำเล การเดินทาง สิ่งอำนวยความสะดวก"
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>
    </div>
  );
}

function StepPrice({ data, set }: { data: { price: string; usableArea: string; bedrooms: number; bathrooms: number; parking: number }; set: Setter }) {
  const Counter = ({ label, value, k }: { label: string; value: number; k: "bedrooms" | "bathrooms" | "parking" }) => (
    <div>
      <label className="mb-2 block text-sm font-medium text-ink">{label}</label>
      <div className="flex items-center gap-2 rounded-xl border border-line bg-white p-1.5">
        <button
          onClick={() => set(k, Math.max(0, value - 1))}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-sunken"
        >
          −
        </button>
        <div className="flex-1 text-center font-display text-base font-bold">{value}</div>
        <button
          onClick={() => set(k, value + 1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-sunken"
        >
          +
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <SectionTitle step="B" title="ราคาและขนาด" />
      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-ink">ราคา (บาท)</label>
          <input
            type="number"
            value={data.price}
            onChange={(e) => set("price", e.target.value)}
            placeholder="6,900,000"
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-ink">พื้นที่ใช้สอย (ตร.ม.)</label>
          <input
            type="number"
            value={data.usableArea}
            onChange={(e) => set("usableArea", e.target.value)}
            placeholder="34.5"
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <Counter label="ห้องนอน" value={data.bedrooms} k="bedrooms" />
        <Counter label="ห้องน้ำ" value={data.bathrooms} k="bathrooms" />
        <Counter label="ที่จอดรถ" value={data.parking} k="parking" />
      </div>
    </div>
  );
}

const amenityOptions = [
  "สระว่ายน้ำ", "ฟิตเนส", "รักษาความปลอดภัย 24 ชม.",
  "ที่จอดรถ", "สวน", "เครื่องปรับอากาศ",
  "ลิฟต์", "Co-working space", "Kids Zone",
  "Pet Friendly", "EV Charging", "ซาวน่า",
];

function StepAmenities({
  data,
  set,
  toggleAmenity,
}: {
  data: { furnishing: string; amenities: string[] };
  set: Setter;
  toggleAmenity: (a: string) => void;
}) {
  return (
    <div>
      <SectionTitle step="C" title="สิ่งอำนวยความสะดวก" />
      <div className="mt-6 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-ink">เฟอร์นิเจอร์</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { k: "fully_furnished", l: "เฟอร์ครบ" },
              { k: "partially_furnished", l: "เฟอร์บางส่วน" },
              { k: "unfurnished", l: "ไม่มีเฟอร์" },
            ].map((o) => (
              <button
                key={o.k}
                onClick={() => set("furnishing", o.k as never)}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-sm font-medium transition-all",
                  data.furnishing === o.k
                    ? "border-brand-600 bg-brand-50 text-brand-800"
                    : "border-line bg-white text-ink-muted hover:border-brand-300"
                )}
              >
                {o.l}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-ink">
            สิ่งอำนวยสะดวก{" "}
            <span className="text-xs text-ink-muted">
              (เลือก {data.amenities.length})
            </span>
          </label>
          <div className="flex flex-wrap gap-2">
            {amenityOptions.map((a) => {
              const on = data.amenities.includes(a);
              return (
                <button
                  key={a}
                  onClick={() => toggleAmenity(a)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
                    on
                      ? "border-brand-600 bg-brand-50 text-brand-800"
                      : "border-line bg-white text-ink-muted hover:border-brand-300"
                  )}
                >
                  {on && <Check className="h-3 w-3" />}
                  {a}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepLocation({
  data,
  set,
  onMove,
}: {
  data: { district: string; projectName: string; latitude: number; longitude: number };
  set: Setter;
  onMove: (lat: number, lng: number) => void;
}) {
  return (
    <div>
      <SectionTitle step="D" title="ที่ตั้ง" />
      <div className="mt-6 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-ink">ชื่อโครงการ</label>
          <input
            value={data.projectName}
            onChange={(e) => set("projectName", e.target.value)}
            placeholder="เช่น Ashton Asoke"
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-ink">เขต / อำเภอ จังหวัด</label>
          <input
            value={data.district}
            onChange={(e) => set("district", e.target.value)}
            placeholder="วัฒนา, กรุงเทพฯ"
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-ink">ปักหมุดบนแผนที่</label>
          <DynamicMapPicker lat={data.latitude} lng={data.longitude} onChange={onMove} height={320} />
        </div>
      </div>
    </div>
  );
}

function StepPhotos({
  data,
  addPhoto,
  removePhoto,
  setCover,
  setUrl,
}: {
  data: { photos: string[]; coverIdx: number; virtualTourUrl: string; videoUrl: string };
  addPhoto: (url: string) => void;
  removePhoto: (idx: number) => void;
  setCover: (idx: number) => void;
  setUrl: Setter;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (data.photos.length + files.length > 20) {
      setUploadError("อัปโหลดได้สูงสุด 20 รูป");
      return;
    }
    setUploadError(null);
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: form });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "อัปโหลดล้มเหลว");
        addPhoto(data.url);
      }
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div>
      <SectionTitle step="E" title="อัปโหลดรูปภาพ" />
      <p className="mt-1 text-sm text-ink-muted">
        อัปโหลดสูงสุด 20 รูป · คลิก <Star className="inline h-3 w-3 text-accent-500" /> เพื่อตั้งรูปหน้าปก
      </p>

      <div className="mt-6">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
          className={cn(
            "flex cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed bg-surface-soft/60 p-10 text-center transition-colors",
            uploading ? "border-brand-400 bg-brand-50/40" : "border-line hover:border-brand-300"
          )}
        >
          <div>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
              <Upload className="h-6 w-6" />
            </div>
            <h4 className="mt-4 font-display text-base font-bold text-ink">
              {uploading ? "กำลังอัปโหลด..." : "ลากรูปมาที่นี่ หรือคลิกเพื่อเลือก"}
            </h4>
            <p className="mt-2 text-xs text-ink-muted">JPG, PNG, WebP · ขนาดไม่เกิน 10 MB/ไฟล์</p>
          </div>
        </div>

        {uploadError && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" />
            {uploadError}
          </div>
        )}

        {data.photos.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {data.photos.map((url, i) => (
              <div
                key={url}
                className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-line bg-surface-sunken"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
                {data.coverIdx === i && (
                  <div className="absolute left-2 top-2 rounded-full bg-gradient-brand px-2 py-0.5 text-[10px] font-semibold text-white shadow-soft">
                    หน้าปก
                  </div>
                )}
                <div className="absolute inset-x-1.5 bottom-1.5 flex items-center justify-between">
                  {data.coverIdx !== i && (
                    <button
                      type="button"
                      onClick={() => setCover(i)}
                      className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[10px] font-semibold text-ink-muted shadow-soft hover:text-brand-700"
                    >
                      <Star className="h-3 w-3" /> ตั้งหน้าปก
                    </button>
                  )}
                  <span />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-ink-muted shadow-soft hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
            {data.photos.length < 4 && (
              <div className="flex aspect-[4/3] items-center justify-center rounded-xl border border-dashed border-line text-xs text-ink-subtle">
                <ImageIcon className="h-5 w-5" />
              </div>
            )}
          </div>
        )}

        {/* Virtual tour & video URLs */}
        <div className="mt-8 space-y-4 rounded-2xl border border-line bg-surface-soft/40 p-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Virtual Tour 360° (optional)</label>
            <input
              type="url"
              value={data.virtualTourUrl}
              onChange={(e) => setUrl("virtualTourUrl", e.target.value)}
              placeholder="https://my.matterport.com/show/?m=XXXX หรือ kuula.co ..."
              className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            <p className="mt-1 text-xs text-ink-muted">
              ลิงก์ embed จาก Matterport, Kuula, My360 หรือ Cloudpano ให้ผู้ซื้อเดินชมแบบ 360°
            </p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">วิดีโอแนะนำ (optional)</label>
            <input
              type="url"
              value={data.videoUrl}
              onChange={(e) => setUrl("videoUrl", e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StepReview({ data }: { data: Data }) {
  return (
    <div>
      <SectionTitle step="สุดท้าย" title="ตรวจสอบข้อมูลก่อนส่ง" />
      <div className="mt-6 space-y-4">
        <div className="rounded-xl border border-line bg-surface-soft/50 p-5">
          <h4 className="font-display text-sm font-bold text-ink">ข้อมูลที่กรอก</h4>
          <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            {[
              ["ประเภท", data.listingType === "sale" ? "ขาย" : "เช่า"],
              ["ประเภททรัพย์", data.propertyType],
              ["ชื่อประกาศ", data.title || "—"],
              ["ราคา", data.price ? `฿${Number(data.price).toLocaleString()}` : "—"],
              ["ขนาด", data.usableArea ? `${data.usableArea} ตร.ม.` : "—"],
              ["ห้องนอน / ห้องน้ำ", `${data.bedrooms} / ${data.bathrooms}`],
              ["ที่ตั้ง", data.district || "—"],
              ["สิ่งอำนวยสะดวก", data.amenities.length > 0 ? `${data.amenities.length} รายการ` : "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-start justify-between gap-2 border-b border-line/60 py-1.5 last:border-0">
                <dt className="text-ink-muted">{k}</dt>
                <dd className="font-medium text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-xl border border-brand-200 bg-brand-50/60 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-brand text-white">
              <Eye className="h-4 w-4" />
            </div>
            <div className="text-sm">
              <div className="font-semibold text-brand-900">ขั้นตอนต่อไป</div>
              <p className="mt-0.5 text-ink-soft">
                ประกาศจะเข้าคิวรอ Admin อนุมัติ เฉลี่ยใช้เวลา 2-4 ชั่วโมง เมื่ออนุมัติแล้วจะเผยแพร่อัตโนมัติ
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

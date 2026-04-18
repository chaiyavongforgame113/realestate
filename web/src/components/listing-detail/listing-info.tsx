import { Bed, Bath, Maximize2, Car, MapPin, Train, Building2, Calendar } from "lucide-react";
import type { SampleListing } from "@/lib/sample-data";
import { formatPrice } from "@/lib/utils";

const propertyLabel: Record<string, string> = {
  condo: "คอนโดมิเนียม",
  house: "บ้านเดี่ยว",
  townhouse: "ทาวน์เฮาส์",
  land: "ที่ดิน",
  commercial: "อาคารพาณิชย์",
};

export function ListingInfo({ listing }: { listing: SampleListing }) {
  const attributes = [
    { Icon: Bed, label: "ห้องนอน", value: listing.bedrooms },
    { Icon: Bath, label: "ห้องน้ำ", value: listing.bathrooms },
    { Icon: Maximize2, label: listing.propertyType === "land" ? "พื้นที่ (ตร.ว.)" : "พื้นที่ใช้สอย (ตร.ม.)", value: listing.usableArea.toLocaleString() },
    { Icon: Car, label: "ที่จอดรถ", value: 2 },
    { Icon: Building2, label: "ประเภท", value: propertyLabel[listing.propertyType] },
    { Icon: Calendar, label: "โพสต์เมื่อ", value: "3 วันที่แล้ว" },
  ];

  const amenities = [
    "สระว่ายน้ำ",
    "ฟิตเนส",
    "รักษาความปลอดภัย 24 ชม.",
    "ที่จอดรถส่วนตัว",
    "ลิฟต์",
    "สวนกลาง",
    "Co-working space",
  ];

  return (
    <section className="rounded-2xl border border-line bg-white p-6 shadow-soft md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold leading-tight text-ink md:text-3xl">
            {listing.title}
          </h1>
          <div className="mt-2 flex items-center gap-1.5 text-sm text-ink-muted">
            <MapPin className="h-4 w-4" />
            <span>{listing.district}</span>
            {listing.nearestTransit && (
              <>
                <span className="mx-1 h-1 w-1 rounded-full bg-ink-subtle" />
                <Train className="h-3.5 w-3.5" />
                <span>
                  {listing.nearestTransit} · {listing.transitDistance}ม.
                </span>
              </>
            )}
          </div>
        </div>

        <div className="text-right">
          <div className="font-display text-3xl font-bold text-ink md:text-4xl">
            {formatPrice(listing.price, listing.priceUnit)}
          </div>
          {listing.priceUnit === "total" && (
            <div className="mt-1 text-xs text-ink-muted">
              ≈ {Math.round(listing.price / listing.usableArea).toLocaleString()} บาท/ตร.ม.
            </div>
          )}
        </div>
      </div>

      {/* Attributes grid */}
      <div className="mt-6 grid grid-cols-2 gap-3 border-y border-line py-5 md:grid-cols-3 md:gap-5">
        {attributes.map((a) => (
          <div key={a.label} className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <a.Icon className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-ink-muted">{a.label}</div>
              <div className="font-display text-[15px] font-semibold text-ink">{a.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* AI match */}
      {listing.matchReason && (
        <div className="mt-5 rounded-xl border border-accent-200 bg-accent-50/60 p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-brand text-white">
              ✨
            </span>
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-accent-900">
                ทำไมตรงกับคุณ
              </div>
              <p className="mt-1 text-[15px] text-ink-soft">{listing.matchReason}</p>
            </div>
          </div>
        </div>
      )}

      {/* Description */}
      <div className="mt-6">
        <h3 className="font-display text-lg font-bold text-ink">รายละเอียด</h3>
        <p className="mt-3 whitespace-pre-line text-[15px] leading-7 text-ink-soft">
          {`ทรัพย์คุณภาพใจกลางเมือง ใกล้รถไฟฟ้า เหมาะทั้งอยู่อาศัยและลงทุนปล่อยเช่า
ห้องแต่งครบพร้อมอยู่ สามารถย้ายเข้าได้ทันที ส่วนกลางครบครัน รักษาความปลอดภัย 24 ชั่วโมง
รายล้อมด้วยห้างสรรพสินค้า ร้านอาหาร โรงพยาบาล และสถานศึกษาชั้นนำ

พร้อมให้ผู้สนใจเข้าชมห้องจริงได้ทุกวัน ติดต่อ Agent เพื่อนัดหมายล่วงหน้า`}
        </p>
      </div>

      {/* Amenities */}
      <div className="mt-6">
        <h3 className="font-display text-lg font-bold text-ink">สิ่งอำนวยความสะดวก</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {amenities.map((a) => (
            <span
              key={a}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-sm text-ink-soft"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              {a}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

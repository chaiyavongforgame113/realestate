"use client";

import { Camera, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";

export default function ProfilePage() {
  return (
    <div>
      <PageHeader title="Profile" description="ข้อมูลส่วนตัวและบัญชีของคุณ" />

      <div className="space-y-5">
        {/* Avatar */}
        <section className="rounded-2xl border border-line bg-white p-6 shadow-soft">
          <h3 className="font-display text-base font-bold">รูปโปรไฟล์</h3>
          <div className="mt-4 flex items-center gap-5">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-brand text-3xl font-bold text-white">
                ธ
              </div>
              <button className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink-muted shadow-soft ring-2 ring-white hover:bg-brand-50 hover:text-brand-700">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div>
              <Button variant="outline" size="sm">
                <Camera className="h-4 w-4" />
                เปลี่ยนรูป
              </Button>
              <p className="mt-2 text-xs text-ink-muted">JPG, PNG · สูงสุด 2 MB</p>
            </div>
          </div>
        </section>

        {/* Personal info */}
        <section className="rounded-2xl border border-line bg-white p-6 shadow-soft">
          <h3 className="font-display text-base font-bold">ข้อมูลส่วนตัว</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="ชื่อจริง" defaultValue="ธนพล" />
            <Field label="นามสกุล" defaultValue="ภูวณิช" />
            <Field label="อีเมล" defaultValue="thanapol@example.com" rightSlot={<VerifiedBadge />} />
            <Field label="เบอร์โทร" defaultValue="081-234-5678" />
          </div>
          <Button variant="primary" size="md" className="mt-5">
            บันทึก
          </Button>
        </section>

        {/* Password */}
        <section className="rounded-2xl border border-line bg-white p-6 shadow-soft">
          <h3 className="font-display text-base font-bold">รหัสผ่าน</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="รหัสผ่านปัจจุบัน" type="password" />
            <Field label="รหัสผ่านใหม่" type="password" />
            <Field label="ยืนยันรหัสผ่านใหม่" type="password" />
          </div>
          <Button variant="primary" size="md" className="mt-5">
            เปลี่ยนรหัสผ่าน
          </Button>
        </section>

        {/* Danger zone */}
        <section className="rounded-2xl border border-red-200 bg-red-50/30 p-6">
          <h3 className="font-display text-base font-bold text-red-900">Danger Zone</h3>
          <p className="mt-1 text-sm text-ink-muted">ลบบัญชีถาวร ไม่สามารถกู้คืนได้</p>
          <Button variant="outline" size="md" className="mt-4 border-red-200 text-red-700 hover:border-red-400 hover:bg-red-100 hover:text-red-800">
            ลบบัญชี
          </Button>
        </section>
      </div>
    </div>
  );
}

function Field({
  label,
  defaultValue,
  type = "text",
  rightSlot,
}: {
  label: string;
  defaultValue?: string;
  type?: string;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-ink-muted">{label}</label>
      <div className="relative">
        <input
          type={type}
          defaultValue={defaultValue}
          className="h-11 w-full rounded-xl border border-line bg-white px-3.5 pr-16 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        {rightSlot && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">{rightSlot}</div>
        )}
      </div>
    </div>
  );
}

function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-800">
      <Check className="h-3 w-3" /> ยืนยันแล้ว
    </span>
  );
}

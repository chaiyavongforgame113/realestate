"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Camera, Check, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { cn } from "@/lib/utils";

interface Me {
  id: string;
  email: string;
  role: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl?: string | null;
  phone?: string | null;
}

export default function ProfilePage() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  async function loadMe() {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        window.location.href = "/login?redirect=/profile";
        return;
      }
      const { user } = await res.json();
      setMe(user);
      setFirstName(user.firstName ?? "");
      setLastName(user.lastName ?? "");
      setPhone(user.phone ?? "");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMe();
  }, []);

  async function saveProfile() {
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "บันทึกไม่สำเร็จ");
      setProfileMsg({ type: "ok", text: "บันทึกแล้ว" });
      await loadMe();
    } catch (e) {
      setProfileMsg({ type: "err", text: e instanceof Error ? e.message : "เกิดข้อผิดพลาด" });
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword() {
    setPwdMsg(null);
    if (newPwd.length < 8) {
      setPwdMsg({ type: "err", text: "รหัสผ่านใหม่อย่างน้อย 8 ตัว" });
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdMsg({ type: "err", text: "ยืนยันรหัสไม่ตรง" });
      return;
    }
    setSavingPwd(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "เปลี่ยนรหัสไม่สำเร็จ");
      setPwdMsg({ type: "ok", text: "เปลี่ยนรหัสผ่านแล้ว" });
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
    } catch (e) {
      setPwdMsg({ type: "err", text: e instanceof Error ? e.message : "เกิดข้อผิดพลาด" });
    } finally {
      setSavingPwd(false);
    }
  }

  async function uploadAvatar(file: File) {
    setUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/profile/avatar", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "อัปโหลดล้มเหลว");
      await loadMe();
    } catch (e) {
      alert(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setUploadingAvatar(false);
    }
  }

  if (loading) {
    return (
      <div className="py-16 text-center text-sm text-ink-muted">
        <Loader2 className="mx-auto h-5 w-5 animate-spin" /> กำลังโหลด...
      </div>
    );
  }

  const initial = (firstName?.[0] || me?.email?.[0] || "?").toUpperCase();

  return (
    <div>
      <PageHeader title="Profile" description="ข้อมูลส่วนตัวและบัญชีของคุณ" />

      <div className="space-y-5">
        {/* Avatar */}
        <section className="rounded-2xl border border-line bg-white p-6 shadow-soft">
          <h3 className="font-display text-base font-bold">รูปโปรไฟล์</h3>
          <div className="mt-4 flex items-center gap-5">
            <div className="relative">
              <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-gradient-brand text-3xl font-bold text-white">
                {me?.avatarUrl ? (
                  <Image src={me.avatarUrl} alt="avatar" fill sizes="80px" className="object-cover" />
                ) : (
                  initial
                )}
              </div>
              <button
                onClick={() => fileInput.current?.click()}
                disabled={uploadingAvatar}
                className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink-muted shadow-soft ring-2 ring-white hover:bg-brand-50 hover:text-brand-700 disabled:opacity-50"
                aria-label="เปลี่ยนรูป"
              >
                {uploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              </button>
            </div>
            <div>
              <input
                ref={fileInput}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadAvatar(f);
                  e.target.value = "";
                }}
              />
              <Button variant="outline" size="sm" onClick={() => fileInput.current?.click()} disabled={uploadingAvatar}>
                <Camera className="h-4 w-4" />
                {uploadingAvatar ? "กำลังอัปโหลด..." : "เปลี่ยนรูป"}
              </Button>
              <p className="mt-2 text-xs text-ink-muted">JPG, PNG, WebP · สูงสุด 2 MB</p>
            </div>
          </div>
        </section>

        {/* Personal info */}
        <section className="rounded-2xl border border-line bg-white p-6 shadow-soft">
          <h3 className="font-display text-base font-bold">ข้อมูลส่วนตัว</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="ชื่อจริง" value={firstName} onChange={setFirstName} />
            <Field label="นามสกุล" value={lastName} onChange={setLastName} />
            <Field label="อีเมล" value={me?.email ?? ""} disabled rightSlot={<VerifiedBadge />} />
            <Field label="เบอร์โทร" value={phone} onChange={setPhone} placeholder="081-234-5678" />
          </div>
          <div className="mt-5 flex items-center gap-3">
            <Button variant="primary" size="md" onClick={saveProfile} disabled={savingProfile}>
              {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              บันทึก
            </Button>
            {profileMsg && <Msg msg={profileMsg} />}
          </div>
        </section>

        {/* Password */}
        <section className="rounded-2xl border border-line bg-white p-6 shadow-soft">
          <h3 className="font-display text-base font-bold">รหัสผ่าน</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="รหัสผ่านปัจจุบัน" type="password" value={currentPwd} onChange={setCurrentPwd} />
            <Field label="รหัสผ่านใหม่" type="password" value={newPwd} onChange={setNewPwd} />
            <Field label="ยืนยันรหัสผ่านใหม่" type="password" value={confirmPwd} onChange={setConfirmPwd} />
          </div>
          <div className="mt-5 flex items-center gap-3">
            <Button variant="primary" size="md" onClick={changePassword} disabled={savingPwd}>
              {savingPwd ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              เปลี่ยนรหัสผ่าน
            </Button>
            {pwdMsg && <Msg msg={pwdMsg} />}
          </div>
        </section>

        {/* Danger zone */}
        <section className="rounded-2xl border border-red-200 bg-red-50/30 p-6">
          <h3 className="font-display text-base font-bold text-red-900">Danger Zone</h3>
          <p className="mt-1 text-sm text-ink-muted">ลบบัญชีถาวร ไม่สามารถกู้คืนได้</p>
          <Button
            variant="outline"
            size="md"
            className="mt-4 border-red-200 text-red-700 hover:border-red-400 hover:bg-red-100 hover:text-red-800"
            disabled
            title="ยังไม่เปิดให้ใช้งาน — ติดต่อทีมงาน"
          >
            ลบบัญชี
          </Button>
        </section>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  rightSlot,
  disabled,
  placeholder,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  type?: string;
  rightSlot?: React.ReactNode;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-ink-muted">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            "h-11 w-full rounded-xl border border-line bg-white px-3.5 pr-16 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100",
            disabled && "bg-surface-soft/60 text-ink-muted"
          )}
        />
        {rightSlot && <div className="absolute right-2 top-1/2 -translate-y-1/2">{rightSlot}</div>}
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

function Msg({ msg }: { msg: { type: "ok" | "err"; text: string } }) {
  const cls =
    msg.type === "ok"
      ? "text-emerald-700"
      : "text-red-700";
  const Icon = msg.type === "ok" ? Check : AlertCircle;
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm", cls)}>
      <Icon className="h-4 w-4" />
      {msg.text}
    </span>
  );
}

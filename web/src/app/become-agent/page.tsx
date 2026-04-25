"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  CheckCircle2,
  Award,
  FileText,
  UserCircle,
  TrendingUp,
  AlertCircle,
  Loader2,
  X,
  Clock,
  Pencil,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Status = "pending_review" | "approved" | "rejected" | "info_requested";

interface Application {
  id: string;
  status: Status;
  adminNote: string | null;
  fullName: string;
  companyName: string | null;
  phone: string;
  experienceYears: number;
  expertiseAreas: string;
  licenseDocumentUrl: string | null;
  idDocumentUrl: string | null;
  createdAt: string;
  updatedAt: string;
  reviewedAt: string | null;
}

type DocFile = { url: string; name: string; size: number } | null;

export default function BecomeAgentPage() {
  const router = useRouter();
  const [loadingMe, setLoadingMe] = useState(true);
  const [application, setApplication] = useState<Application | null>(null);
  const [editing, setEditing] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    companyName: "",
    phone: "",
    experienceYears: "",
    expertiseAreas: "",
  });
  const [licenseDoc, setLicenseDoc] = useState<DocFile>(null);
  const [idDoc, setIdDoc] = useState<DocFile>(null);

  async function loadApplication() {
    setLoadingMe(true);
    try {
      const res = await fetch("/api/agent/apply");
      if (res.status === 401) {
        router.push("/login?reason=account&redirect=/become-agent");
        return;
      }
      const data = await res.json();
      setApplication(data.application);
      if (data.application) {
        const exp = (() => {
          try {
            const arr = JSON.parse(data.application.expertiseAreas);
            return Array.isArray(arr) ? arr.join(", ") : "";
          } catch {
            return "";
          }
        })();
        setForm({
          fullName: data.application.fullName,
          companyName: data.application.companyName ?? "",
          phone: data.application.phone,
          experienceYears: String(data.application.experienceYears),
          expertiseAreas: exp,
        });
        if (data.application.licenseDocumentUrl) {
          setLicenseDoc({ url: data.application.licenseDocumentUrl, name: "ใบอนุญาต (เดิม)", size: 0 });
        }
        if (data.application.idDocumentUrl) {
          setIdDoc({ url: data.application.idDocumentUrl, name: "บัตรประชาชน (เดิม)", size: 0 });
        }
      }
    } finally {
      setLoadingMe(false);
    }
  }

  useEffect(() => {
    loadApplication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const isResubmit = application?.status === "info_requested";
      const url = "/api/agent/apply";
      const res = await fetch(url, {
        method: isResubmit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          companyName: form.companyName || undefined,
          phone: form.phone,
          experienceYears: Number(form.experienceYears) || 0,
          expertiseAreas: form.expertiseAreas.split(",").map((s) => s.trim()).filter(Boolean),
          licenseDocumentUrl: licenseDoc?.url,
          idDocumentUrl: idDoc?.url,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login?reason=account&redirect=/become-agent");
          return;
        }
        throw new Error(data.error ?? "ส่งใบสมัครไม่สำเร็จ");
      }
      setEditing(false);
      await loadApplication();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingMe) {
    return (
      <main>
        <Navbar />
        <div className="bg-gradient-mesh pt-24 md:pt-28">
          <Container>
            <div className="py-32 text-center text-sm text-ink-muted">
              <Loader2 className="mx-auto h-5 w-5 animate-spin" />
              กำลังโหลด...
            </div>
          </Container>
        </div>
        <Footer />
      </main>
    );
  }

  const showForm = !application || editing || application.status === "info_requested";

  return (
    <main>
      <Navbar />
      <div className="bg-gradient-mesh pt-24 md:pt-28">
        <Container>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-brand-700"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับหน้าแรก
          </Link>

          <div className="mt-6 grid grid-cols-1 gap-8 pb-16 lg:grid-cols-[1fr_420px]">
            {/* Left: benefits */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-200/60 bg-white/70 px-3 py-1 text-xs font-semibold text-brand-800 backdrop-blur-sm">
                <Award className="h-3.5 w-3.5" />
                สมัคร Agent · ฟรี
              </div>
              <h1 className="mt-4 font-display text-display-md font-bold text-ink">
                เข้าร่วมเครือข่าย <span className="text-gradient-brand">Agent คุณภาพ</span>
              </h1>
              <p className="mt-4 max-w-xl text-ink-muted">
                ใช้ประโยชน์จาก AI Match ที่ส่ง lead "ตรงใจจริง" ให้คุณ
                ประหยัดเวลาหาลูกค้า และปิดดีลได้เร็วขึ้น
              </p>

              <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                {[
                  { Icon: TrendingUp, title: "Lead คุณภาพ", desc: "ผ่านการกรองด้วย AI ก่อนถึงมือคุณ" },
                  { Icon: FileText, title: "ฟรี ลงประกาศไม่จำกัด", desc: "ไม่มีค่าสมาชิก · ไม่มีค่าลงประกาศ" },
                  { Icon: UserCircle, title: "Badge ยืนยันตัวตน", desc: "เพิ่มความน่าเชื่อถือในสายตาลูกค้า" },
                  { Icon: Award, title: "Analytics Dashboard", desc: "ติดตามประสิทธิภาพประกาศแบบ real-time" },
                ].map((b) => (
                  <div key={b.title} className="flex gap-3 rounded-2xl border border-line bg-white/70 p-4 backdrop-blur-sm">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                      <b.Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-display text-sm font-semibold text-ink">{b.title}</h4>
                      <p className="mt-0.5 text-xs text-ink-muted">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: status or form */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <AnimatePresence mode="wait">
                {application && !showForm ? (
                  <ApplicationStatusCard
                    key="status"
                    application={application}
                    onEdit={() => setEditing(true)}
                  />
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSubmit}
                    className="rounded-2xl border border-line bg-white p-6 shadow-card md:p-8"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-lg font-bold">
                        {application?.status === "info_requested" ? "ส่งข้อมูลเพิ่มเติม" : "ใบสมัคร"}
                      </h3>
                      {application && editing && (
                        <button
                          type="button"
                          onClick={() => setEditing(false)}
                          className="text-xs text-ink-muted hover:text-ink"
                        >
                          ยกเลิก
                        </button>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-ink-muted">
                      {application?.status === "info_requested"
                        ? "Admin ขอข้อมูลเพิ่ม — แก้ไขแล้วส่งใหม่"
                        : "กรอกข้อมูลให้ครบเพื่อการอนุมัติที่รวดเร็ว"}
                    </p>

                    {application?.status === "info_requested" && application.adminNote && (
                      <div className="mt-3 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <div>
                          <div className="font-semibold">หมายเหตุจาก Admin</div>
                          <div className="mt-0.5">{application.adminNote}</div>
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        {error}
                      </div>
                    )}

                    <div className="mt-5 space-y-3">
                      <input
                        required
                        value={form.fullName}
                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                        placeholder="ชื่อ-นามสกุล จริง"
                        className="h-11 w-full rounded-xl border border-line px-3.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                      />
                      <input
                        value={form.companyName}
                        onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                        placeholder="ชื่อบริษัท/นามแฝง (optional)"
                        className="h-11 w-full rounded-xl border border-line px-3.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          required
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="เบอร์โทร"
                          className="h-11 rounded-xl border border-line px-3.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                        />
                        <input
                          required
                          type="number"
                          value={form.experienceYears}
                          onChange={(e) => setForm({ ...form, experienceYears: e.target.value })}
                          placeholder="ประสบการณ์ (ปี)"
                          className="h-11 rounded-xl border border-line px-3.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                        />
                      </div>
                      <input
                        value={form.expertiseAreas}
                        onChange={(e) => setForm({ ...form, expertiseAreas: e.target.value })}
                        placeholder="ย่านที่เชี่ยวชาญ (คั่นด้วย ,)"
                        className="h-11 w-full rounded-xl border border-line px-3.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                      />

                      <DocUpload
                        label="ใบอนุญาตนายหน้า"
                        kind="license"
                        value={licenseDoc}
                        onChange={setLicenseDoc}
                      />

                      <DocUpload
                        label="สำเนาบัตรประชาชน"
                        kind="id"
                        value={idDoc}
                        onChange={setIdDoc}
                      />
                    </div>

                    <Button variant="primary" size="lg" className="mt-5 w-full" type="submit" disabled={submitting}>
                      {submitting ? "กำลังส่ง..." : application?.status === "info_requested" ? "ส่งข้อมูลใหม่" : "ส่งใบสมัคร"}
                    </Button>
                    <p className="mt-3 text-center text-[11px] text-ink-muted">
                      ข้อมูลของคุณได้รับการปกป้องตาม PDPA
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Container>
      </div>
      <Footer />
    </main>
  );
}

function ApplicationStatusCard({
  application,
  onEdit,
}: {
  application: Application;
  onEdit: () => void;
}) {
  const config: Record<
    Status,
    { Icon: typeof CheckCircle2; iconCls: string; bgCls: string; title: string; desc: string }
  > = {
    pending_review: {
      Icon: Clock,
      iconCls: "text-amber-600",
      bgCls: "bg-amber-50",
      title: "รอ Admin พิจารณา",
      desc: "ปกติใช้เวลาไม่เกิน 2 วันทำการ — เราจะแจ้งผลทางอีเมลและในแอป",
    },
    approved: {
      Icon: CheckCircle2,
      iconCls: "text-emerald-600",
      bgCls: "bg-emerald-50",
      title: "อนุมัติแล้ว",
      desc: "คุณเป็น Agent แล้ว — เริ่มลงประกาศได้เลย",
    },
    rejected: {
      Icon: X,
      iconCls: "text-red-600",
      bgCls: "bg-red-50",
      title: "ใบสมัครถูกปฏิเสธ",
      desc: "หากต้องการสมัครใหม่ ติดต่อทีมงานหรือกดด้านล่าง",
    },
    info_requested: {
      Icon: AlertCircle,
      iconCls: "text-amber-600",
      bgCls: "bg-amber-50",
      title: "Admin ขอข้อมูลเพิ่ม",
      desc: "กรุณาแก้ไขข้อมูลตามคำแนะนำด้านล่างแล้วส่งใหม่",
    },
  };

  const c = config[application.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-line bg-white p-6 shadow-card md:p-8"
    >
      <div className={cn("mx-auto flex h-14 w-14 items-center justify-center rounded-2xl", c.bgCls)}>
        <c.Icon className={cn("h-7 w-7", c.iconCls)} />
      </div>
      <h3 className="mt-4 text-center font-display text-xl font-bold">{c.title}</h3>
      <p className="mt-1 text-center text-sm text-ink-muted">{c.desc}</p>

      {application.adminNote && (
        <div
          className={cn(
            "mt-4 rounded-xl border p-3 text-sm",
            application.status === "rejected"
              ? "border-red-200 bg-red-50/60 text-red-900"
              : "border-amber-200 bg-amber-50/60 text-amber-900"
          )}
        >
          <div className="text-[11px] font-semibold uppercase tracking-widest">หมายเหตุจาก Admin</div>
          <div className="mt-1">{application.adminNote}</div>
        </div>
      )}

      <div className="mt-5 space-y-2 rounded-xl bg-surface-soft p-4 text-sm">
        <StepRow done label="ได้รับใบสมัครแล้ว" />
        <StepRow
          done={application.status !== "pending_review"}
          loading={application.status === "pending_review"}
          label="Admin พิจารณา"
        />
        <StepRow
          done={application.status === "approved"}
          label={
            application.status === "approved"
              ? "อนุมัติเป็น Agent"
              : application.status === "rejected"
              ? "ปฏิเสธ"
              : application.status === "info_requested"
              ? "ขอข้อมูลเพิ่ม"
              : "รับผลทางอีเมล"
          }
        />
      </div>

      <div className="mt-3 text-[11px] text-ink-subtle">
        ส่งเมื่อ {new Date(application.createdAt).toLocaleString("th-TH")}
        {application.reviewedAt && ` · ตรวจสอบเมื่อ ${new Date(application.reviewedAt).toLocaleString("th-TH")}`}
      </div>

      <div className="mt-5 flex flex-col gap-2">
        {application.status === "approved" && (
          <Link href="/agent">
            <Button variant="primary" size="md" className="w-full">
              ไปที่ Agent Portal
            </Button>
          </Link>
        )}
        {application.status === "info_requested" && (
          <Button variant="primary" size="md" className="w-full" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
            ส่งข้อมูลเพิ่มเติม
          </Button>
        )}
        {application.status === "rejected" && (
          <Link href="/help">
            <Button variant="outline" size="md" className="w-full">
              ติดต่อทีมงาน
            </Button>
          </Link>
        )}
        {application.status === "pending_review" && (
          <Button variant="outline" size="md" className="w-full" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
            แก้ไขข้อมูล
          </Button>
        )}
      </div>
    </motion.div>
  );
}

function StepRow({ done, loading, label }: { done?: boolean; loading?: boolean; label: string }) {
  return (
    <div className={cn("flex items-center gap-2", done ? "text-ink-muted" : "text-ink-subtle")}>
      {loading ? (
        <span className="h-4 w-4 rounded-full border-2 border-ink-subtle border-t-brand-600 animate-spin" />
      ) : done ? (
        <CheckCircle2 className="h-4 w-4 text-brand-600" />
      ) : (
        <span className="h-4 w-4 rounded-full border border-line" />
      )}
      {label}
    </div>
  );
}

function DocUpload({
  label,
  kind,
  value,
  onChange,
}: {
  label: string;
  kind: "license" | "id";
  value: DocFile;
  onChange: (v: DocFile) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", kind);
      const res = await fetch("/api/agent/apply/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "อัปโหลดล้มเหลว");
      onChange({ url: data.url, name: data.name, size: data.size });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "เกิดข้อผิดพลาด");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-ink-muted">{label}</label>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex w-full items-center gap-3 rounded-xl border border-dashed border-line bg-surface-soft/60 p-3 text-left transition-colors hover:border-brand-300 hover:bg-brand-50/40 disabled:opacity-60"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-brand-700">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : value ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Upload className="h-4 w-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="truncate text-sm font-medium text-ink">
            {value ? value.name : "คลิกเพื่อเลือกไฟล์"}
          </div>
          <div className="text-[11px] text-ink-muted">
            {value && value.size > 0
              ? `${(value.size / 1024 / 1024).toFixed(2)} MB · คลิกเพื่อเปลี่ยน`
              : value
              ? "ไฟล์ที่อัปโหลดไว้แล้ว · คลิกเพื่อเปลี่ยน"
              : "PDF หรือ รูปภาพ · สูงสุด 5 MB"}
          </div>
        </div>
        {value && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted hover:bg-red-50 hover:text-red-600"
            aria-label="ลบไฟล์"
          >
            <X className="h-4 w-4" />
          </span>
        )}
      </button>
      {err && <div className="mt-1 text-xs text-red-600">{err}</div>}
    </div>
  );
}

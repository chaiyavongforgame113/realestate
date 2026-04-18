"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, CheckCircle2, Award, FileText, UserCircle, TrendingUp, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export default function BecomeAgentPage() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    companyName: "",
    phone: "",
    experienceYears: "",
    expertiseAreas: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/agent/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          companyName: form.companyName || undefined,
          phone: form.phone,
          experienceYears: Number(form.experienceYears) || 0,
          expertiseAreas: form.expertiseAreas.split(",").map((s) => s.trim()).filter(Boolean),
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
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

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

            {/* Right: form */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-line bg-white p-8 shadow-card"
                  >
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50">
                      <CheckCircle2 className="h-7 w-7 text-brand-600" />
                    </div>
                    <h3 className="mt-4 text-center font-display text-xl font-bold">ส่งใบสมัครสำเร็จ</h3>
                    <p className="mt-1 text-center text-sm text-ink-muted">
                      Admin จะพิจารณาและแจ้งผลทางอีเมลภายใน 2 วันทำการ
                    </p>
                    <div className="mt-6 space-y-2 rounded-xl bg-surface-soft p-4 text-sm">
                      <div className="flex items-center gap-2 text-ink-muted">
                        <CheckCircle2 className="h-4 w-4 text-brand-600" />
                        ได้รับใบสมัครแล้ว
                      </div>
                      <div className="flex items-center gap-2 text-ink-muted">
                        <span className="h-4 w-4 rounded-full border-2 border-ink-subtle border-t-brand-600 animate-spin" />
                        รอ Admin พิจารณา
                      </div>
                      <div className="flex items-center gap-2 text-ink-subtle">
                        <span className="h-4 w-4 rounded-full border border-line" />
                        รับผลทางอีเมล
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSubmit}
                    className="rounded-2xl border border-line bg-white p-6 shadow-card md:p-8"
                  >
                    <h3 className="font-display text-lg font-bold">ใบสมัคร</h3>
                    <p className="mt-1 text-xs text-ink-muted">กรอกข้อมูลให้ครบเพื่อการอนุมัติที่รวดเร็ว</p>

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

                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-ink-muted">
                          ใบอนุญาตนายหน้า
                        </label>
                        <div className="flex items-center gap-3 rounded-xl border border-dashed border-line bg-surface-soft/60 p-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-brand-700">
                            <Upload className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-ink">คลิกเพื่อเลือกไฟล์</div>
                            <div className="text-[11px] text-ink-muted">PDF หรือ รูปภาพ · สูงสุด 5 MB</div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-ink-muted">
                          สำเนาบัตรประชาชน
                        </label>
                        <div className="flex items-center gap-3 rounded-xl border border-dashed border-line bg-surface-soft/60 p-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-brand-700">
                            <Upload className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-ink">คลิกเพื่อเลือกไฟล์</div>
                            <div className="text-[11px] text-ink-muted">ขีดฆ่าข้อมูลที่ไม่จำเป็นได้</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button variant="primary" size="lg" className="mt-5 w-full" type="submit" disabled={loading}>
                      {loading ? "กำลังส่ง..." : "ส่งใบสมัคร"}
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

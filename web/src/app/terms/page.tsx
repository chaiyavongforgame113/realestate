import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Container } from "@/components/ui/container";

export default function TermsPage() {
  return (
    <main>
      <Navbar />
      <div className="pt-24 md:pt-28">
        <Container className="max-w-3xl">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-brand-700"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับหน้าแรก
          </Link>
          <h1 className="mt-4 font-display text-display-md font-bold text-ink">เงื่อนไขการใช้งาน</h1>
          <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-ink-soft">
            <section>
              <h2 className="font-display text-lg font-bold text-ink">1. การยอมรับเงื่อนไข</h2>
              <p className="mt-2">
                การเข้าใช้งาน Estate AI ถือว่าคุณได้อ่านและยอมรับเงื่อนไขการใช้งานเหล่านี้แล้ว
              </p>
            </section>
            <section>
              <h2 className="font-display text-lg font-bold text-ink">2. บัญชีผู้ใช้</h2>
              <p className="mt-2">
                ผู้ใช้ต้องรักษาความปลอดภัยของรหัสผ่านและรับผิดชอบต่อกิจกรรมที่เกิดขึ้นในบัญชีของตน
              </p>
            </section>
            <section>
              <h2 className="font-display text-lg font-bold text-ink">3. Agent</h2>
              <p className="mt-2">
                ข้อมูลที่ Agent ลงประกาศต้องถูกต้องและไม่ละเมิดลิขสิทธิ์ผู้อื่น
              </p>
            </section>
            <section>
              <h2 className="font-display text-lg font-bold text-ink">4. การใช้ AI</h2>
              <p className="mt-2">
                AI ช่วยวิเคราะห์และแนะนำ — ผลลัพธ์เป็นเพียงแนวทาง ไม่ใช่คำแนะนำทางการเงิน
                ผู้ใช้ควรตรวจสอบข้อมูลเพิ่มเติมก่อนตัดสินใจ
              </p>
            </section>
          </div>
        </Container>
      </div>
      <Footer />
    </main>
  );
}

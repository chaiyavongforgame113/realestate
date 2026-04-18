import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Container } from "@/components/ui/container";

export default function PrivacyPage() {
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
          <h1 className="mt-4 font-display text-display-md font-bold text-ink">นโยบายความเป็นส่วนตัว</h1>
          <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-ink-soft">
            <section>
              <h2 className="font-display text-lg font-bold text-ink">1. ข้อมูลที่เก็บ</h2>
              <p className="mt-2">อีเมล, ชื่อ, เบอร์โทร, การค้นหา, การติดต่อ Agent และข้อมูล login</p>
            </section>
            <section>
              <h2 className="font-display text-lg font-bold text-ink">2. การใช้ข้อมูล</h2>
              <p className="mt-2">
                เพื่อให้บริการ AI search ที่ตรงใจ ติดต่อ Agent และส่งการแจ้งเตือนที่เกี่ยวข้อง
              </p>
            </section>
            <section>
              <h2 className="font-display text-lg font-bold text-ink">3. PDPA</h2>
              <p className="mt-2">
                ผู้ใช้สามารถขอดาวน์โหลด, แก้ไข หรือลบข้อมูลของตนได้ที่หน้า Settings
              </p>
            </section>
            <section>
              <h2 className="font-display text-lg font-bold text-ink">4. คุกกี้</h2>
              <p className="mt-2">ใช้เพื่อเก็บ session, preferences และ analytics</p>
            </section>
          </div>
        </Container>
      </div>
      <Footer />
    </main>
  );
}

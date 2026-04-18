import Link from "next/link";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Container } from "@/components/ui/container";

const faqs = [
  {
    q: "AI Search คืออะไร?",
    a: "AI ของเราเข้าใจภาษาไทยธรรมชาติ คุณสามารถพิมพ์ความต้องการแบบประโยคยาว ๆ เช่น 'คอนโดใกล้ BTS งบ 5 ล้าน' แล้วระบบจะหาทรัพย์ที่ตรงใจให้",
  },
  {
    q: "ลงประกาศยังไง?",
    a: "สมัครเป็น Agent ก่อน (ฟรี) — รอ Admin อนุมัติ 2-4 ชม. แล้วลงประกาศได้ทันที ไม่จำกัดจำนวน",
  },
  {
    q: "ใช้บริการฟรีจริงไหม?",
    a: "ฟรีทั้งสำหรับผู้ค้นหาและ Agent พื้นฐาน — ไม่มีค่าสมัคร, ไม่มีค่าธรรมเนียม lead, ลงประกาศไม่จำกัด",
  },
  {
    q: "ข้อมูลของฉันปลอดภัยไหม?",
    a: "ใช้มาตรฐาน PDPA คุณสามารถดาวน์โหลด แก้ไข หรือลบข้อมูลของตนได้ที่หน้า Settings ทุกเวลา",
  },
  {
    q: "AI แนะนำผิดจะทำยังไง?",
    a: "AI เป็นผู้ช่วย ไม่ใช่ผู้ตัดสินใจ — ใช้ผลลัพธ์เป็นแนวทาง ทุกครั้งควรตรวจสอบข้อมูลกับ Agent ก่อนตัดสินใจ",
  },
  {
    q: "ติดต่อ Support ยังไง?",
    a: "ส่งข้อความผ่านหน้า ติดต่อเรา หรืออีเมล hello@estate.ai — ตอบกลับภายใน 24 ชม.",
  },
];

export default function HelpPage() {
  return (
    <main>
      <Navbar />
      <div className="pt-24 md:pt-28">
        <Container className="max-w-3xl">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-brand-700">
            <ArrowLeft className="h-4 w-4" />
            กลับหน้าแรก
          </Link>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <HelpCircle className="h-5 w-5" />
            </div>
            <h1 className="font-display text-display-md font-bold text-ink">ศูนย์ช่วยเหลือ</h1>
          </div>
          <p className="mt-2 text-ink-muted">คำถามที่พบบ่อย — ถ้าไม่เจอคำตอบ{" "}
            <Link href="/contact" className="font-semibold text-brand-700 hover:text-brand-800">
              ติดต่อเรา
            </Link>
          </p>

          <div className="mt-8 space-y-3">
            {faqs.map((f, i) => (
              <details key={i} className="group rounded-2xl border border-line bg-white p-5 shadow-soft open:shadow-lift">
                <summary className="cursor-pointer list-none font-display text-base font-bold text-ink marker:hidden">
                  <span className="flex items-center justify-between">
                    {f.q}
                    <span className="text-xl text-ink-muted transition-transform group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{f.a}</p>
              </details>
            ))}
          </div>
        </Container>
      </div>
      <Footer />
    </main>
  );
}

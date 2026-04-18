import Link from "next/link";
import { ArrowLeft, Sparkles, Users2, TrendingUp, Shield } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Container } from "@/components/ui/container";

export default function AboutPage() {
  return (
    <main>
      <Navbar />
      <div className="pt-24 md:pt-28">
        <Container className="max-w-4xl">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-brand-700">
            <ArrowLeft className="h-4 w-4" />
            กลับหน้าแรก
          </Link>

          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200/60 bg-brand-50/60 px-3 py-1 text-xs font-semibold text-brand-800">
              <Sparkles className="h-3.5 w-3.5" />
              เกี่ยวกับ Estate AI
            </div>
            <h1 className="mt-4 font-display text-display-md font-bold text-ink">
              เทคโนโลยีที่เข้าใจคุณ<br />ในการหาบ้าน
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-muted">
              เราเชื่อว่าการหาบ้านควรเริ่มจาก "สิ่งที่คุณต้องการ" ไม่ใช่ filter ที่คุณต้องกดทีละช่อง
              AI ของเราตีความภาษาไทยธรรมชาติและแนะนำทรัพย์ที่ตรงใจจริง
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { Icon: Users2, title: "12,000+ ผู้ใช้", desc: "คนไทยที่ไว้วางใจให้เราช่วยหาบ้าน" },
              { Icon: TrendingUp, title: "8,000+ ประกาศ", desc: "จาก Agent ที่ผ่านการยืนยันตัวตน" },
              { Icon: Shield, title: "ยืนยันก่อนเผยแพร่", desc: "ทุกประกาศผ่านการตรวจสอบโดย admin" },
            ].map((x) => (
              <div key={x.title} className="rounded-2xl border border-line bg-white p-6 shadow-soft">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <x.Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-ink">{x.title}</h3>
                <p className="mt-1 text-sm text-ink-muted">{x.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-3xl bg-gradient-brand p-8 text-center text-white md:p-12">
            <h2 className="font-display text-2xl font-bold md:text-3xl">พร้อมเริ่มค้นหาหรือยัง?</h2>
            <p className="mt-2 text-white/85">ลอง AI Search ของเรา — ฟรี ไม่ต้องสมัครสมาชิก</p>
            <Link
              href="/search"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-800 shadow-lift hover:shadow-glow"
            >
              เริ่มค้นหา →
            </Link>
          </div>
        </Container>
      </div>
      <Footer />
    </main>
  );
}

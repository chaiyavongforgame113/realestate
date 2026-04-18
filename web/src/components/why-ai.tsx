"use client";

import { MessageSquareText, Scale, Target } from "lucide-react";
import { motion } from "framer-motion";
import { Container } from "./ui/container";

const features = [
  {
    num: "01",
    icon: MessageSquareText,
    title: "ค้นด้วยภาษาธรรมชาติ",
    desc: "พิมพ์เป็นประโยคไทยปกติ เช่น 'คอนโดใกล้ BTS ไม่เกิน 3 ล้าน' ระบบเข้าใจทันที — ไม่ต้องกดเลือก filter ทีละช่อง",
  },
  {
    num: "02",
    icon: Scale,
    title: "AI เปรียบเทียบให้อัตโนมัติ",
    desc: "เลือกทรัพย์ 2-5 รายการ AI จะสรุปว่าอันไหนเหมาะกับคุณที่สุดพร้อมจุดแข็ง-จุดอ่อน และคะแนนความเข้ากัน",
  },
  {
    num: "03",
    icon: Target,
    title: "แนะนำตรงใจที่สุด",
    desc: "ทุก listing จะมี 'ทำไมตรงกับคุณ' บอกเหตุผลที่ match กับความต้องการ ไม่ใช่แค่แสดงผลลัพธ์สุ่ม",
  },
];

export function WhyAI() {
  return (
    <section id="why-ai" className="relative overflow-hidden py-16 md:py-24">
      {/* Decorative gradient ring */}
      <div
        aria-hidden
        className="absolute -right-20 top-1/2 -z-10 h-80 w-80 -translate-y-1/2 rounded-full bg-gradient-brand opacity-10 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -left-20 bottom-0 -z-10 h-72 w-72 rounded-full bg-accent-300 opacity-20 blur-3xl"
      />

      <Container>
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">
            ทำไมต้อง Estate AI
          </p>
          <h2 className="mt-2 font-display text-display-md font-bold text-ink">
            เทคโนโลยีที่เข้าใจคุณ มากกว่า filter ธรรมดา
          </h2>
          <p className="mt-3 text-ink-muted">
            เราไม่ได้แค่จัดเรียงรายการให้ — เราเข้าใจสิ่งที่คุณกำลังมองหาจริงๆ
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.num}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="group relative overflow-hidden rounded-3xl border border-line bg-white p-8 transition-all hover:border-brand-300 hover:shadow-lift"
            >
              {/* Big stroke number */}
              <div
                className="pointer-events-none absolute -right-2 -top-3 font-display text-[120px] font-black leading-none text-transparent transition-all duration-500 group-hover:scale-110"
                style={{
                  WebkitTextStroke: "1.5px rgba(185, 28, 28, 0.08)",
                }}
              >
                {f.num}
              </div>

              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 transition-all duration-500 group-hover:bg-gradient-brand group-hover:text-white">
                  <f.icon className="h-7 w-7" strokeWidth={1.75} />
                </div>

                <h3 className="mt-6 font-display text-xl font-bold text-ink">{f.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">{f.desc}</p>

                <div className="mt-6 flex items-center gap-1 text-sm font-semibold text-brand-700">
                  <span className="h-px w-8 bg-brand-600 transition-all group-hover:w-12" />
                  เรียนรู้เพิ่ม
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}

import Link from "next/link";
import { Home, Sparkles, Facebook, Instagram, Youtube, Mail } from "lucide-react";
import { Container } from "./ui/container";

const columns: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "ผลิตภัณฑ์",
    links: [
      { label: "ซื้ออสังหาฯ", href: "/search?listing_type=sale" },
      { label: "เช่าอสังหาฯ", href: "/search?listing_type=rent" },
      { label: "โครงการใหม่", href: "/search" },
      { label: "เปรียบเทียบทรัพย์", href: "/compare" },
      { label: "AI Search", href: "/search" },
    ],
  },
  {
    title: "สำหรับ Agent",
    links: [
      { label: "สมัครเป็น Agent", href: "/become-agent" },
      { label: "แพ็กเกจลงประกาศ", href: "/agent/promote" },
      { label: "Agent Login", href: "/login" },
      { label: "Dashboard", href: "/agent" },
    ],
  },
  {
    title: "บริษัท",
    links: [
      { label: "เกี่ยวกับเรา", href: "/about" },
      { label: "ศูนย์ช่วยเหลือ", href: "/help" },
      { label: "ติดต่อ", href: "/contact" },
    ],
  },
  {
    title: "ข้อกำหนด",
    links: [
      { label: "นโยบายความเป็นส่วนตัว", href: "/privacy" },
      { label: "เงื่อนไขการใช้งาน", href: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink text-white/70">
      {/* Top wave */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-brand" />

      <Container className="py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand">
                  <Home className="h-5 w-5 text-white" strokeWidth={2.5} />
                </div>
                <Sparkles className="absolute -right-1 -top-1 h-3.5 w-3.5 text-accent-400" />
              </div>
              <div>
                <div className="font-display text-xl font-bold text-white">Estate</div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-400">
                  AI Powered
                </div>
              </div>
            </div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed">
              แพลตฟอร์มอสังหาริมทรัพย์ที่ใช้ AI ช่วยให้คุณหาบ้านที่ตรงใจ
              โดยเข้าใจความต้องการที่แท้จริงของคุณ
            </p>

            <div className="mt-6 flex items-center gap-3">
              {[Facebook, Instagram, Youtube, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/70 transition-all hover:bg-brand-600 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-sm font-semibold uppercase tracking-widest text-white">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 transition-colors hover:text-accent-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/50 md:flex-row md:items-center md:justify-between">
          <div>© {new Date().getFullYear()} Estate AI · สงวนสิทธิ์ทุกประการ</div>
          <div>Crafted with care · Made in Thailand 🇹🇭</div>
        </div>
      </Container>
    </footer>
  );
}

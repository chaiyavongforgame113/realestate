import { WifiOff, RefreshCcw, Bookmark } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "ออฟไลน์ — Estate AI" };

export default function OfflinePage() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6 py-16">
      <div className="glass-card w-full max-w-md p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-accent-500 text-white shadow-soft">
          <WifiOff className="h-7 w-7" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold text-ink">
          คุณกำลังออฟไลน์
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          ไม่มีสัญญาณอินเทอร์เน็ต — คุณยังดูหน้าที่เคยเปิดไว้แล้วได้
          และรายการโปรดที่บันทึกจะซิงค์อัตโนมัติเมื่อออนไลน์อีกครั้ง
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            href="/favorites"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-semibold text-ink hover:bg-surface-sunken"
          >
            <Bookmark className="h-4 w-4" />
            รายการโปรด
          </Link>
          <a
            href="/"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 text-sm font-semibold text-white hover:bg-brand-800"
          >
            <RefreshCcw className="h-4 w-4" />
            ลองใหม่
          </a>
        </div>
      </div>
    </main>
  );
}

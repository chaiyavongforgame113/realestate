import Link from "next/link";
import { Home, Sparkles } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-gradient-mesh">
      <div className="absolute inset-0 grid-bg opacity-60" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-6 py-10">
        <Link href="/" className="group mx-auto flex items-center gap-2">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand shadow-soft transition-transform group-hover:rotate-[-6deg]">
              <Home className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <Sparkles className="absolute -right-1 -top-1 h-3.5 w-3.5 text-accent-500" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-lg font-bold text-ink">Estate</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-700">
              AI Powered
            </span>
          </div>
        </Link>

        <div className="mt-10 flex-1">{children}</div>

        <p className="mt-8 text-center text-xs text-ink-muted">
          © {new Date().getFullYear()} Estate AI · การสมัครยอมรับ{" "}
          <Link href="/terms" className="underline hover:text-brand-700">
            เงื่อนไขการใช้งาน
          </Link>
        </p>
      </div>
    </main>
  );
}

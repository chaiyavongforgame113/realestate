"use client";

import Link from "next/link";
import { Home, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-mesh px-6">
      <div aria-hidden className="absolute inset-0 grid-bg opacity-60" />

      <div className="relative z-10 mx-auto max-w-lg text-center">
        <div className="relative inline-block">
          <h1 className="font-display text-[140px] font-black leading-none text-gradient-brand md:text-[200px]">
            404
          </h1>
          <div aria-hidden className="absolute inset-0 blur-3xl opacity-40 bg-gradient-brand -z-10" />
        </div>

        <h2 className="mt-4 font-display text-2xl font-bold text-ink md:text-3xl">
          ไม่พบหน้านี้
        </h2>
        <p className="mt-2 text-ink-muted">
          หน้าที่คุณกำลังมองหาอาจถูกย้าย ลบ หรือยังไม่เคยมีอยู่
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <Link href="/">
            <Button variant="primary" size="md">
              <Home className="h-4 w-4" />
              กลับหน้าแรก
            </Button>
          </Link>
          <Link href="/search">
            <Button variant="outline" size="md">
              <Search className="h-4 w-4" />
              ค้นหาทรัพย์
            </Button>
          </Link>
        </div>

        <button
          onClick={() => history.back()}
          className="mt-6 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" />
          ย้อนกลับ
        </button>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Bookmark, Lock, Globe, Loader2 } from "lucide-react";

type Board = {
  id: string;
  name: string;
  coverUrl: string | null;
  isPrivate: boolean;
  items: { id: string; listingId: string }[];
  updatedAt: string;
};

export function WishlistBoardsGrid() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/wishlist/boards");
      if (res.status === 401) {
        window.location.href = "/login?redirect=/favorites";
        return;
      }
      const data = await res.json();
      setBoards(data.boards ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create() {
    if (!name.trim() || creating) return;
    setCreating(true);
    try {
      const res = await fetch("/api/wishlist/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), isPrivate }),
      });
      if (res.ok) {
        setName("");
        setShowNew(false);
        await load();
      }
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-8 text-ink-muted">
        <Loader2 className="h-4 w-4 animate-spin" /> กำลังโหลด Wishlist...
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-display-md font-bold text-ink">บอร์ดของคุณ</h2>
          <p className="mt-1 text-sm text-ink-muted">
            จัดกลุ่มทรัพย์ที่ถูกใจไว้เป็นหมวดหมู่ เหมือนบอร์ดบน Pinterest
          </p>
        </div>
        <button
          onClick={() => setShowNew((v) => !v)}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-brand-700 px-4 text-sm font-semibold text-white shadow-soft hover:bg-brand-800"
        >
          <Plus className="h-4 w-4" />
          สร้างบอร์ด
        </button>
      </div>

      {showNew && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl border border-line bg-surface p-4"
        >
          <input
            placeholder="ชื่อบอร์ด เช่น 'บ้านในฝัน' หรือ 'ลงทุน'"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-line bg-surface-soft px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
          <label className="mt-2 inline-flex items-center gap-2 text-xs text-ink-muted">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="accent-brand-600"
            />
            บอร์ดส่วนตัว (ไม่แชร์ให้ผู้อื่น)
          </label>
          <div className="mt-3 flex justify-end gap-2">
            <button
              onClick={() => setShowNew(false)}
              className="rounded-lg px-3 py-2 text-sm text-ink-muted hover:bg-surface-sunken"
            >
              ยกเลิก
            </button>
            <button
              onClick={create}
              disabled={!name.trim() || creating}
              className="inline-flex h-9 items-center gap-1 rounded-lg bg-brand-700 px-3 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
            >
              {creating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              สร้าง
            </button>
          </div>
        </motion.div>
      )}

      {boards.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-surface/60 p-10 text-center">
          <Bookmark className="mx-auto h-10 w-10 text-ink-subtle" />
          <div className="mt-3 font-display text-lg font-semibold text-ink">
            ยังไม่มีบอร์ด
          </div>
          <div className="mt-1 text-sm text-ink-muted">
            สร้างบอร์ดแรกเพื่อเก็บทรัพย์ที่คุณสนใจ
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
          {boards.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={`/favorites/${b.id}`}
                className="group block overflow-hidden rounded-2xl border border-line bg-surface shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift"
              >
                <div className="relative aspect-[16/10] bg-gradient-mesh dark:bg-gradient-mesh-dark">
                  {b.coverUrl && (
                    <Image
                      src={b.coverUrl}
                      alt={b.name}
                      fill
                      sizes="(min-width: 1024px) 33vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-ink/75 via-ink/20 to-transparent p-3">
                    <div className="text-white">
                      <div className="font-display text-lg font-bold">{b.name}</div>
                      <div className="text-xs opacity-80">
                        {b.items.length} รายการ
                      </div>
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-white/15 px-2 py-1 text-[11px] text-white backdrop-blur">
                      {b.isPrivate ? (
                        <>
                          <Lock className="h-3 w-3" /> ส่วนตัว
                        </>
                      ) : (
                        <>
                          <Globe className="h-3 w-3" /> สาธารณะ
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

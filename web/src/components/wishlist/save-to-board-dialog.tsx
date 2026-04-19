"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, Check, Loader2, Lock, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";

type Board = {
  id: string;
  name: string;
  isPrivate: boolean;
  items: { id: string; listingId: string }[];
};

type Props = {
  open: boolean;
  listingId: string;
  onClose: () => void;
  onSaved?: (boardIds: string[]) => void;
};

export function SaveToBoardDialog({ open, listingId, onClose, onSaved }: Props) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [saved, setSaved] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/wishlist/boards")
      .then(async (res) => {
        if (res.status === 401) {
          window.location.href =
            "/login?redirect=" + encodeURIComponent(window.location.pathname);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        const list: Board[] = data.boards ?? [];
        setBoards(list);
        const already = new Set<string>();
        for (const b of list) {
          if (b.items?.some((it) => it.listingId === listingId)) already.add(b.id);
        }
        setSaved(already);
      })
      .finally(() => setLoading(false));
  }, [open, listingId]);

  async function toggleSave(boardId: string) {
    const already = saved.has(boardId);
    setSavingId(boardId);
    try {
      if (already) {
        const res = await fetch(
          `/api/wishlist/items?boardId=${encodeURIComponent(
            boardId
          )}&listingId=${encodeURIComponent(listingId)}`,
          { method: "DELETE" }
        );
        if (res.ok) {
          const next = new Set(saved);
          next.delete(boardId);
          setSaved(next);
        }
      } else {
        const res = await fetch("/api/wishlist/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ boardId, listingId }),
        });
        if (res.ok) {
          const next = new Set(saved);
          next.add(boardId);
          setSaved(next);
        }
      }
      onSaved?.(Array.from(saved));
    } finally {
      setSavingId(null);
    }
  }

  async function createBoard() {
    if (!newName.trim() || creating) return;
    setCreating(true);
    try {
      const res = await fetch("/api/wishlist/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), isPrivate: false }),
      });
      if (res.ok) {
        const data = await res.json();
        const board: Board = { ...data.board, items: [] };
        setBoards((prev) => [board, ...prev]);
        setNewName("");
        setShowNew(false);
        // Auto-save to the new board
        await toggleSave(board.id);
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="glass-card relative w-full max-w-md overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <div className="flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-brand-700" />
                <h3 className="font-display text-base font-semibold text-ink">
                  บันทึกลงบอร์ด
                </h3>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-1 text-ink-muted hover:bg-surface-sunken hover:text-ink"
                aria-label="ปิด"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto px-3 py-3">
              {loading ? (
                <div className="flex items-center gap-2 px-2 py-8 text-sm text-ink-muted">
                  <Loader2 className="h-4 w-4 animate-spin" /> กำลังโหลด...
                </div>
              ) : boards.length === 0 && !showNew ? (
                <div className="rounded-xl border border-dashed border-line p-6 text-center">
                  <Bookmark className="mx-auto h-8 w-8 text-ink-subtle" />
                  <div className="mt-2 text-sm text-ink-muted">
                    คุณยังไม่มีบอร์ด — สร้างบอร์ดแรกเลย
                  </div>
                  <button
                    onClick={() => setShowNew(true)}
                    className="mt-3 inline-flex h-9 items-center gap-1 rounded-lg bg-brand-700 px-3 text-sm font-semibold text-white hover:bg-brand-800"
                  >
                    <Plus className="h-4 w-4" /> สร้างบอร์ด
                  </button>
                </div>
              ) : (
                <ul className="space-y-1">
                  {boards.map((b) => {
                    const isSaved = saved.has(b.id);
                    return (
                      <li key={b.id}>
                        <button
                          onClick={() => toggleSave(b.id)}
                          disabled={savingId === b.id}
                          className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-surface-sunken disabled:opacity-60"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={
                                "flex h-9 w-9 items-center justify-center rounded-lg " +
                                (isSaved
                                  ? "bg-brand-100 text-brand-800 dark:bg-brand-900/50 dark:text-brand-100"
                                  : "bg-surface-sunken text-ink-muted")
                              }
                            >
                              <Bookmark className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                                {b.name}
                                {b.isPrivate && (
                                  <Lock className="h-3 w-3 text-ink-subtle" />
                                )}
                              </div>
                              <div className="text-xs text-ink-muted">
                                {b.items.length} รายการ
                              </div>
                            </div>
                          </div>
                          {savingId === b.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-ink-muted" />
                          ) : isSaved ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                              <Check className="h-3 w-3" /> บันทึกแล้ว
                            </span>
                          ) : (
                            <span className="text-[11px] font-medium text-brand-700">
                              บันทึก
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {showNew ? (
                <div className="mt-3 rounded-xl border border-line bg-surface-soft p-3">
                  <input
                    autoFocus
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="ชื่อบอร์ดใหม่"
                    className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                  />
                  <div className="mt-2 flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setShowNew(false);
                        setNewName("");
                      }}
                      className="rounded-lg px-3 py-1.5 text-xs text-ink-muted hover:bg-surface-sunken"
                    >
                      ยกเลิก
                    </button>
                    <button
                      onClick={createBoard}
                      disabled={!newName.trim() || creating}
                      className="inline-flex h-8 items-center gap-1 rounded-lg bg-brand-700 px-3 text-xs font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
                    >
                      {creating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      สร้างและบันทึก
                    </button>
                  </div>
                </div>
              ) : boards.length > 0 ? (
                <button
                  onClick={() => setShowNew(true)}
                  className="mt-2 flex w-full items-center gap-2 rounded-xl border border-dashed border-line px-3 py-2.5 text-sm text-ink-muted transition-colors hover:border-brand-400 hover:bg-brand-50/40 hover:text-brand-800"
                >
                  <Plus className="h-4 w-4" />
                  สร้างบอร์ดใหม่
                </button>
              ) : null}
            </div>

            <div className="border-t border-line bg-surface-soft px-5 py-2.5 text-center">
              <span className="text-[11px] text-ink-subtle">
                บอร์ดช่วยจัดกลุ่มทรัพย์ที่สนใจ เหมือน Pinterest
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

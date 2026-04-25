"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Bookmark, Globe, Lock, MoreVertical, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { formatPrice } from "@/lib/utils";

interface BoardItemListing {
  id: string;
  title: string;
  price: number;
  priceUnit: string;
  coverImageUrl: string | null;
  district: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  usableArea: number | null;
}

interface BoardItem {
  id: string;
  listingId: string;
  note: string | null;
  addedAt: string;
  listing: BoardItemListing | null;
}

interface Board {
  id: string;
  name: string;
  isPrivate: boolean;
  coverUrl: string | null;
  items: BoardItem[];
  updatedAt: string;
}

export default function BoardDetailPage() {
  const params = useParams<{ boardId: string }>();
  const router = useRouter();
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPrivate, setEditPrivate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/wishlist/boards/${params.boardId}`);
    if (res.status === 404) {
      router.replace("/favorites");
      return;
    }
    if (res.status === 401) {
      window.location.href = `/login?redirect=/favorites/${params.boardId}`;
      return;
    }
    const data = await res.json();
    setBoard(data.board);
    setEditName(data.board?.name ?? "");
    setEditPrivate(data.board?.isPrivate ?? false);
    setLoading(false);
  }

  useEffect(() => {
    if (params.boardId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.boardId]);

  async function saveEdits() {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/wishlist/boards/${params.boardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim(), isPrivate: editPrivate }),
      });
      if (res.ok) {
        setEditing(false);
        await load();
      }
    } finally {
      setSaving(false);
    }
  }

  async function deleteBoard() {
    const res = await fetch(`/api/wishlist/boards/${params.boardId}`, { method: "DELETE" });
    if (res.ok) router.replace("/favorites");
  }

  async function removeItem(boardId: string, listingId: string) {
    const res = await fetch(
      `/api/wishlist/items?boardId=${encodeURIComponent(boardId)}&listingId=${encodeURIComponent(listingId)}`,
      { method: "DELETE" }
    );
    if (res.ok) await load();
  }

  if (loading) {
    return (
      <div className="py-16 text-center text-sm text-ink-muted">
        <Loader2 className="mx-auto h-5 w-5 animate-spin" /> กำลังโหลด...
      </div>
    );
  }

  if (!board) return null;

  return (
    <div>
      <Link
        href="/favorites"
        className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-ink-muted hover:text-brand-700"
      >
        <ArrowLeft className="h-4 w-4" />
        ทุกบอร์ด
      </Link>

      <PageHeader
        title={board.name}
        description={`${board.items.length} ทรัพย์ · ${board.isPrivate ? "ส่วนตัว" : "สาธารณะ"}`}
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditing(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-sm font-medium text-ink-muted shadow-soft hover:border-brand-300 hover:text-brand-700"
            >
              <Pencil className="h-3.5 w-3.5" />
              แก้ไข
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-sm font-medium text-ink-muted shadow-soft hover:border-red-300 hover:text-red-700"
            >
              <Trash2 className="h-3.5 w-3.5" />
              ลบบอร์ด
            </button>
          </div>
        }
      />

      {board.items.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="บอร์ดว่างเปล่า"
          description="เพิ่มทรัพย์เข้าบอร์ดด้วยปุ่ม Bookmark บนการ์ดทรัพย์"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {board.items.map((it) => (
            <div
              key={it.id}
              className="group relative overflow-hidden rounded-2xl border border-line bg-white shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift"
            >
              {it.listing ? (
                <>
                  <Link href={`/listing/${it.listing.id}`} className="block">
                    <div className="relative aspect-[4/3] overflow-hidden bg-surface-sunken">
                      {it.listing.coverImageUrl && (
                        <Image
                          src={it.listing.coverImageUrl}
                          alt={it.listing.title}
                          fill
                          sizes="(min-width:1024px) 33vw, 100vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <div className="font-display text-lg font-bold text-ink">
                        {formatPrice(it.listing.price, it.listing.priceUnit as "total" | "per_month")}
                      </div>
                      <div className="mt-1 line-clamp-1 text-sm text-ink-soft">{it.listing.title}</div>
                      <div className="mt-2 text-xs text-ink-muted">{it.listing.district}</div>
                    </div>
                  </Link>
                  <button
                    onClick={() => removeItem(board.id, it.listingId)}
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-ink-muted shadow-soft transition-all hover:bg-red-50 hover:text-red-600"
                    aria-label="ลบออกจากบอร์ด"
                    title="ลบออกจากบอร์ด"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <div className="p-6 text-center text-sm text-ink-muted">ทรัพย์ถูกลบ</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm"
          onClick={() => !saving && setEditing(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-line bg-white p-5 shadow-lift"
          >
            <h3 className="font-display text-base font-bold text-ink">แก้ไขบอร์ด</h3>
            <label className="mt-4 block text-xs font-medium text-ink-muted">ชื่อบอร์ด</label>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              autoFocus
              maxLength={80}
              className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            <label className="mt-3 inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editPrivate}
                onChange={(e) => setEditPrivate(e.target.checked)}
                className="accent-brand-600"
              />
              <Lock className="h-4 w-4 text-ink-muted" />
              บอร์ดส่วนตัว
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setEditing(false)}
                disabled={saving}
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink-muted hover:bg-surface-sunken disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={saveEdits}
                disabled={!editName.trim() || saving}
                className="inline-flex h-9 items-center gap-1 rounded-lg bg-brand-700 px-3 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50"
              >
                {saving ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm"
          onClick={() => setConfirmDelete(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-line bg-white p-5 shadow-lift"
          >
            <h3 className="font-display text-base font-bold text-ink">ลบบอร์ดนี้?</h3>
            <p className="mt-2 text-sm text-ink-muted">
              ทรัพย์ที่อยู่ในบอร์ด {board.items.length} รายการจะถูกลบออก ทรัพย์ตัวจริงจะไม่ได้รับผลกระทบ
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink-muted hover:bg-surface-sunken"
              >
                ยกเลิก
              </button>
              <button
                onClick={deleteBoard}
                className="inline-flex h-9 items-center gap-1 rounded-lg bg-red-600 px-3 text-sm font-semibold text-white hover:bg-red-700"
              >
                ลบบอร์ด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

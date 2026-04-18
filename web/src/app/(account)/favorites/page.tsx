"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Search } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ListingCard } from "@/components/listing-card";
import { Button } from "@/components/ui/button";
import { toCardView } from "@/lib/listings/adapter";
import type { ListingDTO } from "@/lib/listings/transform";
import type { SampleListing } from "@/lib/sample-data";
import { WishlistBoardsGrid } from "@/components/wishlist/boards-grid";
import { PushToggle } from "@/components/push/push-toggle";

export default function FavoritesPage() {
  const [items, setItems] = useState<SampleListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/favorites")
      .then((r) => (r.ok ? r.json() : { favorites: [] }))
      .then((data: { favorites: { listing: ListingDTO }[] }) => {
        setItems(data.favorites.map((f) => toCardView(f.listing)));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        title="Favorites"
        description={`${items.length} ทรัพย์ที่คุณบันทึกไว้`}
        action={
          <Link href="/search">
            <Button variant="outline" size="md">
              <Search className="h-4 w-4" />
              ค้นหาเพิ่ม
            </Button>
          </Link>
        }
      />

      <PushToggle variant="hero" className="mb-6" />

      <section className="mb-10">
        <WishlistBoardsGrid />
      </section>

      <section>
        <h2 className="mb-3 font-display text-display-md font-bold text-ink">
          ทรัพย์ที่ถูกใจ
        </h2>
        {loading ? (
          <div className="py-10 text-center text-sm text-ink-muted">กำลังโหลด...</div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="ยังไม่มี Favorites"
            description="กดปุ่มหัวใจบนประกาศเพื่อบันทึกไว้ดูภายหลัง"
            action={
              <Link href="/search">
                <Button variant="primary" size="md">
                  เริ่มค้นหา
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((l, i) => (
              <ListingCard key={l.id} listing={l} index={i} initialLiked />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

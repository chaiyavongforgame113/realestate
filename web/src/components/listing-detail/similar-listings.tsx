"use client";

import { useEffect, useState } from "react";
import { ListingCard } from "../listing-card";
import type { ListingDTO } from "@/lib/listings/transform";
import type { SampleListing } from "@/lib/sample-data";
import { toCardView } from "@/lib/listings/adapter";

export function SimilarListings({ currentId }: { currentId: string }) {
  const [items, setItems] = useState<SampleListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/listings/${currentId}/similar`)
      .then((r) => r.json())
      .then((data: { listings?: ListingDTO[] }) => {
        setItems((data.listings ?? []).map(toCardView));
      })
      .finally(() => setLoading(false));
  }, [currentId]);

  if (!loading && items.length === 0) return null;

  return (
    <section className="relative z-0 isolate py-16">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">
            ทรัพย์ใกล้เคียง
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold text-ink md:text-3xl">
            คุณอาจสนใจ
          </h2>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-96 animate-pulse rounded-2xl bg-surface-sunken" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((l, i) => (
            <ListingCard key={l.id} listing={l} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}

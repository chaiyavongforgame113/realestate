import Image from "next/image";
import { BadgeCheck, Star, Phone, MessageCircle } from "lucide-react";
import type { SampleListing } from "@/lib/sample-data";

export function AgentCard({ listing }: { listing: SampleListing }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-soft">
      <div className="flex items-start gap-3">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-brand-100">
          <Image
            src={listing.agent.avatar}
            alt={listing.agent.name}
            fill
            sizes="56px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 font-display text-base font-bold text-ink">
            {listing.agent.name}
            <BadgeCheck className="h-4 w-4 text-brand-600" />
          </div>
          <div className="text-xs text-ink-muted">Agent ยืนยันตัวตน · 4 ปี</div>
          <div className="mt-1 flex items-center gap-1 text-xs">
            <Star className="h-3.5 w-3.5 fill-accent-400 text-accent-400" />
            <span className="font-semibold text-ink">4.8</span>
            <span className="text-ink-muted">(234 รีวิว)</span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-line bg-white text-sm font-semibold text-ink shadow-soft transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800">
          <Phone className="h-4 w-4" />
          โทร
        </button>
        <button className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-brand-700 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-brand-800">
          <MessageCircle className="h-4 w-4" />
          แชท
        </button>
      </div>
    </div>
  );
}

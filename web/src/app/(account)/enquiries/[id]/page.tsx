"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Phone, Mail, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusChip, type StatusKind } from "@/components/dashboard/status-chip";
import { ConversationThread } from "@/components/enquiry/conversation-thread";
import { formatPrice } from "@/lib/utils";

type Enquiry = {
  id: string;
  status: Extract<StatusKind, "new" | "contacted" | "viewing_scheduled" | "negotiating" | "won" | "lost" | "spam">;
  message: string;
  createdAt: string;
  updatedAt: string;
  listing: {
    id: string;
    title: string;
    price: number;
    priceUnit: string;
    coverImageUrl: string;
  } | null;
  agent: { name: string; avatar: string | null; phone: string | null; email: string } | null;
  viewerRole: "user" | "agent";
};

export default function EnquiryDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/enquiries/${params.id}`)
      .then((res) => {
        if (res.status === 404 || res.status === 403) {
          router.replace("/enquiries");
          return null;
        }
        if (res.status === 401) {
          window.location.href = `/login?redirect=/enquiries/${params.id}`;
          return null;
        }
        return res.ok ? res.json() : null;
      })
      .then((data) => data?.enquiry && setEnquiry(data.enquiry))
      .finally(() => setLoading(false));
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="py-16 text-center text-sm text-ink-muted">
        <Loader2 className="mx-auto h-5 w-5 animate-spin" /> กำลังโหลด...
      </div>
    );
  }

  if (!enquiry) return null;

  return (
    <div>
      <Link
        href="/enquiries"
        className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-ink-muted hover:text-brand-700"
      >
        <ArrowLeft className="h-4 w-4" />
        ทั้งหมด
      </Link>

      <PageHeader
        title="บทสนทนา"
        description={`เริ่มเมื่อ ${new Date(enquiry.createdAt).toLocaleString("th-TH")}`}
        action={<StatusChip status={enquiry.status} />}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
        {/* Thread */}
        <div>
          {/* Original message */}
          <div className="mb-3 rounded-xl border border-line bg-surface-soft/40 p-4">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-ink-muted">
              ข้อความเริ่มต้น
            </div>
            <p className="mt-1 text-sm italic text-ink-soft">"{enquiry.message}"</p>
          </div>

          <ConversationThread enquiryId={enquiry.id} viewerRole={enquiry.viewerRole} />
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          {enquiry.listing && (
            <Link
              href={`/listing/${enquiry.listing.id}`}
              className="block overflow-hidden rounded-xl border border-line bg-white shadow-soft hover:shadow-lift"
            >
              <div className="relative aspect-[16/10] bg-surface-sunken">
                {enquiry.listing.coverImageUrl && (
                  <Image
                    src={enquiry.listing.coverImageUrl}
                    alt={enquiry.listing.title}
                    fill
                    sizes="320px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="p-3">
                <div className="text-[11px] uppercase tracking-widest text-ink-muted">ทรัพย์ที่สนใจ</div>
                <div className="mt-0.5 line-clamp-2 text-sm font-semibold text-ink">
                  {enquiry.listing.title}
                </div>
                <div className="mt-1 font-display text-sm font-bold text-brand-700">
                  {formatPrice(enquiry.listing.price, enquiry.listing.priceUnit as "total" | "per_month")}
                </div>
              </div>
            </Link>
          )}

          {enquiry.agent && (
            <div className="rounded-xl border border-line bg-white p-4 shadow-soft">
              <div className="text-[11px] uppercase tracking-widest text-ink-muted">Agent</div>
              <div className="mt-2 flex items-center gap-2">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gradient-brand">
                  {enquiry.agent.avatar && (
                    <Image src={enquiry.agent.avatar} alt={enquiry.agent.name} fill sizes="40px" className="object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-ink">{enquiry.agent.name}</div>
                </div>
              </div>
              <div className="mt-3 flex flex-col gap-1.5">
                {enquiry.agent.phone && (
                  <a
                    href={`tel:${enquiry.agent.phone}`}
                    className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-brand-700"
                  >
                    <Phone className="h-3 w-3" />
                    {enquiry.agent.phone}
                  </a>
                )}
                <a
                  href={`mailto:${enquiry.agent.email}`}
                  className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-brand-700"
                >
                  <Mail className="h-3 w-3" />
                  {enquiry.agent.email}
                </a>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

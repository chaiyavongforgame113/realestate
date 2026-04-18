import { cn } from "@/lib/utils";

export type StatusKind =
  | "draft"
  | "pending_review"
  | "published"
  | "rejected"
  | "revision_requested"
  | "unavailable"
  | "sold"
  | "rented"
  | "new"
  | "contacted"
  | "viewing_scheduled"
  | "negotiating"
  | "won"
  | "lost"
  | "spam"
  | "approved"
  | "info_requested"
  | "active"
  | "suspended";

const config: Record<StatusKind, { label: string; cls: string; dot: string }> = {
  draft: { label: "ฉบับร่าง", cls: "bg-surface-sunken text-ink-muted", dot: "bg-ink-subtle" },
  pending_review: { label: "รอพิจารณา", cls: "bg-accent-50 text-accent-900", dot: "bg-accent-500" },
  published: { label: "เผยแพร่", cls: "bg-brand-50 text-brand-800", dot: "bg-brand-500" },
  rejected: { label: "ปฏิเสธ", cls: "bg-red-50 text-red-700", dot: "bg-red-500" },
  revision_requested: { label: "ขอแก้ไข", cls: "bg-amber-50 text-amber-900", dot: "bg-amber-500" },
  unavailable: { label: "ปิดชั่วคราว", cls: "bg-surface-sunken text-ink-muted", dot: "bg-ink-subtle" },
  sold: { label: "ขายแล้ว", cls: "bg-ink text-white", dot: "bg-white" },
  rented: { label: "ปล่อยเช่าแล้ว", cls: "bg-ink text-white", dot: "bg-white" },
  new: { label: "ใหม่", cls: "bg-brand-50 text-brand-800", dot: "bg-brand-600" },
  contacted: { label: "ติดต่อแล้ว", cls: "bg-sky-50 text-sky-800", dot: "bg-sky-500" },
  viewing_scheduled: { label: "นัดดู", cls: "bg-purple-50 text-purple-800", dot: "bg-purple-500" },
  negotiating: { label: "ต่อรอง", cls: "bg-accent-50 text-accent-900", dot: "bg-accent-500" },
  won: { label: "ปิดดีลสำเร็จ", cls: "bg-emerald-50 text-emerald-800", dot: "bg-emerald-500" },
  lost: { label: "ไม่สำเร็จ", cls: "bg-surface-sunken text-ink-muted", dot: "bg-ink-subtle" },
  spam: { label: "สแปม", cls: "bg-red-50 text-red-700", dot: "bg-red-500" },
  approved: { label: "อนุมัติ", cls: "bg-brand-50 text-brand-800", dot: "bg-brand-500" },
  info_requested: { label: "ขอข้อมูลเพิ่ม", cls: "bg-amber-50 text-amber-900", dot: "bg-amber-500" },
  active: { label: "ใช้งาน", cls: "bg-brand-50 text-brand-800", dot: "bg-brand-500" },
  suspended: { label: "ระงับ", cls: "bg-red-50 text-red-700", dot: "bg-red-500" },
};

export function StatusChip({ status, className }: { status: StatusKind; className?: string }) {
  const c = config[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-transparent px-2.5 py-0.5 text-xs font-medium",
        c.cls,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", c.dot)} />
      {c.label}
    </span>
  );
}

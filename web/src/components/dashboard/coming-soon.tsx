import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "./page-header";

export function ComingSoon({
  icon: Icon,
  title,
  description,
  backHref,
  backLabel = "กลับ",
  features,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  backHref: string;
  backLabel?: string;
  features?: string[];
}) {
  return (
    <div>
      <PageHeader title={title} description="เร็ว ๆ นี้" />

      <div className="mx-auto max-w-xl rounded-3xl border border-line bg-white p-10 text-center shadow-soft">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-brand text-white">
          <Icon className="h-8 w-8" />
        </div>
        <h3 className="mt-5 font-display text-xl font-bold text-ink">{title}</h3>
        <p className="mt-2 text-sm text-ink-muted">{description}</p>

        {features && features.length > 0 && (
          <ul className="mx-auto mt-6 max-w-sm space-y-2 text-left text-sm text-ink-soft">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                {f}
              </li>
            ))}
          </ul>
        )}

        <Link
          href={backHref}
          className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
      </div>
    </div>
  );
}

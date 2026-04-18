import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  change,
  trend,
  icon: Icon,
  accent = "brand",
}: {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "flat";
  icon?: React.ComponentType<{ className?: string }>;
  accent?: "brand" | "accent" | "ink";
}) {
  const accentMap = {
    brand: "bg-brand-50 text-brand-700",
    accent: "bg-accent-50 text-accent-700",
    ink: "bg-ink/5 text-ink",
  };

  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-soft transition-all hover:shadow-lift">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
            {label}
          </p>
          <p className="mt-2 font-display text-2xl font-bold text-ink md:text-3xl">{value}</p>
          {change && (
            <div
              className={cn(
                "mt-1.5 inline-flex items-center gap-1 text-xs font-medium",
                trend === "up" && "text-brand-700",
                trend === "down" && "text-red-600",
                trend === "flat" && "text-ink-muted"
              )}
            >
              {trend === "up" && <TrendingUp className="h-3 w-3" />}
              {trend === "down" && <TrendingDown className="h-3 w-3" />}
              {change}
            </div>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
              accentMap[accent]
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}

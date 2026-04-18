import { cn } from "@/lib/utils";

type Tone = "brand" | "accent" | "neutral" | "sale" | "rent" | "ai";

const tones: Record<Tone, string> = {
  brand: "bg-brand-50 text-brand-800 border-brand-100",
  accent: "bg-accent-50 text-accent-800 border-accent-100",
  neutral: "bg-surface-sunken text-ink-muted border-line",
  sale: "bg-brand-700 text-white border-transparent",
  rent: "bg-ink text-white border-transparent",
  ai: "bg-gradient-to-r from-brand-700 to-accent-500 text-white border-transparent",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

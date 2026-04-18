import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "accent" | "outline" | "ghost" | "dark" | "glass";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-700 text-white hover:bg-brand-800 shadow-soft hover:shadow-lift active:translate-y-px active:scale-[0.98] dark:bg-brand-600 dark:hover:bg-brand-500",
  accent:
    "bg-accent-500 text-ink hover:bg-accent-400 shadow-soft hover:shadow-lift active:translate-y-px active:scale-[0.98] dark:text-ink",
  outline:
    "border border-line bg-surface text-ink hover:border-brand-600 hover:text-brand-700 dark:hover:text-brand-300 active:scale-[0.98]",
  ghost:
    "text-ink-soft hover:bg-surface-sunken hover:text-ink active:scale-[0.98]",
  dark: "bg-ink text-surface hover:bg-ink-soft shadow-soft active:scale-[0.98]",
  glass:
    "glass-card text-ink hover:shadow-lift hover:text-brand-700 dark:hover:text-brand-200 active:scale-[0.98] !rounded-xl border-0 !bg-surface/60",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm rounded-lg",
  md: "h-11 px-5 text-[15px] rounded-xl",
  lg: "h-14 px-7 text-base rounded-2xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "group/btn inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 will-change-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";

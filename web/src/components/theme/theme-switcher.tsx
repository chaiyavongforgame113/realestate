"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Monitor, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme, type Theme } from "./theme-provider";

const OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "สว่าง", icon: Sun },
  { value: "dark", label: "มืด", icon: Moon },
  { value: "system", label: "ตามระบบ", icon: Monitor },
];

/** Compact icon toggle — sun/moon crossfade. Good for navbar. */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, toggle } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "เปลี่ยนเป็นโหมดสว่าง" : "เปลี่ยนเป็นโหมดมืด"}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full",
        "border border-line bg-surface text-ink-soft shadow-soft",
        "transition-all hover:border-brand-300 hover:text-brand-700",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="moon"
            initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
            transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
            className="absolute"
          >
            <Moon className="h-4 w-4 text-accent-400" strokeWidth={2.2} />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
            transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
            className="absolute"
          >
            <Sun className="h-4 w-4 text-accent-500" strokeWidth={2.2} />
          </motion.span>
        )}
      </AnimatePresence>

      {/* subtle radial glow on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 hover:opacity-100"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(245,158,11,0.25), transparent 60%)",
        }}
      />
    </button>
  );
}

/** Full segmented control — light / dark / system. */
export function ThemeSegmented({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [hover, setHover] = useState<Theme | null>(null);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-line bg-surface p-1 shadow-soft",
        className
      )}
      onMouseLeave={() => setHover(null)}
    >
      {OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const active = theme === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTheme(opt.value)}
            onMouseEnter={() => setHover(opt.value)}
            aria-pressed={active}
            className={cn(
              "relative flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors",
              active ? "text-white" : "text-ink-muted hover:text-ink"
            )}
          >
            {active && (
              <motion.span
                layoutId="theme-pill"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="absolute inset-0 -z-[1] rounded-full bg-gradient-brand shadow-soft"
              />
            )}
            <Icon className="h-3.5 w-3.5" />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

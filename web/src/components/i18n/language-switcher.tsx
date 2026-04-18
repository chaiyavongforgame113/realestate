"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Globe, Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n/provider";
import { locales, type Locale } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";

type Props = {
  variant?: "compact" | "full";
  className?: string;
};

export function LanguageSwitcher({ variant = "compact", className }: Props) {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) window.addEventListener("mousedown", onClickOutside);
    return () => window.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const current = locales.find((l) => l.code === locale) ?? locales[0];

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-surface px-3 text-sm font-medium text-ink-soft transition-colors hover:border-brand-300",
          open && "border-brand-400 ring-2 ring-brand-200/60"
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
        title="เลือกภาษา · Language · 语言"
      >
        <Globe className="h-4 w-4" />
        <span>{variant === "full" ? current.native : current.flag}</span>
        {variant === "full" && (
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-line bg-surface p-1 shadow-lift"
          >
            {locales.map((l) => {
              const active = l.code === locale;
              return (
                <li key={l.code}>
                  <button
                    onClick={() => {
                      setLocale(l.code as Locale);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-brand-50 text-brand-800 dark:bg-brand-900/40 dark:text-brand-100"
                        : "text-ink hover:bg-surface-sunken"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base leading-none">{l.flag}</span>
                      <span className="font-medium">{l.native}</span>
                      <span className="text-[11px] text-ink-subtle">{l.label}</span>
                    </span>
                    {active && <Check className="h-3.5 w-3.5" />}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

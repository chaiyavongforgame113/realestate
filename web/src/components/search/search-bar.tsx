"use client";

import { Sparkles, Search, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function SearchBar({
  initial = "",
  onSubmit,
}: {
  initial?: string;
  onSubmit?: (q: string) => void;
}) {
  const [value, setValue] = useState(initial);

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-line bg-white p-1.5 shadow-soft transition-all focus-within:shadow-glow">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-brand text-white">
        <Sparkles className="h-5 w-5" />
      </div>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSubmit?.(value)}
        placeholder="พิมพ์ความต้องการของคุณ เช่น 'คอนโดใกล้ BTS ไม่เกิน 3 ล้าน'"
        className="min-w-0 flex-1 bg-transparent px-2 text-[15px] text-ink placeholder:text-ink-subtle focus:outline-none"
      />
      {value && (
        <button
          onClick={() => setValue("")}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted",
            "hover:bg-surface-sunken hover:text-ink"
          )}
          aria-label="clear"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      <button
        onClick={() => onSubmit?.(value)}
        className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-brand-700 px-4 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-brand-800"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">ค้นหา</span>
      </button>
    </div>
  );
}

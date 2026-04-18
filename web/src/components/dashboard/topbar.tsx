"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationBell } from "../notification-bell";

export function Topbar({
  title,
  subtitle,
  onMenuClick,
  mode = "agent",
}: {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
  mode?: "agent" | "admin";
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const isAdmin = mode === "admin";
  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex h-16 items-center gap-3 border-b px-4 md:px-6 lg:px-8",
        isAdmin
          ? "border-ink-soft/20 bg-ink/95 text-white backdrop-blur-md"
          : "border-line bg-white/95 backdrop-blur-md"
      )}
    >
      <button
        onClick={onMenuClick}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg lg:hidden",
          isAdmin ? "text-white hover:bg-white/10" : "text-ink hover:bg-surface-sunken"
        )}
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className={cn("truncate font-display text-base font-bold md:text-lg", isAdmin ? "text-white" : "text-ink")}>
          {title}
        </h1>
        {subtitle && (
          <p className={cn("truncate text-xs", isAdmin ? "text-white/60" : "text-ink-muted")}>{subtitle}</p>
        )}
      </div>

      <form
        className="hidden items-center gap-2 md:flex"
        onSubmit={(e) => {
          e.preventDefault();
          if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
        }}
      >
        <div
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-1.5",
            isAdmin ? "bg-white/10" : "bg-surface-sunken"
          )}
        >
          <Search className={cn("h-4 w-4", isAdmin ? "text-white/60" : "text-ink-subtle")} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ค้นหาทรัพย์..."
            className={cn(
              "w-48 bg-transparent text-sm focus:outline-none",
              isAdmin ? "text-white placeholder:text-white/40" : "placeholder:text-ink-subtle"
            )}
          />
        </div>
      </form>

      <NotificationBell theme={isAdmin ? "dark" : "light"} />
    </header>
  );
}

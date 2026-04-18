"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  badge?: string | number;
}

async function handleLogout() {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.href = "/";
}

export function Sidebar({
  items,
  mode,
  user,
  variant = "desktop",
  onNavigate,
}: {
  items: NavItem[];
  mode: "agent" | "admin";
  user: { name: string; role: string; avatar?: string };
  /** desktop: fixed + hidden on mobile. drawer: full content, no positioning. */
  variant?: "desktop" | "drawer";
  /** Called when a nav link is clicked — used to close the mobile drawer. */
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isAdmin = mode === "admin";
  const isDrawer = variant === "drawer";

  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col border-r",
        !isDrawer && "fixed inset-y-0 left-0 z-30 hidden lg:flex",
        isAdmin ? "border-ink-soft/20 bg-ink text-white" : "border-line bg-white"
      )}
    >
      {/* Brand */}
      <Link href="/" onClick={onNavigate} className="group flex items-center gap-2 p-5">
        <div className="relative">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand shadow-soft">
            <Home className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <Sparkles className="absolute -right-1 -top-1 h-3.5 w-3.5 text-accent-500" />
        </div>
        <div className="flex flex-col leading-none">
          <span className={cn("font-display text-lg font-bold", isAdmin ? "text-white" : "text-ink")}>
            Estate
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-500">
            {isAdmin ? "Admin Console" : "Agent Portal"}
          </span>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-3 py-2">
        {items.map((item) => {
          // Exact match for dashboard root, prefix-match (with "/") for subsections
          const isRoot = item.href === "/agent" || item.href === "/admin";
          const active = isRoot
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? isAdmin
                    ? "bg-white/10 text-white"
                    : "bg-brand-50 text-brand-800"
                  : isAdmin
                  ? "text-white/70 hover:bg-white/5 hover:text-white"
                  : "text-ink-muted hover:bg-surface-sunken hover:text-ink"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" strokeWidth={2} />
              <span className="flex-1">{item.label}</span>
              {item.badge !== undefined && (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    active
                      ? "bg-white/90 text-brand-800"
                      : isAdmin
                      ? "bg-white/10 text-white"
                      : "bg-brand-100 text-brand-800"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div
        className={cn(
          "border-t px-3 py-3",
          isAdmin ? "border-white/10" : "border-line"
        )}
      >
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-sm font-semibold text-white">
            {user.name[0]}
          </div>
          <div className="min-w-0 flex-1">
            <div className={cn("truncate text-sm font-semibold", isAdmin ? "text-white" : "text-ink")}>
              {user.name}
            </div>
            <div
              className={cn(
                "truncate text-[11px]",
                isAdmin ? "text-white/60" : "text-ink-muted"
              )}
            >
              {user.role}
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="ออกจากระบบ"
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
              isAdmin
                ? "text-white/60 hover:bg-white/10 hover:text-white"
                : "text-ink-muted hover:bg-surface-sunken hover:text-ink"
            )}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

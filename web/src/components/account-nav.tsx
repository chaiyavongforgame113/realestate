"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Heart, MessageSquare, Settings, Bell, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { label: "Profile", href: "/profile", icon: User },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Favorites", href: "/favorites", icon: Heart },
  { label: "Saved Searches", href: "/saved-searches", icon: Bookmark },
  { label: "Enquiries", href: "/enquiries", icon: MessageSquare },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function AccountNav() {
  const pathname = usePathname();
  return (
    <nav className="rounded-2xl border border-line bg-white p-2 shadow-soft">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-brand-50 text-brand-800"
                : "text-ink-muted hover:bg-surface-sunken hover:text-ink"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

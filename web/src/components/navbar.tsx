"use client";

import { useEffect, useState } from "react";
import { Menu, X, Home, Building2, Sparkles, LogOut, User as UserIcon, Heart, MessageSquare, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Container } from "./ui/container";
import { Button } from "./ui/button";
import { useAuth } from "@/lib/auth/client";
import { NotificationBell } from "./notification-bell";
import { ThemeToggle } from "./theme/theme-switcher";
import { LanguageSwitcher } from "./i18n/language-switcher";
import { Magnetic } from "./motion/magnetic";

const navItems = [
  { label: "ซื้อ", href: "/search?listing_type=sale" },
  { label: "เช่า", href: "/search?listing_type=rent" },
  { label: "โครงการใหม่", href: "/search" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const dashboardHref = user?.role === "admin" ? "/admin" : user?.role === "agent" ? "/agent" : null;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "glass" : "bg-transparent"
      )}
    >
      <Container className="flex h-16 items-center justify-between md:h-20">
        <Link href="/" className="group flex items-center gap-2">
          <div className="relative">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand shadow-soft transition-transform group-hover:scale-105 group-hover:rotate-[-6deg]">
              <Home className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <Sparkles className="absolute -right-1 -top-1 h-3.5 w-3.5 text-accent-500" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-lg font-bold tracking-tight text-ink">Estate</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-700">
              AI Powered
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group relative rounded-lg px-4 py-2 text-[15px] font-medium text-ink-soft transition-colors hover:text-brand-700"
            >
              {item.label}
              <span className="absolute inset-x-4 bottom-1 h-0.5 origin-left scale-x-0 rounded-full bg-brand-600 transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <LanguageSwitcher />
          <ThemeToggle />
          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-surface-sunken" />
          ) : user ? (
            <div className="flex items-center gap-2">
              <NotificationBell />
              <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-line bg-white px-2 py-1 pr-3 shadow-soft hover:border-brand-300"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-brand text-xs font-semibold text-white">
                  {(user.firstName ?? user.email)[0].toUpperCase()}
                </div>
                <span className="text-sm font-medium text-ink">
                  {user.firstName ?? user.email.split("@")[0]}
                </span>
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="absolute right-0 top-12 z-20 w-56 overflow-hidden rounded-xl border border-line bg-white shadow-lift"
                    >
                      <div className="border-b border-line p-3">
                        <div className="truncate text-sm font-semibold text-ink">
                          {user.firstName ?? user.email}
                        </div>
                        <div className="truncate text-xs text-ink-muted">{user.email}</div>
                        <div className="mt-1.5 inline-flex rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-brand-800">
                          {user.role}
                        </div>
                      </div>
                      <div className="p-1">
                        {dashboardHref && (
                          <MenuLink href={dashboardHref} icon={LayoutDashboard}>
                            Dashboard
                          </MenuLink>
                        )}
                        <MenuLink href="/profile" icon={UserIcon}>
                          Profile
                        </MenuLink>
                        <MenuLink href="/favorites" icon={Heart}>
                          Favorites
                        </MenuLink>
                        <MenuLink href="/enquiries" icon={MessageSquare}>
                          Enquiries
                        </MenuLink>
                      </div>
                      <button
                        onClick={logout}
                        className="flex w-full items-center gap-2 border-t border-line px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        ออกจากระบบ
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
              </div>
            </div>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  เข้าสู่ระบบ
                </Button>
              </Link>
              <Magnetic strength={0.3}>
                <Link href="/become-agent">
                  <Button variant="accent" size="sm" className="group">
                    <Building2 className="h-4 w-4 transition-transform group-hover:rotate-6" />
                    ลงประกาศฟรี
                  </Button>
                </Link>
              </Magnetic>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <LanguageSwitcher />
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink"
            aria-label="menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </Container>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="glass lg:hidden"
          >
            <Container className="flex flex-col gap-1 py-4">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-ink-soft hover:bg-surface-sunken"
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-line pt-3">
                {user ? (
                  <>
                    {dashboardHref && (
                      <Link href={dashboardHref} onClick={() => setMobileOpen(false)}>
                        <Button variant="outline" size="md" className="w-full">
                          Dashboard
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      size="md"
                      className="w-full text-red-600"
                      onClick={() => {
                        setMobileOpen(false);
                        logout();
                      }}
                    >
                      ออกจากระบบ
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileOpen(false)}>
                      <Button variant="outline" size="md" className="w-full">
                        เข้าสู่ระบบ
                      </Button>
                    </Link>
                    <Link href="/become-agent" onClick={() => setMobileOpen(false)}>
                      <Button variant="accent" size="md" className="w-full">
                        ลงประกาศฟรี
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function MenuLink({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-soft hover:bg-surface-sunken hover:text-ink"
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  );
}

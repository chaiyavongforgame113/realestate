"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  UserCheck,
  ClipboardCheck,
  Users2,
  BarChart3,
  Shield,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar, type NavItem } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Agent Applications", href: "/admin/agents", icon: UserCheck, badge: 3 },
  { label: "Listing Moderation", href: "/admin/listings", icon: ClipboardCheck, badge: 12 },
  { label: "Users", href: "/admin/users", icon: Users2 },
  { label: "AI & Search", href: "/admin/ai", icon: Sparkles },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "System", href: "/admin/system", icon: Shield },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-soft lg:pl-64">
      <Sidebar
        items={adminNav}
        mode="admin"
        user={{ name: "Admin", role: "Super Admin" }}
      />

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 34 }}
              className="fixed inset-y-0 left-0 z-50 lg:hidden"
            >
              <Sidebar
                items={adminNav}
                mode="admin"
                user={{ name: "Admin", role: "Super Admin" }}
                variant="drawer"
                onNavigate={() => setMobileOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Topbar
        title="Admin Console"
        subtitle="ดูแลคุณภาพและความปลอดภัยของ platform"
        onMenuClick={() => setMobileOpen(true)}
        mode="admin"
      />
      <main className="px-4 py-6 md:px-6 md:py-8 lg:px-8">{children}</main>
    </div>
  );
}

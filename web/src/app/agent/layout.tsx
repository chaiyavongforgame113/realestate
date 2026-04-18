"use client";

import { useState } from "react";
import { LayoutDashboard, Building2, Users2, BarChart3, Megaphone, Settings } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar, type NavItem } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

const agentNav: NavItem[] = [
  { label: "ภาพรวม", href: "/agent", icon: LayoutDashboard },
  { label: "ประกาศของฉัน", href: "/agent/listings", icon: Building2, badge: 5 },
  { label: "Leads", href: "/agent/leads", icon: Users2, badge: 3 },
  { label: "สถิติ", href: "/agent/analytics", icon: BarChart3 },
  { label: "โปรโมท", href: "/agent/promote", icon: Megaphone },
  { label: "ตั้งค่า", href: "/agent/settings", icon: Settings },
];

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-soft lg:pl-64">
      <Sidebar
        items={agentNav}
        mode="agent"
        user={{ name: "ณัฐพงศ์ อยู่สุข", role: "Agent · ยืนยันแล้ว" }}
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
                items={agentNav}
                mode="agent"
                user={{ name: "ณัฐพงศ์ อยู่สุข", role: "Agent · ยืนยันแล้ว" }}
                variant="drawer"
                onNavigate={() => setMobileOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Topbar
        title="Agent Portal"
        subtitle="จัดการประกาศและ lead ของคุณ"
        onMenuClick={() => setMobileOpen(true)}
      />
      <main className="px-4 py-6 md:px-6 md:py-8 lg:px-8">{children}</main>
    </div>
  );
}

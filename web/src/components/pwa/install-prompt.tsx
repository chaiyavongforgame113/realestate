"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "estate-pwa-install-dismissed";
const DISMISS_DAYS = 14;

export function InstallPrompt() {
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    function onBefore(e: Event) {
      e.preventDefault();
      const dismissed = localStorage.getItem(DISMISS_KEY);
      if (dismissed) {
        const age = Date.now() - Number(dismissed);
        if (age < DISMISS_DAYS * 24 * 60 * 60 * 1000) return;
      }
      setEvt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShow(true), 6000); // give user a moment to settle in
    }
    function onInstalled() {
      setShow(false);
      setEvt(null);
    }
    window.addEventListener("beforeinstallprompt", onBefore);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBefore);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (!evt) return;
    setInstalling(true);
    try {
      await evt.prompt();
      const res = await evt.userChoice;
      if (res.outcome === "dismissed") {
        localStorage.setItem(DISMISS_KEY, String(Date.now()));
      }
    } finally {
      setInstalling(false);
      setShow(false);
      setEvt(null);
    }
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setShow(false);
  }

  return (
    <AnimatePresence>
      {show && evt && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="fixed bottom-20 right-4 z-[65] max-w-sm rounded-2xl border border-line bg-surface p-4 shadow-lift md:bottom-6"
        >
          <button
            onClick={dismiss}
            className="absolute right-2 top-2 rounded-full p-1 text-ink-muted hover:bg-surface-sunken"
            aria-label="ปิด"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <div className="flex items-start gap-3 pr-6">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-soft">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-sm font-semibold text-ink">
                ติดตั้ง Estate AI บนหน้าจอหลัก
              </div>
              <div className="mt-0.5 text-xs text-ink-muted">
                เปิดใช้งานแบบเร็วขึ้น · ใช้งานออฟไลน์ได้ · รับแจ้งเตือนทรัพย์ใหม่
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={install}
                  disabled={installing}
                  className="inline-flex h-8 items-center rounded-lg bg-brand-700 px-3 text-xs font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
                >
                  {installing ? "กำลังติดตั้ง..." : "ติดตั้ง"}
                </button>
                <button
                  onClick={dismiss}
                  className="inline-flex h-8 items-center rounded-lg px-3 text-xs text-ink-muted hover:bg-surface-sunken"
                >
                  ไว้ทีหลัง
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

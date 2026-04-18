"use client";

import { Bell, BellOff, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { urlBase64ToUint8Array } from "@/lib/push/vapid";
import { cn } from "@/lib/utils";

type Props = {
  variant?: "default" | "compact" | "hero";
  className?: string;
};

export function PushToggle({ variant = "default", className }: Props) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const ok =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;
    setSupported(ok);
    if (!ok) return;
    setPermission(Notification.permission);
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setSubscribed(!!sub))
      .catch(() => null);
  }, []);

  const subscribe = useCallback(async () => {
    setLoading(true);
    setMsg(null);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") {
        setMsg("คุณยังไม่ได้อนุญาตให้ส่งการแจ้งเตือน");
        return;
      }

      const reg = await navigator.serviceWorker.ready;

      const keyRes = await fetch("/api/push/public-key");
      const { key } = await keyRes.json();
      if (!key) throw new Error("no_vapid_key");

      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        const appServerKey = urlBase64ToUint8Array(key);
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          // Cast around the strict ArrayBuffer/SharedArrayBuffer typing mismatch
          applicationServerKey: appServerKey as unknown as BufferSource,
        });
      }

      const json = sub.toJSON() as {
        endpoint: string;
        keys: { p256dh: string; auth: string };
      };

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: json.keys,
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
          locale: typeof navigator !== "undefined" ? navigator.language : null,
        }),
      });

      setSubscribed(true);
      setMsg("เปิดการแจ้งเตือนเรียบร้อย — เราจะส่งทรัพย์ใหม่ที่ตรงใจให้คุณ");
    } catch (err) {
      console.error(err);
      setMsg("ไม่สามารถเปิดการแจ้งเตือนได้ กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    setLoading(true);
    setMsg(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch(
          "/api/push/subscribe?endpoint=" + encodeURIComponent(sub.endpoint),
          { method: "DELETE" }
        );
        await sub.unsubscribe();
      }
      setSubscribed(false);
      setMsg("ปิดการแจ้งเตือนแล้ว");
    } finally {
      setLoading(false);
    }
  }, []);

  if (supported === null) return null;
  if (!supported) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-surface-sunken px-2 py-1 text-[11px] text-ink-muted",
          className
        )}
      >
        <BellOff className="h-3 w-3" /> เบราว์เซอร์ไม่รองรับ
      </span>
    );
  }

  if (variant === "compact") {
    return (
      <button
        onClick={subscribed ? unsubscribe : subscribe}
        disabled={loading}
        aria-label={subscribed ? "ปิดการแจ้งเตือน" : "เปิดการแจ้งเตือน"}
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors",
          subscribed
            ? "border-brand-600 bg-brand-50 text-brand-800 dark:bg-brand-900/40 dark:text-brand-100 dark:border-brand-700"
            : "border-line bg-surface text-ink-muted hover:border-brand-400 hover:text-brand-800",
          className
        )}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : subscribed ? (
          <Bell className="h-4 w-4" />
        ) : (
          <BellOff className="h-4 w-4" />
        )}
      </button>
    );
  }

  if (variant === "hero") {
    return (
      <div className={cn("rounded-2xl border border-line bg-surface p-4 md:p-5", className)}>
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 text-white shadow-soft">
            <Bell className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="font-display text-base font-semibold text-ink">
              แจ้งเตือนเมื่อมีทรัพย์ใหม่ตรงใจ
            </div>
            <div className="mt-0.5 text-xs text-ink-muted">
              รับข้อความเมื่อมีคอนโด/บ้านใหม่ที่ตรงตามเงื่อนไข หรือราคาลดลง
            </div>
            {msg && <div className="mt-2 text-xs text-brand-800">{msg}</div>}
          </div>
          <button
            onClick={subscribed ? unsubscribe : subscribe}
            disabled={loading}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold transition-colors",
              subscribed
                ? "bg-surface-sunken text-ink hover:bg-surface"
                : "bg-brand-700 text-white hover:bg-brand-800"
            )}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {subscribed ? "ปิดการแจ้งเตือน" : "เปิดการแจ้งเตือน"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={subscribed ? unsubscribe : subscribe}
      disabled={loading}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-sm font-medium transition-colors",
        subscribed
          ? "border-brand-600 bg-brand-50 text-brand-800 dark:bg-brand-900/40 dark:text-brand-100 dark:border-brand-700"
          : "border-line bg-surface text-ink hover:border-brand-400",
        className
      )}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : subscribed ? (
        <Bell className="h-4 w-4" />
      ) : (
        <BellOff className="h-4 w-4" />
      )}
      {subscribed ? "การแจ้งเตือนเปิดอยู่" : "เปิดแจ้งเตือนทรัพย์ใหม่"}
    </button>
  );
}

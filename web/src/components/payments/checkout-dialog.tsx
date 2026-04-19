"use client";

import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  CreditCard,
  QrCode,
  Building2,
  Shield,
  Check,
  Loader2,
  X,
  AlertCircle,
  Lock,
} from "lucide-react";
import { useState } from "react";
import { baht } from "@/lib/payments/provider";
import { cn } from "@/lib/utils";

type Method = "card" | "promptpay" | "bank_transfer" | "apple_pay" | "google_pay";

type Props = {
  open: boolean;
  onClose: () => void;
  listingId: string;
  listingTitle?: string;
  amountSatang: number;
  purpose?: "deposit" | "reservation_fee" | "rent_deposit";
};

const METHODS: { key: Method; label: string; hint: string; Icon: typeof CreditCard }[] = [
  { key: "card", label: "บัตรเครดิต/เดบิต", hint: "Visa, Mastercard, JCB", Icon: CreditCard },
  { key: "promptpay", label: "พร้อมเพย์ QR", hint: "สแกนผ่านแอปธนาคาร", Icon: QrCode },
  { key: "bank_transfer", label: "โอนผ่านธนาคาร", hint: "K-Plus, SCB Easy ฯลฯ", Icon: Building2 },
];

export function CheckoutDialog({
  open,
  onClose,
  listingId,
  listingTitle,
  amountSatang,
  purpose = "deposit",
}: Props) {
  const [method, setMethod] = useState<Method>("card");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "failed">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function pay() {
    setSubmitting(true);
    setStatus("idle");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          amountSatang,
          purpose,
          method,
        }),
      });
      if (res.status === 401) {
        window.location.href =
          "/login?redirect=" + encodeURIComponent(window.location.pathname);
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setStatus("failed");
        setErrorMsg(data?.error || "ชำระเงินไม่สำเร็จ");
        return;
      }
      const pStatus = data.payment?.status;
      if (pStatus === "succeeded") {
        setStatus("success");
      } else if (pStatus === "pending") {
        setStatus("success"); // show QR / next-action if needed
      } else {
        setStatus("failed");
        try {
          const meta = JSON.parse(data.payment?.metadata || "{}");
          setErrorMsg(meta.failureReason || "ชำระเงินไม่สำเร็จ");
        } catch {
          setErrorMsg("ชำระเงินไม่สำเร็จ");
        }
      }
    } catch {
      setStatus("failed");
      setErrorMsg("ระบบขัดข้อง ลองใหม่");
    } finally {
      setSubmitting(false);
    }
  }

  function close() {
    if (submitting) return;
    setStatus("idle");
    setErrorMsg(null);
    onClose();
  }

  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-ink/60 p-4 backdrop-blur"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="glass-card relative w-full max-w-md overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <div>
                <h3 className="font-display text-base font-semibold text-ink">
                  ชำระเงิน
                </h3>
                <div className="text-[11px] text-ink-muted">
                  {listingTitle ? `สำหรับ ${listingTitle}` : "ฝากจองทรัพย์"}
                </div>
              </div>
              <button
                onClick={close}
                className="rounded-full p-1 text-ink-muted hover:bg-surface-sunken hover:text-ink"
                aria-label="ปิด"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {status === "success" ? (
              <div className="p-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  <Check className="h-7 w-7" />
                </div>
                <div className="mt-3 font-display text-lg font-bold text-ink">
                  ชำระเงินสำเร็จ
                </div>
                <div className="mt-1 text-sm text-ink-muted">
                  ยอด {baht(amountSatang)} · เราจะส่งอีเมลใบเสร็จให้คุณ
                </div>
                <button
                  onClick={close}
                  className="mt-5 inline-flex h-10 items-center rounded-xl bg-brand-700 px-5 text-sm font-semibold text-white hover:bg-brand-800"
                >
                  เรียบร้อย
                </button>
              </div>
            ) : (
              <div className="p-5">
                <div className="rounded-2xl bg-gradient-to-br from-brand-700 to-accent-500 p-4 text-white shadow-soft">
                  <div className="text-xs opacity-80">ยอดชำระ</div>
                  <div className="font-display text-3xl font-bold">
                    {baht(amountSatang)}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] opacity-90">
                    <Shield className="h-3 w-3" /> ปลอดภัย · SSL/TLS · เข้ารหัสปลายทาง
                  </div>
                </div>

                <div className="mt-4 text-xs font-semibold uppercase tracking-widest text-ink-muted">
                  เลือกวิธีชำระ
                </div>
                <div className="mt-2 grid gap-2">
                  {METHODS.map(({ key, label, hint, Icon }) => {
                    const active = method === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setMethod(key)}
                        className={cn(
                          "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
                          active
                            ? "border-brand-600 bg-brand-50 dark:bg-brand-900/40 dark:border-brand-700"
                            : "border-line bg-surface hover:border-brand-300"
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-lg",
                            active
                              ? "bg-brand-700 text-white"
                              : "bg-surface-sunken text-ink-muted"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-ink">{label}</div>
                          <div className="text-[11px] text-ink-muted">{hint}</div>
                        </div>
                        {active && <Check className="h-4 w-4 text-brand-700" />}
                      </button>
                    );
                  })}
                </div>

                {status === "failed" && errorMsg && (
                  <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-800/60 dark:bg-red-950/40 dark:text-red-300">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <div>{errorMsg}</div>
                  </div>
                )}

                <button
                  onClick={pay}
                  disabled={submitting}
                  className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-700 text-sm font-semibold text-white shadow-soft transition-all hover:bg-brand-800 hover:shadow-lift disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Lock className="h-3.5 w-3.5" />
                  )}
                  ชำระ {baht(amountSatang)}
                </button>

                <div className="mt-3 text-center text-[11px] text-ink-subtle">
                  เงินจะถูกถือในบัญชี Escrow จนกว่าการจองจะเสร็จสมบูรณ์
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

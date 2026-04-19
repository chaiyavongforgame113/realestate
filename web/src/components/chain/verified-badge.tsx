"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ShieldCheck, ShieldAlert, ExternalLink, Copy, Check, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { shortHash, explorerTxUrl } from "@/lib/chain/anchor";

type Verification = {
  listingId: string;
  documentHash: string;
  chain: string;
  txHash: string | null;
  anchoredAt: string | null;
  issuedBy: string | null;
  status: "pending" | "anchored" | "failed";
};

type Props = {
  listingId: string;
  /** If true, try to anchor/verify when the badge loads and no record exists (admin/agent only). */
  canSelfVerify?: boolean;
  compact?: boolean;
  className?: string;
};

export function VerifiedBadge({
  listingId,
  canSelfVerify = false,
  compact = false,
  className,
}: Props) {
  const [v, setV] = useState<Verification | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState<"hash" | "tx" | null>(null);

  useEffect(() => {
    fetch(`/api/chain/verify?listingId=${encodeURIComponent(listingId)}`)
      .then((r) => r.json())
      .then((data) => setV(data.verification))
      .finally(() => setLoading(false));
  }, [listingId]);

  async function verify() {
    setVerifying(true);
    try {
      const res = await fetch("/api/chain/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      const data = await res.json();
      setV(data.verification);
    } finally {
      setVerifying(false);
    }
  }

  function copy(label: "hash" | "tx", text: string) {
    navigator.clipboard?.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 1600);
  }

  if (loading) return null;

  // Not verified at all
  if (!v) {
    if (!canSelfVerify) return null;
    return (
      <button
        onClick={verify}
        disabled={verifying}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-dashed border-line px-2.5 py-1 text-[11px] text-ink-muted hover:border-brand-400 hover:text-brand-800",
          className
        )}
      >
        {verifying ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <ShieldCheck className="h-3 w-3" />
        )}
        {verifying ? "กำลังยืนยันบนเชน..." : "ยืนยันเอกสารบนเชน"}
      </button>
    );
  }

  const anchored = v.status === "anchored" && v.txHash;

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all",
          anchored
            ? "border-emerald-300/70 bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-800 shadow-soft hover:shadow-lift dark:from-emerald-900/40 dark:to-emerald-800/40 dark:text-emerald-200 dark:border-emerald-700"
            : v.status === "failed"
            ? "border-red-300 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
            : "border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
          className
        )}
        title={anchored ? "ยืนยันเอกสารบนบล็อกเชนแล้ว" : "สถานะการยืนยัน"}
      >
        {anchored ? (
          <ShieldCheck className="h-3.5 w-3.5" />
        ) : v.status === "failed" ? (
          <ShieldAlert className="h-3.5 w-3.5" />
        ) : (
          <Loader2 className="h-3 w-3 animate-spin" />
        )}
        {compact
          ? anchored
            ? "Verified"
            : v.status === "failed"
            ? "ยืนยันไม่ผ่าน"
            : "กำลังยืนยัน"
          : anchored
          ? "ยืนยันเอกสารบนบล็อกเชน"
          : v.status === "failed"
          ? "ยืนยันไม่ผ่าน"
          : "กำลังยืนยันบนเชน..."}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-ink/50 p-4 backdrop-blur"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 8 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card relative w-full max-w-md overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-line px-5 py-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <h3 className="font-display text-base font-semibold text-ink">
                    เอกสารยืนยันบนบล็อกเชน
                  </h3>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-full p-1 text-ink-muted hover:bg-surface-sunken hover:text-ink"
                  aria-label="ปิด"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3 p-5">
                <p className="text-xs leading-relaxed text-ink-muted">
                  เอกสารกรรมสิทธิ์ถูกคำนวณ <code className="rounded bg-surface-sunken px-1">SHA-256</code>{" "}
                  แล้วเผยแพร่บนเชน <b>{v.chain}</b> เพื่อให้ตรวจสอบได้ว่าไม่มีการเปลี่ยนแปลง
                </p>

                <Row
                  label="Document hash"
                  value={v.documentHash}
                  display={shortHash(v.documentHash)}
                  copied={copied === "hash"}
                  onCopy={() => copy("hash", v.documentHash)}
                />

                {v.txHash && (
                  <Row
                    label="Transaction"
                    value={v.txHash}
                    display={shortHash(v.txHash)}
                    copied={copied === "tx"}
                    onCopy={() => copy("tx", v.txHash!)}
                    extraLink={explorerTxUrl(v.chain, v.txHash)}
                  />
                )}

                <div className="grid grid-cols-2 gap-2 rounded-xl bg-surface-sunken p-3 text-xs">
                  <div>
                    <div className="text-ink-muted">สถานะ</div>
                    <div className="font-semibold text-ink">
                      {anchored ? "Anchored" : v.status}
                    </div>
                  </div>
                  <div>
                    <div className="text-ink-muted">ยืนยันเมื่อ</div>
                    <div className="font-semibold text-ink">
                      {v.anchoredAt
                        ? new Date(v.anchoredAt).toLocaleString("th-TH")
                        : "—"}
                    </div>
                  </div>
                </div>

                {canSelfVerify && (
                  <button
                    onClick={verify}
                    disabled={verifying}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand-700 px-3 text-xs font-semibold text-white hover:bg-brand-800 disabled:opacity-60"
                  >
                    {verifying && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    ยืนยันใหม่อีกครั้ง
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Row({
  label,
  value,
  display,
  copied,
  onCopy,
  extraLink,
}: {
  label: string;
  value: string;
  display: string;
  copied: boolean;
  onCopy: () => void;
  extraLink?: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface px-3 py-2.5">
      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-widest text-ink-muted">
        <span>{label}</span>
        <div className="flex items-center gap-1">
          {extraLink && (
            <a
              href={extraLink}
              target="_blank"
              rel="noreferrer"
              className="rounded p-1 text-ink-muted hover:text-brand-700"
              title="เปิดใน block explorer"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
          <button
            onClick={onCopy}
            className="rounded p-1 text-ink-muted hover:text-brand-700"
            aria-label="คัดลอก"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
          </button>
        </div>
      </div>
      <div className="mt-1 truncate font-mono text-xs text-ink" title={value}>
        {display}
      </div>
    </div>
  );
}

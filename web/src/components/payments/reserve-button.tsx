"use client";

import { CreditCard } from "lucide-react";
import { useState } from "react";
import { CheckoutDialog } from "./checkout-dialog";
import { baht } from "@/lib/payments/provider";
import { cn } from "@/lib/utils";

type Props = {
  listingId: string;
  listingTitle?: string;
  /** Listing price in baht, used to compute a sensible default deposit. */
  priceBaht: number;
  /** Override deposit (in baht) if you don't want 2% / ฿20,000 default. */
  depositBaht?: number;
  variant?: "primary" | "outline";
  className?: string;
};

function computeDefaultDeposit(priceBaht: number) {
  // 2% of sale price, capped minimum ฿20,000, maximum ฿500,000
  const pct = Math.round(priceBaht * 0.02);
  return Math.min(500_000, Math.max(20_000, pct));
}

export function ReserveButton({
  listingId,
  listingTitle,
  priceBaht,
  depositBaht,
  variant = "primary",
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const deposit = depositBaht ?? computeDefaultDeposit(priceBaht);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold shadow-soft transition-all hover:shadow-lift",
          variant === "primary"
            ? "bg-gradient-brand text-white hover:bg-brand-800"
            : "border border-line bg-surface text-ink hover:border-brand-400",
          className
        )}
      >
        <CreditCard className="h-4 w-4" />
        ฝากจองทรัพย์ · {baht(deposit * 100)}
      </button>
      <CheckoutDialog
        open={open}
        onClose={() => setOpen(false)}
        listingId={listingId}
        listingTitle={listingTitle}
        amountSatang={deposit * 100}
        purpose="deposit"
      />
    </>
  );
}

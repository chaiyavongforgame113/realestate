/**
 * Payment provider abstraction.
 *
 * Today we ship a `mock` provider that simulates authorizations and
 * ~90% success rate. Swap `createCharge` with Stripe/Omise when ready.
 */

export type ChargeInput = {
  amountSatang: number;
  currency: "THB";
  listingId: string;
  userId: string;
  purpose: "deposit" | "reservation_fee" | "rent_deposit";
  method: "card" | "promptpay" | "bank_transfer" | "apple_pay" | "google_pay";
  idempotencyKey?: string;
};

export type ChargeResult = {
  providerRef: string;
  status: "succeeded" | "pending" | "failed";
  failureReason?: string;
  nextActionUrl?: string; // for PromptPay QR or 3DS
};

export async function createCharge(input: ChargeInput): Promise<ChargeResult> {
  const provider = (process.env.PAYMENT_PROVIDER || "mock").toLowerCase();

  if (provider === "mock") {
    await sleep(500 + Math.random() * 600);

    // 92% success; 8% simulated failure for realism
    const success = Math.random() > 0.08;
    const ref =
      "mock_" + Math.random().toString(36).slice(2, 10) + "_" + Date.now().toString(36);

    if (input.method === "promptpay") {
      return {
        providerRef: ref,
        status: "pending",
        nextActionUrl: `/api/payments/promptpay/${ref}`,
      };
    }

    if (!success) {
      return {
        providerRef: ref,
        status: "failed",
        failureReason: "บัตรถูกปฏิเสธโดยธนาคารผู้ออก",
      };
    }

    return { providerRef: ref, status: "succeeded" };
  }

  // Placeholder for real providers — throws explicitly so we don't silently no-op.
  throw new Error(
    `Payment provider "${provider}" not implemented — only "mock" is wired in.`
  );
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function baht(satang: number): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(satang / 100);
}

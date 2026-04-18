import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { createCharge } from "@/lib/payments/provider";

const PAY_METHODS = ["card", "promptpay", "bank_transfer", "apple_pay", "google_pay"] as const;
const PAY_PURPOSES = ["deposit", "reservation_fee", "rent_deposit"] as const;

const CreateSchema = z.object({
  listingId: z.string().min(1),
  amountSatang: z.number().int().min(100).max(50_000_000_00),
  purpose: z.enum(PAY_PURPOSES).default("deposit"),
  method: z.enum(PAY_METHODS).default("card"),
  metadata: z.record(z.string(), z.any()).optional(),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const items = await prisma.payment.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const parsed = CreateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input", details: parsed.error.flatten() }, { status: 400 });
  }

  const listing = await prisma.listing.findUnique({ where: { id: parsed.data.listingId } });
  if (!listing) return NextResponse.json({ error: "listing_not_found" }, { status: 404 });
  const payment = await prisma.payment.create({
    data: {
      userId: user.id,
      listingId: parsed.data.listingId,
      amountSatang: parsed.data.amountSatang,
      currency: "THB",
      provider: process.env.PAYMENT_PROVIDER || "mock",
      purpose: parsed.data.purpose,
      status: "pending",
      metadata: parsed.data.metadata ? JSON.stringify(parsed.data.metadata) : null,
    },
  });

  const charge = await createCharge({
    amountSatang: parsed.data.amountSatang,
    currency: "THB",
    listingId: parsed.data.listingId,
    userId: user.id,
    purpose: parsed.data.purpose,
    method: parsed.data.method,
    idempotencyKey: payment.id,
  });

  const newStatus =
    charge.status === "succeeded"
      ? "succeeded"
      : charge.status === "failed"
      ? "failed"
      : "pending";
  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      providerRef: charge.providerRef,
      status: newStatus,
      metadata: JSON.stringify({
        ...(parsed.data.metadata ?? {}),
        method: parsed.data.method,
        failureReason: charge.failureReason,
      }),
    },
  });

  return NextResponse.json({ payment: updated, nextActionUrl: charge.nextActionUrl });
}

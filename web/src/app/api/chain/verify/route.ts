import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { anchorHashOnChain, hashListingDocuments } from "@/lib/chain/anchor";

const PostSchema = z.object({
  listingId: z.string().min(1),
  /** Additional document strings/URLs to include in the canonical hash */
  documents: z.array(z.string().min(1)).max(20).optional(),
});

/** GET /api/chain/verify?listingId=... — fetch verification status */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const listingId = url.searchParams.get("listingId");
  if (!listingId) return NextResponse.json({ error: "missing_listingId" }, { status: 400 });
  const record = await prisma.chainVerification.findUnique({ where: { listingId } });
  return NextResponse.json({ verification: record });
}

/** POST /api/chain/verify — generate hash, anchor on-chain, record. */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  // Only the owning agent or admin can verify
  if (user.role !== "admin" && user.role !== "agent") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const parsed = PostSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const listing = await prisma.listing.findUnique({
    where: { id: parsed.data.listingId },
  });
  if (!listing) return NextResponse.json({ error: "not_found" }, { status: 404 });

  if (user.role === "agent" && listing.agentId !== user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // Build canonical document string. In production this would ingest file blobs.
  const parts = [
    `listing:${listing.id}`,
    `title:${listing.title}`,
    `address:${listing.addressDetail ?? ""}`,
    `district:${listing.district ?? ""}`,
    `type:${listing.propertyType}`,
    `price:${listing.price}`,
    `area:${listing.usableArea}`,
    `agent:${listing.agentId}`,
    ...(parsed.data.documents ?? []),
  ];
  const documentHash = hashListingDocuments(parts);

  // Create or reset row
  await prisma.chainVerification.upsert({
    where: { listingId: listing.id },
    create: {
      listingId: listing.id,
      documentHash,
      chain: process.env.CHAIN_NETWORK || "polygon-amoy",
      status: "pending",
    },
    update: {
      documentHash,
      status: "pending",
      txHash: null,
      anchoredAt: null,
    },
  });

  try {
    const result = await anchorHashOnChain(documentHash);
    const record = await prisma.chainVerification.update({
      where: { listingId: listing.id },
      data: {
        txHash: result.txHash,
        chain: result.chain,
        anchoredAt: result.anchoredAt,
        issuedBy: result.issuedBy,
        status: "anchored",
        metadata: JSON.stringify({ blockExplorerUrl: result.blockExplorerUrl }),
      },
    });
    return NextResponse.json({ verification: record });
  } catch (err) {
    const record = await prisma.chainVerification.update({
      where: { listingId: listing.id },
      data: {
        status: "failed",
        metadata: JSON.stringify({ error: (err as Error).message }),
      },
    });
    return NextResponse.json({ verification: record }, { status: 500 });
  }
}

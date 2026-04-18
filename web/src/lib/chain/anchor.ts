/**
 * Blockchain document-hash anchoring.
 *
 * We SHA-256 the title deed (or any document) and publish the hash on-chain
 * so anyone can verify the listing's documents are authentic and unaltered.
 *
 * The real impl should call a smart contract on Polygon PoS/Amoy; the mock
 * impl just generates deterministic-looking "tx hashes" for demo purposes.
 */

import { createHash, randomBytes } from "crypto";

const CHAIN = process.env.CHAIN_NETWORK || "polygon-amoy";
const EXPLORERS: Record<string, string> = {
  "polygon-amoy": "https://amoy.polygonscan.com",
  "polygon": "https://polygonscan.com",
  "ethereum": "https://etherscan.io",
};

export function sha256(input: string | Buffer): string {
  return "0x" + createHash("sha256").update(input).digest("hex");
}

export function hashListingDocuments(parts: string[]): string {
  const canonical = parts
    .filter(Boolean)
    .map((p) => p.trim())
    .sort()
    .join("\n");
  return sha256(canonical);
}

export type AnchorResult = {
  txHash: string;
  chain: string;
  blockExplorerUrl: string;
  anchoredAt: Date;
  issuedBy: string;
};

export async function anchorHashOnChain(documentHash: string): Promise<AnchorResult> {
  const provider = (process.env.CHAIN_PROVIDER || "mock").toLowerCase();
  if (provider === "mock") {
    // Simulate a network anchor with ~1s delay
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 400));
    const txHash = "0x" + randomBytes(32).toString("hex");
    return {
      txHash,
      chain: CHAIN,
      blockExplorerUrl: explorerTxUrl(CHAIN, txHash),
      anchoredAt: new Date(),
      issuedBy: "estate.ai:issuer/mock",
    };
  }
  throw new Error(`Chain provider "${provider}" not implemented.`);
}

export function explorerTxUrl(chain: string, txHash: string): string {
  const base = EXPLORERS[chain] || EXPLORERS["polygon-amoy"];
  return `${base}/tx/${txHash}`;
}

export function shortHash(hash: string, prefix = 6, suffix = 4): string {
  if (!hash) return "";
  const h = hash.startsWith("0x") ? hash.slice(2) : hash;
  if (h.length <= prefix + suffix) return hash;
  return `0x${h.slice(0, prefix)}…${h.slice(-suffix)}`;
}

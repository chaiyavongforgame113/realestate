/**
 * VAPID helpers for Web Push.
 *
 * Keys are loaded from env vars:
 *   NEXT_PUBLIC_VAPID_PUBLIC_KEY  — exposed to the browser
 *   VAPID_PRIVATE_KEY             — server only
 *   VAPID_SUBJECT                 — e.g. "mailto:ops@estate.ai"
 *
 * In dev, a fallback pair is used so the UI can be exercised without
 * real keys. These fallback keys must NOT be used in production.
 */

// Fallback (DEV ONLY). Regenerate with `npx web-push generate-vapid-keys`.
const DEV_PUBLIC =
  "BJvL1rEaC2GsH1b6dKrGw6ySIhXVRkxkqZ63cP7SaiEJmpkZZrmUYM3oNz8d1H1xgcqZ6sCjcVlBtN9KH8w1yQE";
const DEV_PRIVATE = "iU3iQNkfz9-gYVWAfzj4e3nYYJ5p2bwJ3kkk7fFvT1Q";

export function vapidPublic(): string {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || DEV_PUBLIC;
}

export function vapidPrivate(): string {
  return process.env.VAPID_PRIVATE_KEY || DEV_PRIVATE;
}

export function vapidSubject(): string {
  return process.env.VAPID_SUBJECT || "mailto:ops@estate.ai";
}

/** URL-safe base64 → Uint8Array (client-side helper for applicationServerKey) */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = typeof atob === "function" ? atob(base64) : Buffer.from(base64, "base64").toString("binary");
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) arr[i] = raw.charCodeAt(i);
  return arr;
}

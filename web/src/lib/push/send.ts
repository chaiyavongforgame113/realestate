/**
 * Server-side push sender.
 *
 * Uses the `web-push` package if it's installed. If not, silently no-ops and
 * logs a warning so the rest of the app still works. Run `npm i web-push` to
 * enable real delivery.
 */

import { vapidPrivate, vapidPublic, vapidSubject } from "./vapid";
import { prisma } from "@/lib/prisma";

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  image?: string;
  tag?: string;
};

type WebPushLib = {
  setVapidDetails: (subject: string, pub: string, priv: string) => void;
  sendNotification: (
    subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
    payload: string
  ) => Promise<unknown>;
};

let cached: WebPushLib | null = null;
let tried = false;

async function loadWebPush(): Promise<WebPushLib | null> {
  if (cached) return cached;
  if (tried) return null;
  tried = true;
  try {
    // Dynamic import so the build doesn't fail if web-push isn't installed yet.
    const mod = (await import("web-push" /* webpackIgnore: true */ as string)) as {
      default?: WebPushLib;
    } & WebPushLib;
    const lib = mod.default ?? mod;
    lib.setVapidDetails(vapidSubject(), vapidPublic(), vapidPrivate());
    cached = lib;
    return cached;
  } catch {
    console.warn(
      "[push] web-push not installed — notifications will be skipped. Run `npm i web-push` to enable."
    );
    return null;
  }
}

export async function sendPushToUser(userId: string, payload: PushPayload) {
  const lib = await loadWebPush();
  if (!lib) return { sent: 0, failed: 0 };
  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  return sendToSubs(lib, subs, payload);
}

export async function broadcastPush(payload: PushPayload) {
  const lib = await loadWebPush();
  if (!lib) return { sent: 0, failed: 0 };
  const subs = await prisma.pushSubscription.findMany();
  return sendToSubs(lib, subs, payload);
}

type SubRow = { id: string; endpoint: string; p256dh: string; auth: string };

async function sendToSubs(lib: WebPushLib, subs: SubRow[], payload: PushPayload) {
  const body = JSON.stringify(payload);
  let sent = 0;
  let failed = 0;
  await Promise.all(
    subs.map(async (s) => {
      try {
        await lib.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          body
        );
        sent += 1;
      } catch (err: unknown) {
        failed += 1;
        const code = (err as { statusCode?: number })?.statusCode;
        // 404/410 = gone → prune the stale subscription
        if (code === 404 || code === 410) {
          try {
            await prisma.pushSubscription.delete({ where: { id: s.id } });
          } catch {
            /* ignore */
          }
        }
      }
    })
  );
  return { sent, failed };
}

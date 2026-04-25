import { cookies } from "next/headers";
import { prisma } from "../prisma";
import { verifyAccessToken } from "./jwt";
import { ACCESS_COOKIE } from "./cookies";

export interface Session {
  userId: string;
  role: "user" | "agent" | "admin";
  email: string;
}

/**
 * Read current session from cookie. Returns null when not logged in or token invalid.
 * Safe to call from server components and API routes.
 */
export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get(ACCESS_COOKIE)?.value;
  if (!token) return null;

  const payload = await verifyAccessToken(token);
  if (!payload) return null;

  return { userId: payload.sub, role: payload.role, email: payload.email };
}

/**
 * Load the full user record. Returns null if not logged in or user deleted/suspended.
 */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { profile: true, agentProfile: true },
  });

  if (!user || user.status === "suspended") return null;
  return user;
}

export async function requireSession(): Promise<Session> {
  const s = await getSession();
  if (!s) throw new Response("Unauthorized", { status: 401 });
  return s;
}

export async function requireRole(roles: Array<Session["role"]>): Promise<Session> {
  const s = await requireSession();
  // Verify the current DB state — role may have changed or user suspended
  // since the JWT was issued (TTL up to 15 min).
  const u = await prisma.user.findUnique({
    where: { id: s.userId },
    select: { role: true, status: true },
  });
  if (!u || u.status === "suspended") {
    throw new Response("Unauthorized", { status: 401 });
  }
  if (!roles.includes(u.role)) throw new Response("Forbidden", { status: 403 });
  return { ...s, role: u.role };
}

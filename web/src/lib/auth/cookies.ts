import { cookies } from "next/headers";
import { TOKEN_TTL } from "./jwt";

export const ACCESS_COOKIE = "estate_access";
export const REFRESH_COOKIE = "estate_refresh";

export async function setAuthCookies(access: string, refresh: string) {
  const store = await cookies();
  const isProd = process.env.NODE_ENV === "production";

  store.set(ACCESS_COOKIE, access, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: TOKEN_TTL.access,
  });

  store.set(REFRESH_COOKIE, refresh, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: TOKEN_TTL.refresh,
  });
}

export async function clearAuthCookies() {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}

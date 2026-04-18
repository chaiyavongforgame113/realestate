import { SignJWT, jwtVerify } from "jose";

const ACCESS_SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!);
const REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET!);
const ACCESS_TTL = Number(process.env.JWT_ACCESS_TTL_SECONDS ?? 900);
const REFRESH_TTL = Number(process.env.JWT_REFRESH_TTL_SECONDS ?? 60 * 60 * 24 * 7);

export interface AccessPayload {
  sub: string; // userId
  role: "user" | "agent" | "admin";
  email: string;
}

export interface RefreshPayload {
  sub: string;
  jti: string;
}

export async function signAccessToken(payload: AccessPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TTL}s`)
    .setSubject(payload.sub)
    .sign(ACCESS_SECRET);
}

export async function signRefreshToken(payload: RefreshPayload) {
  return new SignJWT({ jti: payload.jti })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${REFRESH_TTL}s`)
    .setSubject(payload.sub)
    .sign(REFRESH_SECRET);
}

export async function verifyAccessToken(token: string): Promise<AccessPayload | null> {
  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET);
    return {
      sub: payload.sub as string,
      role: payload.role as AccessPayload["role"],
      email: payload.email as string,
    };
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<RefreshPayload | null> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET);
    return { sub: payload.sub as string, jti: payload.jti as string };
  } catch {
    return null;
  }
}

export const TOKEN_TTL = { access: ACCESS_TTL, refresh: REFRESH_TTL };

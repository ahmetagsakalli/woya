import "server-only";
import { createHash, createHmac, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "./db";

const cookieName = "woya-admin-session";
const adminIdentity = "woya-admin";
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function authConfigured() {
  return Boolean(
    (process.env.ADMIN_SESSION_SECRET?.length ?? 0) >= 32 &&
    process.env.DATABASE_URL,
  );
}
const hash = (v: string) => createHash("sha256").update(v).digest("hex");
export async function currentSessionHash() {
  const token = (await cookies()).get(cookieName)?.value;
  return token && /^[a-f0-9]{64}$/.test(token) ? hash(token) : null;
}
export async function adminCredential() {
  const [row] = await db()<
    {
      password_hash: string;
      version: number;
      changed_at: Date | null;
    }[]
  >`SELECT password_hash,version,changed_at FROM woya_admin_credentials WHERE identity=${adminIdentity}`;
  if (!row)
    throw new HttpError(503, "Yönetici şifresi henüz yapılandırılmadı.");
  return row;
}
export async function session() {
  if (!authConfigured()) return null;
  const tokenHash = await currentSessionHash();
  if (!tokenHash) return null;
  const [row] =
    await db()`SELECT s.identity FROM woya_sessions s JOIN woya_admin_credentials c ON c.identity=s.identity AND c.version=s.credential_version WHERE s.token_hash=${tokenHash} AND s.expires_at > now()`;
  return row?.identity === adminIdentity ? String(row.identity) : null;
}
export async function requireAdmin() {
  const identity = await session();
  if (!identity)
    throw new HttpError(401, "Oturumunuz sona erdi. Yeniden giriş yapın.");
  return identity;
}
export const protectPage = cache(async () => {
  const identity = await session();
  if (!identity) redirect("/admin/giris");
  return identity;
});
export async function startSession(credentialVersion: number) {
  const token = randomBytes(32).toString("hex");
  const oldHash = await currentSessionHash();
  await db().begin(async (tx) => {
    // Serialize issuance with password rotation so a checked old password cannot create a new session.
    const [credential] =
      await tx`SELECT version FROM woya_admin_credentials WHERE identity=${adminIdentity} FOR SHARE`;
    if (credential?.version !== credentialVersion)
      throw new HttpError(
        401,
        "Şifre değişti. Güncel şifrenizle yeniden giriş yapın.",
      );
    if (oldHash)
      await tx`DELETE FROM woya_sessions WHERE token_hash=${oldHash}`;
    await tx`DELETE FROM woya_sessions WHERE expires_at < now()`;
    await tx`INSERT INTO woya_sessions (token_hash,identity,expires_at,credential_version) VALUES (${hash(token)},${adminIdentity},now()+interval '8 hours',${credentialVersion})`;
  });
  (await cookies()).set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 28800,
  });
}
export async function endSession() {
  const token = (await cookies()).get(cookieName)?.value;
  if (token && process.env.DATABASE_URL)
    await db()`DELETE FROM woya_sessions WHERE token_hash=${hash(token)}`;
  await clearSessionCookie();
}
export async function clearSessionCookie() {
  (await cookies()).delete(cookieName);
}
export function checkOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const expected = process.env.APP_URL || new URL(request.url).origin;
  if (!origin || origin !== new URL(expected).origin)
    throw new HttpError(403, "İstek kaynağı doğrulanamadı.");
}
export async function rateLimit(key: string, limit: number, seconds: number) {
  await db()`DELETE FROM woya_rate_limits WHERE expires_at < now()`;
  const [row] =
    await db()`INSERT INTO woya_rate_limits (key,attempts,expires_at) VALUES (${key},1,now()+${seconds}*interval '1 second')
    ON CONFLICT (key) DO UPDATE SET attempts=woya_rate_limits.attempts+1 RETURNING attempts`;
  if (row.attempts > limit)
    throw new HttpError(
      429,
      "Çok fazla deneme yapıldı. Lütfen daha sonra tekrar deneyin.",
    );
}
export function fingerprint(request: Request, scope: string) {
  // Vercel's overwritten header is trusted only on Vercel. Other hosts share a conservative bucket.
  const ip = process.env.VERCEL
    ? (request.headers.get("x-vercel-forwarded-for") ?? "unknown")
    : "local";
  return createHmac(
    "sha256",
    process.env.ADMIN_SESSION_SECRET || "unconfigured",
  )
    .update(`${scope}:${ip}`)
    .digest("hex");
}
export async function readJson(request: Request, max = 150000) {
  if (Number(request.headers.get("content-length") || 0) > max)
    throw new HttpError(413, "İstek çok büyük.");
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "İstek boş.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > max) {
      await reader.cancel();
      throw new HttpError(413, "İstek çok büyük.");
    }
    chunks.push(value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
  } catch {
    throw new HttpError(400, "Geçersiz istek.");
  }
}

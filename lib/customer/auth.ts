import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import type { TransactionSql } from "postgres";
import { cache } from "react";
import { db, databaseConfigured } from "../admin/db";
import { HttpError } from "../admin/auth";
import type { Customer } from "./schema";
export const customerCookie = "woya-customer";
export const guestCookie = "woya-guest-order";
export const hashToken = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export const newToken = () => randomBytes(32).toString("hex");
export async function cookieHash(name = customerCookie) {
  const token = (await cookies()).get(name)?.value;
  return token && /^[a-f0-9]{64}$/.test(token) ? hashToken(token) : null;
}
export async function setPrivateCookie(
  name: string,
  token: string,
  maxAge: number,
) {
  (await cookies()).set(name, token, {
    httpOnly: true,
    secure:
      process.env.APP_URL?.startsWith("https:") ??
      process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}
export async function clearPrivateContext() {
  const jar = await cookies();
  const guest = await cookieHash(guestCookie);
  if (guest)
    await db()`DELETE FROM woya_guest_sessions WHERE token_hash=${guest}`;
  jar.delete(guestCookie);
  jar.delete("woya-checkout");
}
export async function customerSession() {
  if (!databaseConfigured()) return null;
  const tokenHash = await cookieHash();
  if (!tokenHash) return null;
  const [row] =
    await db()`SELECT c.id,c.email,c.first_name,c.last_name,c.phone,c.credential_version,s.expires_at
 FROM woya_customer_sessions s JOIN woya_customers c ON c.id=s.customer_id AND c.credential_version=s.credential_version
 WHERE s.token_hash=${tokenHash} AND s.expires_at>now() AND c.verified_at IS NOT NULL AND c.closure_requested_at IS NULL`;
  if (!row) return null;
  const customer: Customer = {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
  };
  return {
    customer,
    tokenHash,
    version: Number(row.credential_version),
    expiresAt: row.expires_at.toISOString() as string,
  };
}
export const pageSession = cache(customerSession);
export async function requireCustomer() {
  const session = await customerSession();
  if (!session)
    throw new HttpError(401, "Oturumunuz sona erdi. Yeniden giriş yapın.");
  return session;
}
export type Session = NonNullable<Awaited<ReturnType<typeof customerSession>>>;
export type Transaction = TransactionSql;
// Lock the account before session checks/mutations: password changes and revocation serialize with all writes.
export async function lockCustomer(tx: Transaction, session: Session) {
  const [row] =
    await tx`SELECT * FROM woya_customers WHERE id=${session.customer.id} FOR UPDATE`;
  const [active] =
    await tx`SELECT token_hash FROM woya_customer_sessions WHERE token_hash=${session.tokenHash} AND customer_id=${session.customer.id} AND credential_version=${session.version} AND expires_at>now()`;
  if (
    !row ||
    !active ||
    row.credential_version !== session.version ||
    row.closure_requested_at ||
    !row.verified_at
  )
    throw new HttpError(401, "Oturumunuz sona erdi. Yeniden giriş yapın.");
  return row;
}

import "server-only";
import { db } from "./db";
import {
  adminCredential,
  currentSessionHash,
  HttpError,
  requireAdmin,
} from "./auth";

export async function securitySummary() {
  const identity = await requireAdmin();
  const tokenHash = await currentSessionHash();
  const credential = await adminCredential();
  const sessions = await db()<{ expires_at: Date; current: boolean }[]>`
    SELECT expires_at,token_hash=${tokenHash} AS current FROM woya_sessions
    WHERE identity=${identity} AND credential_version=${credential.version} AND expires_at>now()
    ORDER BY expires_at DESC`;
  return {
    passwordChangedAt: credential.changed_at?.toISOString() ?? null,
    activeSessions: sessions.length,
    otherSessions: sessions.filter((s) => !s.current).length,
    expiresAt:
      sessions.find((s) => s.current)?.expires_at.toISOString() ?? null,
  };
}

export async function changePasswordHash(
  identity: string,
  expectedVersion: number,
  passwordHash: string,
) {
  const tokenHash = await currentSessionHash();
  await db().begin(async (tx) => {
    const [credential] =
      await tx`SELECT version FROM woya_admin_credentials WHERE identity=${identity} FOR UPDATE`;
    if (credential?.version !== expectedVersion)
      throw new HttpError(
        409,
        "Şifre başka bir oturumda değiştirildi. Yeniden giriş yapın.",
      );
    const [active] =
      await tx`SELECT token_hash FROM woya_sessions WHERE token_hash=${tokenHash} AND identity=${identity} AND credential_version=${expectedVersion} AND expires_at>now() FOR UPDATE`;
    if (!active)
      throw new HttpError(401, "Oturumunuz sona erdi. Yeniden giriş yapın.");
    await tx`UPDATE woya_admin_credentials SET password_hash=${passwordHash},version=version+1,changed_at=now() WHERE identity=${identity}`;
    await tx`DELETE FROM woya_sessions WHERE identity=${identity}`;
    await tx`INSERT INTO woya_audit(actor,action,entity) VALUES(${identity},'password_changed','admin-security')`;
  });
}

export async function revokeOtherSessions(identity: string) {
  const tokenHash = await currentSessionHash();
  return db().begin(async (tx) => {
    const [credential] =
      await tx`SELECT version FROM woya_admin_credentials WHERE identity=${identity} FOR UPDATE`;
    const [active] =
      await tx`SELECT token_hash FROM woya_sessions WHERE token_hash=${tokenHash} AND identity=${identity} AND credential_version=${credential?.version ?? 0} AND expires_at>now() FOR UPDATE`;
    if (!active)
      throw new HttpError(401, "Oturumunuz sona erdi. Yeniden giriş yapın.");
    const revoked =
      await tx`DELETE FROM woya_sessions WHERE identity=${identity} AND token_hash<>${tokenHash} RETURNING token_hash`;
    await tx`INSERT INTO woya_audit(actor,action,entity) VALUES(${identity},'other_sessions_revoked','admin-security')`;
    return revoked.length;
  });
}

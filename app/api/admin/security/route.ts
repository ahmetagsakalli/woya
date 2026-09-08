import bcrypt from "bcryptjs";
import {
  adminCredential,
  checkOrigin,
  clearSessionCookie,
  fingerprint,
  HttpError,
  rateLimit,
  readJson,
  requireAdmin,
} from "@/lib/admin/auth";
import { failure } from "@/lib/admin/http";
import { passwordChangeSchema } from "@/lib/admin/security-schema";
import { changePasswordHash, revokeOtherSessions } from "@/lib/admin/security";

export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const identity = await requireAdmin();
    await rateLimit(fingerprint(request, "password-change"), 10, 900);
    await rateLimit("admin-password-change-global", 20, 900);
    const input = passwordChangeSchema.parse(await readJson(request, 3000));
    const credential = await adminCredential();
    if (
      !(await bcrypt.compare(input.currentPassword, credential.password_hash))
    )
      throw new HttpError(400, "Mevcut şifre hatalı.");
    if (await bcrypt.compare(input.newPassword, credential.password_hash))
      throw new HttpError(400, "Yeni şifre mevcut şifrenizden farklı olmalı.");
    await changePasswordHash(
      identity,
      credential.version,
      await bcrypt.hash(input.newPassword, 12),
    );
    await clearSessionCookie();
    return Response.json({ ok: true });
  } catch (error) {
    return failure(error);
  }
}

export async function DELETE(request: Request) {
  try {
    checkOrigin(request);
    const identity = await requireAdmin();
    await rateLimit(fingerprint(request, "revoke-sessions"), 10, 900);
    const revoked = await revokeOtherSessions(identity);
    return Response.json({ ok: true, revoked });
  } catch (error) {
    return failure(error);
  }
}

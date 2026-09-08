import bcrypt from "bcryptjs";
import { z } from "zod";
import {
  authConfigured,
  adminCredential,
  checkOrigin,
  endSession,
  fingerprint,
  HttpError,
  rateLimit,
  readJson,
  startSession,
} from "@/lib/admin/auth";
import { failure } from "@/lib/admin/http";

export async function POST(request: Request) {
  try {
    checkOrigin(request);
    if (!authConfigured())
      throw new HttpError(
        503,
        "Yönetim bağlantısı henüz kurulmadı. Kurulum rehberindeki adımları tamamlayın.",
      );
    await rateLimit(fingerprint(request, "login"), 12, 900);
    await rateLimit("admin-login-global", 60, 900);
    const input = z
      .object({
        password: z.string().min(1).max(128),
      })
      .parse(await readJson(request, 2000));
    const credential = await adminCredential();
    const valid = await bcrypt.compare(
      input.password,
      credential.password_hash,
    );
    if (!valid) {
      console.warn("Admin login rejected");
      throw new HttpError(401, "Parola hatalı.");
    }
    await startSession(credential.version);
    return Response.json({ ok: true });
  } catch (e) {
    return failure(e);
  }
}
export async function DELETE(request: Request) {
  try {
    checkOrigin(request);
    await endSession();
    return Response.json({ ok: true });
  } catch (e) {
    return failure(e);
  }
}

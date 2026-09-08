import { HttpError } from "@/lib/admin/auth";
import { handleCallback } from "@/lib/payments/service";
import { ZodError } from "zod";

export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    if (
      !request.headers
        .get("content-type")
        ?.startsWith("application/x-www-form-urlencoded")
    )
      throw new HttpError(415, "Unsupported content type");
    const reader = request.body?.getReader();
    if (!reader) throw new HttpError(400, "Empty callback");
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      size += part.value.length;
      if (size > 16000) {
        await reader.cancel();
        throw new HttpError(413, "Callback too large");
      }
      chunks.push(part.value);
    }
    const form = new URLSearchParams(Buffer.concat(chunks).toString("utf8"));
    for (const key of form.keys())
      if (form.getAll(key).length !== 1)
        throw new HttpError(400, "Duplicate field");
    await handleCallback(Object.fromEntries(form));
    return new Response("OK", {
      headers: { "Content-Type": "text/plain", "Cache-Control": "no-store" },
    });
  } catch (e) {
    return new Response("Notification not accepted", {
      status:
        e instanceof HttpError ? e.status : e instanceof ZodError ? 400 : 503,
      headers: { "Content-Type": "text/plain", "Cache-Control": "no-store" },
    });
  }
}

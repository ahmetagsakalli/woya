import { readdir } from "node:fs/promises";
import path from "node:path";
import {
  requireAdmin,
  checkOrigin,
  HttpError,
  rateLimit,
} from "@/lib/admin/auth";
import { db } from "@/lib/admin/db";
import { failure } from "@/lib/admin/http";
import { storeImage } from "@/lib/admin/storage";

export async function GET() {
  try {
    await requireAdmin();
    const files = await readdir(
      path.join(process.cwd(), "public/images/products/woya"),
    );
    const rows =
      await db()`SELECT url,name FROM woya_media ORDER BY created_at DESC LIMIT 500`;
    return Response.json(
      {
        images: [
          ...rows,
          ...files
            .filter((f) => /\.webp$/.test(f))
            .map((name) => ({ name, url: `/images/products/woya/${name}` })),
        ],
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (e) {
    return failure(e);
  }
}
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const actor = await requireAdmin();
    await rateLimit(`upload:${actor}`, 40, 3600);
    if (Number(request.headers.get("content-length") || 0) > 4_100_000)
      throw new HttpError(413, "Dosya en fazla 4 MB olabilir.");
    // Bound the stream before parsing multipart to avoid buffering arbitrary request bodies.
    const reader = request.body?.getReader();
    if (!reader) throw new HttpError(400, "Dosya seçin.");
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 4_100_000) {
        await reader.cancel();
        throw new HttpError(413, "Dosya en fazla 4 MB olabilir.");
      }
      chunks.push(value);
    }
    const form = await new Response(Buffer.concat(chunks), {
      headers: { "content-type": request.headers.get("content-type") || "" },
    }).formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new HttpError(400, "Dosya seçin.");
    const url = await storeImage(file);
    await db()`INSERT INTO woya_media(url,name) VALUES(${url},${file.name.slice(0, 180)})`;
    await db()`INSERT INTO woya_audit(actor,action,entity) VALUES(${actor},'media:upload',${url})`;
    return Response.json({ url });
  } catch (e) {
    return failure(e);
  }
}

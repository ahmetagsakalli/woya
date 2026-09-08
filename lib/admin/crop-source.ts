import "server-only";
import { readFile, realpath, stat } from "node:fs/promises";
import path from "node:path";
import { db } from "./db";
import { imageUrl } from "./schema";
import { HttpError } from "./auth";

const maxBytes = 12_000_000;
export async function readCropSource(url: string): Promise<Buffer> {
  imageUrl.parse(url);
  if (!url.startsWith("/images/")) {
    const rows = await db()`SELECT url FROM woya_media WHERE url=${url} LIMIT 1`;
    if (!rows.length) throw new HttpError(400, "Kütüphaneden bir kaynak görsel seçin.");
  }
  if (url.startsWith("/")) {
    const media = url.startsWith("/media/");
    if (media && (process.env.VERCEL || process.env.STORAGE_DRIVER !== "local" || !process.env.UPLOAD_DIR))
      throw new HttpError(400, "Yerel görsel bu ortamda kullanılamıyor.");
    const root = await realpath(media ? process.env.UPLOAD_DIR! : path.join(process.cwd(), "public/images"));
    try {
      const file = await realpath(path.join(root, url.slice(media ? 7 : 8)));
      if (!file.startsWith(root + path.sep) || (await stat(file)).size > maxBytes) throw new Error("Invalid source");
      return await readFile(file);
    } catch {
      throw new HttpError(400, "Kaynak görsel bulunamadı veya çok büyük.");
    }
  }
  // Only schema-validated public Blob URLs already registered in our media library.
  const response = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(15000), cache: "no-store" });
  if (!response.ok || !response.body) throw new HttpError(400, "Kaynak görsel okunamadı.");
  const reader = response.body.getReader(), chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > maxBytes) throw new HttpError(413, "Kaynak görsel çok büyük.");
      chunks.push(value);
    }
  } finally {
    await reader.cancel();
  }
  return Buffer.concat(chunks);
}

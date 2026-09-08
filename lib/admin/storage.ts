import "server-only";
import { put } from "@vercel/blob";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { HttpError } from "./auth";

export function storageConfigured() {
  return process.env.STORAGE_DRIVER === "local"
    ? Boolean(
        !process.env.VERCEL &&
        process.env.UPLOAD_DIR &&
        path.isAbsolute(process.env.UPLOAD_DIR),
      )
    : Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}
export async function storeImage(file: File) {
  if (!storageConfigured())
    throw new HttpError(503, "Görsel depolama bağlantısı henüz kurulmadı.");
  if (
    !file.size ||
    file.size > 4_000_000 ||
    !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)
  )
    throw new HttpError(
      400,
      "JPG, PNG, WebP veya AVIF, en fazla 4 MB yükleyin.",
    );
  let buffer: Buffer;
  try {
    buffer = await sharp(await file.arrayBuffer(), {
      limitInputPixels: 40_000_000,
    })
      .rotate()
      .resize({
        width: 2400,
        height: 2400,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 88 })
      .toBuffer();
  } catch {
    throw new HttpError(400, "Görsel okunamadı veya çok yüksek çözünürlükte.");
  }
  const name = `${randomUUID()}.webp`;
  if (process.env.STORAGE_DRIVER === "local") {
    await mkdir(process.env.UPLOAD_DIR!, { recursive: true, mode: 0o750 });
    await writeFile(path.join(process.env.UPLOAD_DIR!, name), buffer, {
      flag: "wx",
      mode: 0o640,
    });
    return `/media/${name}`;
  }
  return (
    await put(`woya/${name}`, buffer, {
      access: "public",
      contentType: "image/webp",
      addRandomSuffix: false,
    })
  ).url;
}

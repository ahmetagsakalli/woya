import sharp from "sharp";
import { z } from "zod";
import { requireAdmin, checkOrigin, rateLimit, readJson, HttpError } from "@/lib/admin/auth";
import { db } from "@/lib/admin/db";
import { failure } from "@/lib/admin/http";
import { imageUrl, type BuilderParts } from "@/lib/admin/schema";
import { readCropSource } from "@/lib/admin/crop-source";
import { storeImage } from "@/lib/admin/storage";
import { cropRegionsSchema, partNames, type CropPart } from "@/lib/crop";
import { rectifyPixels } from "@/lib/perspective-crop";

export const runtime = "nodejs";
export const maxDuration = 60;
const requestSchema = z.object({ source: imageUrl, regions: cropRegionsSchema, save: z.boolean() });
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const actor = await requireAdmin();
    await rateLimit(`crop:${actor}`, 120, 3600);
    const input = requestSchema.parse(await readJson(request, 12000));
    const source = await readCropSource(input.source);
    let decoded;
    try {
      decoded = await sharp(source, { limitInputPixels: 40_000_000 }).rotate().resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    } catch {
      throw new HttpError(400, "Kaynak fotoğraf okunamadı.");
    }
    if (decoded.info.width < 2 || decoded.info.height < 2)
      throw new HttpError(400, "Kaynak fotoğrafın çözünürlüğü yetersiz.");
    const images: Partial<Record<CropPart, string>> = {};
    for (const part of Object.keys(partNames) as CropPart[]) {
      const region = input.regions[part];
      if (!region) continue;
      const result = rectifyPixels(decoded.data, decoded.info.width, decoded.info.height, region, input.save ? 1024 : 420);
      const buffer = await sharp(result.pixels, { raw: { width: result.width, height: result.height, channels: 4 } }).webp({ quality: 92 }).toBuffer();
      if (input.save) {
        const url = await storeImage(new File([new Uint8Array(buffer)], `${part}.webp`, { type: "image/webp" }));
        await db()`INSERT INTO woya_media(url,name) VALUES(${url},${`${partNames[part]} - kırpılmış.webp`})`;
        images[part] = url;
      } else images[part] = `data:image/webp;base64,${buffer.toString("base64")}`;
    }
    if (input.save) {
      await db()`INSERT INTO woya_audit(actor,action,entity) VALUES(${actor},'media:crop',${input.source})`;
      const parts: BuilderParts = { enabled: true, source: input.source, regions: input.regions, center: images.center!, ...(images.left ? { left: images.left, right: images.right! } : {}) };
      return Response.json({ parts }, { headers: { "Cache-Control": "private, no-store" } });
    }
    return Response.json({ images }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return failure(error);
  }
}

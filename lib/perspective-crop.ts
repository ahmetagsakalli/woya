import perspectiveTransform from "perspective-transform";
import { cropRegionSchema, type CropRegion } from "./crop";

export function rectifyPixels(input: Uint8Array, width: number, height: number, region: CropRegion, maxSize = 1024) {
  cropRegionSchema.parse(region);
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 2 || height < 2 || width * height > 40_000_000 || input.length !== width * height * 4 || !Number.isInteger(maxSize) || maxSize < 2 || maxSize > 1024)
    throw new Error("Invalid crop dimensions");
  const outWidth = Math.max(2, Math.round(maxSize * Math.min(1, region.aspect)));
  const outHeight = Math.max(2, Math.round(maxSize / Math.max(1, region.aspect)));
  const transform = perspectiveTransform(
    [0, 0, outWidth - 1, 0, outWidth - 1, outHeight - 1, 0, outHeight - 1],
    region.quad.flatMap((p) => [p.x * (width - 1), p.y * (height - 1)]),
  );
  const pixels = new Uint8Array(outWidth * outHeight * 4);
  for (let y = 0; y < outHeight; y++) {
    for (let x = 0; x < outWidth; x++) {
      const [sx, sy] = transform.transform(x, y);
      if (!Number.isFinite(sx) || !Number.isFinite(sy)) throw new Error("Invalid perspective");
      const px = Math.max(0, Math.min(width - 1, sx)), py = Math.max(0, Math.min(height - 1, sy));
      const x0 = Math.floor(px), y0 = Math.floor(py), x1 = Math.min(width - 1, x0 + 1), y1 = Math.min(height - 1, y0 + 1);
      const dx = px - x0, dy = py - y0, offset = (y * outWidth + x) * 4;
      for (let channel = 0; channel < 4; channel++) {
        const sample = (ix: number, iy: number) => input[(iy * width + ix) * 4 + channel];
        pixels[offset + channel] = Math.round(
          sample(x0, y0) * (1 - dx) * (1 - dy) + sample(x1, y0) * dx * (1 - dy) + sample(x0, y1) * (1 - dx) * dy + sample(x1, y1) * dx * dy,
        );
      }
      if (region.mask === "ellipse") {
        const radius = Math.hypot((x + 0.5 - outWidth / 2) / (outWidth / 2), (y + 0.5 - outHeight / 2) / (outHeight / 2));
        pixels[offset + 3] *= Math.max(0, Math.min(1, (1 - radius) * Math.min(outWidth, outHeight) / 2));
      }
    }
  }
  return { pixels, width: outWidth, height: outHeight };
}
